import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MessageModal from '../components/MessageModal';
import PasswordInput from '../components/PasswordInput';
import PhoneInput from '../components/PhoneInput';
import ThemeToggle from '../components/ThemeToggle';
import UnidadeComboBox from '../components/UnidadeComboBox';
import ZeniteIcon from '../components/ZeniteIcon';
import { getBaseUrl } from '../utils/apiConfig';
import { aplicarErrosCampos, extrairErro } from '../utils/apiUtils';
import { isCodeValidateJourney, isWaitingApprovalJourney } from '../utils/jornadaUsuario';
import { encryptedJsonBody } from '../utils/payloadCrypto';
import { saveRouteSessionState } from '../utils/routeSessionState';
import LoadingButton from '../components/LoadingButton';

export default function LoginPage({ onLogin, onPendingApproval }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', senha: '', unidadeOrganizacionalId: '' });
    const [erro, setErro] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setErro('');
        setFieldErrors({});
        setLoading(true);

        const payload = {
            ...formData,
            unidadeOrganizacionalId: formData.unidadeOrganizacionalId === '' ? null : formData.unidadeOrganizacionalId
        };

        try {
            const response = await fetch(`${getBaseUrl()}/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: await encryptedJsonBody(payload)
            });

            if (response.ok) {
                const data = await response.json();
                if (isCodeValidateJourney(data.jornadaUsuario)) {
                    const routeState = {
                        username: formData.username,
                        unidadeOrganizacionalId: formData.unidadeOrganizacionalId,
                        jornadaUsuario: data.jornadaUsuario,
                        mensagem: data.message
                    };

                    saveRouteSessionState('code-validate', routeState);
                    navigate('/code-validate', {
                        replace: true,
                        state: routeState
                    });
                    return;
                }

                if (isWaitingApprovalJourney(data.jornadaUsuario)) {
                    if (onPendingApproval) {
                        onPendingApproval(data.message);
                    } else {
                        navigate('/waiting-approval', { replace: true });
                    }
                    return;
                }

                if (data.token) onLogin(data.token);
            } else if (response.status === 400) {
                await aplicarErrosCampos(response, setFieldErrors, setErro);
            } else if (response.status === 403) {
                const mensagem = await extrairErro(response);
                if (mensagem && onPendingApproval) {
                    onPendingApproval(mensagem);
                } else if (mensagem) {
                    setErro(mensagem);
                }
            } else {
                const mensagem = await extrairErro(response);
                setErro(mensagem);
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
                        <form className="auth-flow-layout" onSubmit={handleSubmit} noValidate>
                            <div className="auth-flow-header">
                                <h2 className="auth-title">Login</h2>
                                <ThemeToggle fixo={false} />
                            </div>

                            <div className="auth-flow-body">
                                <PhoneInput
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    error={!!fieldErrors.Username}
                                    errorMessage={fieldErrors.Username}
                                />

                                <PasswordInput
                                    label="Senha"
                                    placeholder="******"
                                    value={formData.senha}
                                    onChange={e => setFormData({ ...formData, senha: e.target.value })}
                                    error={!!fieldErrors.Senha}
                                    errorMessage={fieldErrors.Senha}
                                />

                                <UnidadeComboBox
                                    value={formData.unidadeOrganizacionalId}
                                    onChange={val => setFormData({ ...formData, unidadeOrganizacionalId: val })}
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
                                    Entrar
                                </LoadingButton>
                                <div className="auth-link-row">
                                    <Link className="link-action" to="/register" loading={loading}>
                                        Registrar
                                    </Link>
                                    <Link className="link-action" to="/forgot-password" loading={loading}>
                                        Esqueci a senha
                                    </Link>
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
        </>
    );
}
