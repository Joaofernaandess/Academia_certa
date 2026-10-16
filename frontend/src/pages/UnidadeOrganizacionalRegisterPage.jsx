import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MessageModal from '../components/MessageModal';
import PhoneInput from '../components/PhoneInput';
import ThemeToggle from '../components/ThemeToggle';
import { getBaseUrl } from '../utils/apiConfig';
import { aplicarErrosCampos, extrairErro } from '../utils/apiUtils';
import { formatCnpj } from '../utils/cnpj';
import { encryptedJsonBody } from '../utils/payloadCrypto';
import LoadingButton from '../components/LoadingButton';

export default function UnidadeOrganizacionalRegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        razaoSocial: '',
        cnpj: '',
        telefone: '',
        email: ''
    });
    const [erro, setErro] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const setCampo = (campo, valor) => {
        setFormData(prev => ({ ...prev, [campo]: valor }));
        setFieldErrors(prev => ({
            ...prev,
            [campo]: '',
            [campo[0].toUpperCase() + campo.slice(1)]: ''
        }));
    };

    const getErroCampo = (...campos) => campos.map(campo => fieldErrors[campo]).find(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setErro('');
        setFieldErrors({});
        setLoading(true);

        try {
            const response = await fetch(`${getBaseUrl()}/v1/unidades-organizacionais`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: await encryptedJsonBody(formData)
            });

            if (response.ok) {
                navigate('/empresa-aguardando-aprovacao', { replace: true });
                return;
            }

            if (response.status === 400) {
                await aplicarErrosCampos(response, setFieldErrors, setErro);
                return;
            }

            setErro(await extrairErro(response));
        } catch (error) {
            setErro(error.message);
        } finally {
            setLoading(false);
        }
    };

    const erroRazaoSocial = getErroCampo('RazaoSocial', 'razaoSocial');
    const erroCnpj = getErroCampo('Cnpj', 'cnpj', 'CNPJ');
    const erroTelefone = getErroCampo('Telefone', 'telefone');
    const erroEmail = getErroCampo('Email', 'email');

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
                                <h2 className="auth-title">Cadastrar empresa</h2>
                                <ThemeToggle fixo={false} />
                            </div>

                            <div className="auth-flow-body">
                                <div className="mb-1">
                                    <label>Razão Social</label>
                                    <input
                                        name="RazaoSocial"
                                        type="text"
                                        value={formData.razaoSocial}
                                        onChange={event => setCampo('razaoSocial', event.target.value)}
                                        className={`w-full no-field-margin ${erroRazaoSocial ? 'is-invalid' : ''}`}
                                        placeholder="Digite a razão social"
                                    />
                                    {erroRazaoSocial && <small className="invalid-feedback d-block">{erroRazaoSocial}</small>}
                                </div>

                                <div className="mb-1">
                                    <label>CNPJ</label>
                                    <input
                                        name="Cnpj"
                                        type="text"
                                        value={formatCnpj(formData.cnpj)}
                                        onChange={event => setCampo('cnpj', event.target.value.replace(/\D/g, '').slice(0, 14))}
                                        className={`w-full no-field-margin ${erroCnpj ? 'is-invalid' : ''}`}
                                        placeholder="00.000.000/0000-00"
                                        inputMode="numeric"
                                    />
                                    {erroCnpj && <small className="invalid-feedback d-block">{erroCnpj}</small>}
                                </div>

                                <PhoneInput
                                    label="Telefone"
                                    value={formData.telefone}
                                    onChange={event => setCampo('telefone', event.target.value)}
                                    error={!!erroTelefone}
                                    errorMessage={erroTelefone}
                                />

                                <div className="mb-1">
                                    <label>Email</label>
                                    <input
                                        name="Email"
                                        type="email"
                                        value={formData.email}
                                        onChange={event => setCampo('email', event.target.value)}
                                        className={`w-full no-field-margin ${erroEmail ? 'is-invalid' : ''}`}
                                        placeholder="email@empresa.com"
                                    />
                                    {erroEmail && <small className="invalid-feedback d-block">{erroEmail}</small>}
                                </div>
                            </div>

                            <div className="auth-flow-footer">
                                <LoadingButton type="submit" className="button button-full" loading={loading}>
                                    Cadastrar
                                </LoadingButton>
                                <div className="auth-link-row-centered">
                                    <Link className="link-action" to="/login">Voltar</Link>
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
