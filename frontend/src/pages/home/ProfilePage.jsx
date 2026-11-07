import { useState } from 'react';
import LoadingButton from '../../components/LoadingButton';
import OrganizationLogoField from '../../components/OrganizationLogoField';
import { enviarLogoOrganizacao, removerLogoOrganizacao } from '../../services/unidadeOrganizacionalService';
import { extrairErro } from '../../utils/apiUtils';
import { validateOrganizationLogo } from '../../utils/organizationLogo';

export default function ProfilePage({
    fieldErrors,
    formData,
    hasChanges,
    onCancel,
    onChange,
    onSubmit,
    isSaving,
    token,
    usuario,
    organizacaoNome,
    organizacaoLogoUrl,
    onOrganizacaoLogoChange
}) {
    const [logoFile, setLogoFile] = useState(null);
    const [logoError, setLogoError] = useState('');
    const [logoMessage, setLogoMessage] = useState('');
    const [isSavingLogo, setIsSavingLogo] = useState(false);

    const handleLogoChange = (file) => {
        setLogoFile(file);
        setLogoError(file ? validateOrganizationLogo(file) : '');
        setLogoMessage('');
    };

    const handleSaveLogo = async () => {
        const validationError = validateOrganizationLogo(logoFile);
        if (validationError) {
            setLogoError(validationError);
            return;
        }

        setIsSavingLogo(true);
        setLogoError('');
        setLogoMessage('');
        try {
            const response = await enviarLogoOrganizacao(usuario.unidadeOrganizacionalId, token, logoFile);
            if (!response.ok) {
                throw new Error(await extrairErro(response) || 'Não foi possível salvar a logo.');
            }
            setLogoFile(null);
            onOrganizacaoLogoChange(true);
            setLogoMessage('Logo da academia atualizada.');
        } catch (error) {
            setLogoError(error.message || 'Não foi possível salvar a logo.');
        } finally {
            setIsSavingLogo(false);
        }
    };

    const handleRemoveLogo = async () => {
        setIsSavingLogo(true);
        setLogoError('');
        setLogoMessage('');
        try {
            const response = await removerLogoOrganizacao(usuario.unidadeOrganizacionalId, token);
            if (!response.ok) {
                throw new Error(await extrairErro(response) || 'Não foi possível remover a logo.');
            }
            setLogoFile(null);
            onOrganizacaoLogoChange(null);
            setLogoMessage('Logo removida. A logo padrão será exibida no menu.');
        } catch (error) {
            setLogoError(error.message || 'Não foi possível remover a logo.');
        } finally {
            setIsSavingLogo(false);
        }
    };

    return (
        <div className="detail-view detail-form-view space-detail-form-view space-create-form-view w-full">
            <div className="detail-heading">
                <h2 className="page-title no-margin">Meu perfil</h2>
            </div>
            <section className="card detail-card organization-logo-card" aria-labelledby="organization-logo-heading">
                <div className="detail-card-body">
                    <div className="organization-logo-heading">
                        <div>
                            <h3 id="organization-logo-heading">Identidade da academia</h3>
                            <p>{organizacaoNome || 'Sua academia'} · A logo é compartilhada com os usuários desta academia.</p>
                        </div>
                    </div>
                    <OrganizationLogoField
                        file={logoFile}
                        existingUrl={organizacaoLogoUrl}
                        error={logoError}
                        disabled={!usuario.isAdmin || usuario.isDemo || isSavingLogo}
                        onChange={handleLogoChange}
                    />
                    {usuario.isAdmin ? (
                        <div className="organization-logo-actions">
                            <LoadingButton
                                type="button"
                                className="button"
                                disabled={usuario.isDemo || !logoFile || Boolean(logoError)}
                                loading={isSavingLogo}
                                onClick={handleSaveLogo}
                            >
                                Salvar logo
                            </LoadingButton>
                            {organizacaoLogoUrl && !usuario.isDemo && (
                                <button
                                    type="button"
                                    className="button button-outline"
                                    disabled={isSavingLogo}
                                    onClick={handleRemoveLogo}
                                >
                                    Remover logo
                                </button>
                            )}
                        </div>
                    ) : (
                        <p className="organization-logo-help">Somente um administrador da academia pode alterar esta logo.</p>
                    )}
                    {usuario.isDemo && (
                        <p className="organization-logo-help">A troca de logo fica desativada na demonstração local.</p>
                    )}
                    {logoMessage && <p className="organization-logo-message" role="status">{logoMessage}</p>}
                </div>
            </section>

            <div className="detail-heading organization-profile-heading">
                <h2 className="page-title no-margin">Dados pessoais</h2>
            </div>
            <form className="detail-form-layout" onSubmit={onSubmit} noValidate>
                <div className="card detail-card detail-form-scroll-card">
                    <div className="detail-card-body">
                        <div className="row detail-form-fields">
                            <div className="column-12 mb-1">
                                <label className="label-sm">Nome</label>
                                <input
                                    type="text"
                                    placeholder="Digite seu nome"
                                    value={formData.nome}
                                    onChange={e => onChange({ ...formData, nome: e.target.value })}
                                    className={`w-full no-field-margin ${fieldErrors.Nome ? 'is-invalid' : ''}`}
                                />
                                {fieldErrors.Nome && <small className="invalid-feedback d-block">{fieldErrors.Nome}</small>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="detail-action-bar detail-action-bar-two">
                    <button type="button" className="button button-outline" onClick={onCancel}>Cancelar</button>
                    <LoadingButton type="submit" className="button" disabled={!hasChanges} loading={isSaving}>
                        Salvar
                    </LoadingButton>
                </div>
            </form>
        </div>
    );
}