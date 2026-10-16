import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MessageModal from '../components/MessageModal';
import PasswordInput from '../components/PasswordInput';
import ThemeToggle from '../components/ThemeToggle';
import { getBaseUrl } from '../utils/apiConfig';
import { aplicarErrosCampos, extrairErro, extrairMensagem } from '../utils/apiUtils';
import { encryptedJsonBody } from '../utils/payloadCrypto';
import { clearRouteSessionState, readRouteSessionState, saveRouteSessionState } from '../utils/routeSessionState';
import LoadingButton from '../components/LoadingButton';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [resetData] = useState(() => location.state || readRouteSessionState('reset-password') || {});
    const codigoAcessoId = resetData.codigoAcessoId || '';
    const [data, setData] = useState({ senha: '', confirmaSenha: '' });
    const [erro, setErro] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const senhaError = fieldErrors.Senha || fieldErrors.senha || '';
    const confirmaSenhaError = fieldErrors.ConfirmaSenha || fieldErrors.confirmaSenha || fieldErrors.Confirmasenha || fieldErrors.confirmasenha || '';
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!codigoAcessoId) {
            navigate('/forgot-password', { replace: true });
            return;
        }

        saveRouteSessionState('reset-password', { codigoAcessoId });
    }, [codigoAcessoId, navigate]);

    const handleReset = async (e) => {
        e.preventDefault();

        if (loading) return;

        setErro('');
        setFieldErrors({});
        setLoading(true);
        
        try {
            const res = await fetch(`${getBaseUrl()}/v1/auth/reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: await encryptedJsonBody({ codigoAcessoId, senha: data.senha, confirmaSenha: data.confirmaSenha })
            });

            if (res.ok) {
                const mensagem = await extrairMensagem(res);
                clearRouteSessionState('reset-password');
                setSuccessMessage(mensagem);
                if (mensagem) setShowSuccessModal(true);
            } else if (res.status === 400) {
                await aplicarErrosCampos(res, setFieldErrors, setErro);
            } else {
                setErro(await extrairErro(res));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="container">
                <div className="auth-page auth-page-flow">
                    <div className="auth-page-theme">
                        <ThemeToggle fixo={false} />
                    </div>
                    <div className="card auth-card auth-card-fixed auth-card-flow">
                        <form className="auth-flow-layout" onSubmit={handleReset} noValidate>
                            <div className="auth-flow-header">
                                <h2 className="auth-title">Redefinir Senha</h2>
                                <ThemeToggle fixo={false} />
                            </div>

                            <div className="auth-flow-body">
                                <PasswordInput
                                    label="Nova Senha"
                                    value={data.senha}
                                    onChange={e => setData({ ...data, senha: e.target.value })}
                                    error={!!senhaError}
                                    errorMessage={senhaError}
                                />
                                <PasswordInput
                                    label="Confirmar Nova Senha"
                                    value={data.confirmaSenha}
                                    onChange={e => setData({ ...data, confirmaSenha: e.target.value })}
                                    error={!!confirmaSenhaError}
                                    errorMessage={confirmaSenhaError}
                                />
                            </div>

                            <div className="auth-flow-footer">
                                <LoadingButton type="submit" className="button button-full" loading={loading}>
                                    Redefinir Senha
                                </LoadingButton>
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

            {showSuccessModal && (
                <MessageModal
                    type="success"
                    message={successMessage}
                    onClose={() => navigate('/login')}
                    buttonLabel="Login"
                    autoClose={8000}
                />
            )}
        </>
    );
}
