import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MessageModal from '../components/MessageModal';
import PasswordInput from '../components/PasswordInput';
import PhoneInput from '../components/PhoneInput';
import ThemeToggle from '../components/ThemeToggle';
import UnidadeComboBox from '../components/UnidadeComboBox';
import ZeniteIcon from '../components/ZeniteIcon';
import { getBaseUrl } from '../utils/apiConfig';
import { aplicarErrosCampos, extrairErro, extrairMensagem } from '../utils/apiUtils';
import { JORNADA_USUARIO_NOME } from '../utils/jornadaUsuario';
import { encryptedJsonBody } from '../utils/payloadCrypto';
import { saveRouteSessionState } from '../utils/routeSessionState';
import LoadingButton from '../components/LoadingButton';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ nome: '', username: '', senha: '', confirmaSenha: '', unidadeOrganizacionalId: '' });
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
            const response = await fetch(`${getBaseUrl()}/v1/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: await encryptedJsonBody(payload)
            });

            if (response.ok) {
                const mensagem = await extrairMensagem(response);
                const routeState = {
                    username: formData.username,
                    unidadeOrganizacionalId: formData.unidadeOrganizacionalId,
                    jornadaUsuario: JORNADA_USUARIO_NOME.CODE_VALIDATE_PAGE,
                    mensagem
                };

                saveRouteSessionState('code-validate', routeState);
                navigate('/code-validate', {
                    replace: true,
                    state: routeState
                });
            } else if (response.status === 400) {
                await aplicarErrosCampos(response, setFieldErrors, setErro);
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
                        <form className="auth-flow-layout auth-register-flow" onSubmit={handleSubmit} noValidate>
                            <div className="auth-flow-header">
                                <h2 className="auth-title">Criar Conta</h2>
                                <ThemeToggle fixo={false} />
                            </div>

                            <div className="auth-flow-body">
                                <div className="mb-1">
                                    <label>
                                        Nome Completo
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Seu nome"
                                        value={formData.nome}
                                        onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                        className={`w-full no-field-margin ${(fieldErrors.Nome || fieldErrors.nome) ? 'is-invalid' : ''}`}
                                    />
                                    {(fieldErrors.Nome || fieldErrors.nome) && <small className="invalid-feedback d-block">{fieldErrors.Nome || fieldErrors.nome}</small>}
                                </div>

                                <PhoneInput
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    error={!!(fieldErrors.Username || fieldErrors.username)}
                                    errorMessage={fieldErrors.Username || fieldErrors.username}
                                />

                                <PasswordInput
                                    label="Senha"
                                    value={formData.senha}
                                    onChange={e => setFormData({ ...formData, senha: e.target.value })}
                                    error={!!(fieldErrors.Senha || fieldErrors.senha)}
                                    errorMessage={fieldErrors.Senha || fieldErrors.senha}
                                />

                                <PasswordInput
                                    label="Confirmar Senha"
                                    placeholder="Confirmar"
                                    value={formData.confirmaSenha}
                                    onChange={e => setFormData({ ...formData, confirmaSenha: e.target.value })}
                                    error={!!(fieldErrors.ConfirmaSenha || fieldErrors.confirmaSenha)}
                                    errorMessage={fieldErrors.ConfirmaSenha || fieldErrors.confirmaSenha}
                                />

                               <UnidadeComboBox
                                    value={formData.unidadeOrganizacionalId}
                                    onChange={val => setFormData({ ...formData, unidadeOrganizacionalId: val })}
                                    error={!!(fieldErrors.UnidadeOrganizacionalId || fieldErrors.unidadeOrganizacionalId)}
                                    errorMessage={fieldErrors.UnidadeOrganizacionalId || fieldErrors.unidadeOrganizacionalId}
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
                                <LoadingButton
                                    type="submit"
                                    className="button button-full"
                                    loading={loading}
                                >
                                    Cadastrar
                                </LoadingButton>
                                <div className="auth-link-row-centered">
                                    <Link className="link-action" to="/login">Já tenho uma conta</Link>
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
