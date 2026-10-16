import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingButton from '../components/LoadingButton';
import MessageModal from '../components/MessageModal';
import PhoneInput from '../components/PhoneInput';
import ThemeToggle from '../components/ThemeToggle';
import UnidadeComboBox from '../components/UnidadeComboBox';
import ZeniteIcon from '../components/ZeniteIcon';
import { getBaseUrl } from '../utils/apiConfig';
import { aplicarErrosCampos, extrairErro, extrairMensagem } from '../utils/apiUtils';
import { encryptedJsonBody } from '../utils/payloadCrypto';
import { saveRouteSessionState } from '../utils/routeSessionState';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [data, setData] = useState({ username: '', unidadeOrganizacionalId: '' });
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleForgot = async (e) => {
        e.preventDefault();

        if (loading) return;

        setErro('');
        setSucesso('');
        setFieldErrors({});
        setLoading(true);

        try {
            const res = await fetch(`${getBaseUrl()}/v1/auth/forgot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: await encryptedJsonBody({
                    username: data.username,
                    unidadeOrganizacionalId: data.unidadeOrganizacionalId === '' ? null : data.unidadeOrganizacionalId
                })
            });

            if (res.ok) {
                const mensagem = await extrairMensagem(res);
                const routeState = {
                    username: data.username,
                    unidadeOrganizacionalId: data.unidadeOrganizacionalId,
                    mensagem
                };

                saveRouteSessionState('code-validate', routeState);
                navigate('/code-validate', {
                    state: routeState
                });
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
                        <form className="auth-flow-layout" onSubmit={handleForgot} noValidate>
                            <div className="auth-flow-header">
                                <h2 className="auth-title">Recuperar Acesso</h2>
                                <ThemeToggle fixo={false} />
                            </div>

                            <div className="auth-flow-body">
                                <PhoneInput
                                    value={data.username}
                                    onChange={e => setData({ ...data, username: e.target.value })}
                                    error={!!fieldErrors.Username}
                                    errorMessage={fieldErrors.Username}
                                />
                                <UnidadeComboBox
                                    value={data.unidadeOrganizacionalId}
                                    onChange={val => setData({ ...data, unidadeOrganizacionalId: val })}
                                    error={!!fieldErrors.UnidadeOrganizacionalId}
                                    errorMessage={fieldErrors.UnidadeOrganizacionalId}
                                    action={
                                        <button
                                            type="button"
                                            className="button zf-input-with-action__button"
                                            aria-label="Registrar unidade organizacional"
                                            onClick={() => navigate('/unidades-organizacionais/novo')}
                                        >
                                            <ZeniteIcon name="plus" size={22} />
                                        </button>
                                    }
                                />
                            </div>

                            <div className="auth-flow-footer">
                                <LoadingButton type="submit" className="button button-full" loading={loading}>
                                    Enviar Código
                                </LoadingButton>
                                <div className="auth-link-row-centered">
                                    <Link className="link-action" to="/login">Cancelar</Link>
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
