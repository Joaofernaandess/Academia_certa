import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingButton from '../components/LoadingButton';
import MessageModal from '../components/MessageModal';
import ThemeToggle from '../components/ThemeToggle';
import { getBaseUrl } from '../utils/apiConfig';
import { aplicarErrosCampos, extrairErro, extrairErrosCampos, extrairMensagem } from '../utils/apiUtils';
import { isCodeValidateJourney, isWaitingApprovalJourney } from '../utils/jornadaUsuario';
import { decryptEncryptedResponse, encryptedJsonBody, encryptedJsonBodyWithKey } from '../utils/payloadCrypto';
import { clearRouteSessionState, readRouteSessionState, saveRouteSessionState } from '../utils/routeSessionState';

export default function CodeValidatePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [recoveryData] = useState(() => location.state || readRouteSessionState('code-validate') || {});
    const isCadastro = isCodeValidateJourney(recoveryData.jornadaUsuario);
    const [code, setCode] = useState('');
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [cooldownReenvio, setCooldownReenvio] = useState(0);
    const codeError = fieldErrors.Code || fieldErrors.code || fieldErrors.Codigo || fieldErrors.codigo || '';
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        if (!recoveryData.username || !recoveryData.unidadeOrganizacionalId) {
            navigate(isCadastro ? '/login' : '/forgot-password', { replace: true });
            return;
        }

        saveRouteSessionState('code-validate', recoveryData);
    }, [isCadastro, navigate, recoveryData.unidadeOrganizacionalId, recoveryData.username]);

    useEffect(() => {
        if (cooldownReenvio <= 0) return undefined;

        const timer = setTimeout(() => {
            setCooldownReenvio(prev => Math.max(prev - 1, 0));
        }, 1000);

        return () => clearTimeout(timer);
    }, [cooldownReenvio]);

    const iniciarCooldownReenvio = () => {
        setCooldownReenvio(300);
    };

    const formatCooldown = (seconds) => {
        const minutos = Math.floor(seconds / 60).toString().padStart(2, '0');
        const segundos = (seconds % 60).toString().padStart(2, '0');

        return `${minutos}:${segundos}`;
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();

        if (isVerifying || isResending) return;

        setErro('');
        setFieldErrors({});
        setIsVerifying(true);

        try {
            const encryptedRequest = await encryptedJsonBodyWithKey({
                code,
                username: recoveryData.username,
                unidadeOrganizacionalId: recoveryData.unidadeOrganizacionalId
            });
            const res = await fetch(`${getBaseUrl()}/v1/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: encryptedRequest.body
            });

            if (res.ok) {
                const result = await decryptEncryptedResponse(await res.json(), encryptedRequest.aesKey);
                const message = result.message || result.Message || '';
                const jornadaUsuario = result.jornadaUsuario || result.JornadaUsuario;
                const codigoAcessoId =
                    result.codigoAcessoId ||
                    result.codigoResetId ||
                    result.CodigoAcessoId ||
                    result.CodigoResetId ||
                    '';

                if (isWaitingApprovalJourney(jornadaUsuario)) {
                    clearRouteSessionState('code-validate');
                    navigate('/waiting-approval', { replace: true });
                    return;
                }

                clearRouteSessionState('code-validate');
                saveRouteSessionState('reset-password', { codigoAcessoId });
                navigate('/reset-password', {
                    replace: true,
                    state: {
                        codigoAcessoId
                    }
                });
            } else if (res.status === 400) {
                const { fieldErrors, message } = await extrairErrosCampos(res);
                setFieldErrors(Object.keys(fieldErrors).length > 0 ? fieldErrors : { Code: message });
            } else {
                setErro(await extrairErro(res));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleReenviarCodigo = async () => {
        if (isVerifying || isResending || cooldownReenvio > 0) return;

        setErro('');
        setSucesso('');
        setFieldErrors({});
        setIsResending(true);

        try {
            const res = await fetch(`${getBaseUrl()}${isCadastro ? '/v1/auth/registration-code' : '/v1/auth/forgot'}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: await encryptedJsonBody({
                    username: recoveryData.username,
                    unidadeOrganizacionalId: recoveryData.unidadeOrganizacionalId
                })
            });

            if (res.ok) {
                const mensagem = await extrairMensagem(res);
                if (mensagem) setSucesso(mensagem);
                setCode('');
                iniciarCooldownReenvio();
            } else if (res.status === 400) {
                await aplicarErrosCampos(res, setFieldErrors, setErro);
            } else {
                setErro(await extrairErro(res));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsResending(false);
        }
    };

    const handleVoltar = () => {
        clearRouteSessionState('code-validate');
        navigate(isCadastro ? '/login' : '/forgot-password');
    };

    return (
        <>
            <div className="container">
                <div className="auth-page auth-page-flow">
                    <div className="auth-page-theme">
                        <ThemeToggle fixo={false} />
                    </div>
                    <div className="card auth-card auth-card-fixed auth-card-flow">
                        <form className="auth-flow-layout" onSubmit={handleVerifyCode} noValidate>
                            <div className="auth-flow-header">
                                <h2 className="auth-title">Validar Código</h2>
                                <ThemeToggle fixo={false} />
                            </div>

                            <div className="auth-flow-body">
                                <div className="mb-1">
                                    <label>Código Enviado pelo Whatsapp</label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={e => {
                                            setCode(e.target.value);
                                            setFieldErrors(prev => ({
                                                ...prev,
                                                Code: '',
                                                code: '',
                                                Codigo: '',
                                                codigo: ''
                                            }));
                                        }}
                                        className={`w-full no-field-margin ${codeError ? 'is-invalid' : ''}`}
                                    />
                                    {codeError && <small className="invalid-feedback d-block">{codeError}</small>}
                                </div>
                            </div>

                            <div className="auth-flow-footer">
                                <LoadingButton type="submit" className="button button-full" loading={isVerifying}>
                                    Verificar
                                </LoadingButton>
                                <div className="auth-link-row">
                                    <button
                                        type="button"
                                        className="link-action button-link"
                                        onClick={handleReenviarCodigo}
                                        disabled={cooldownReenvio > 0}
                                    >
                                        {cooldownReenvio > 0
                                            ? `Reenviar ${formatCooldown(cooldownReenvio)}`
                                            : 'Reenviar código'}
                                    </button>
                                    <button type="button" className="link-action button-link" onClick={handleVoltar}>
                                        Voltar
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {erro && (
                <MessageModal
                    type="error"
                    message={erro}
                    onClose={() => setErro('')}
                    autoClose={8000}
                />
            )}

            {sucesso && (
                <MessageModal
                    type="success"
                    message={sucesso}
                    onClose={() => setSucesso('')}
                    autoClose={8000}
                />
            )}
        </>
    );
}
