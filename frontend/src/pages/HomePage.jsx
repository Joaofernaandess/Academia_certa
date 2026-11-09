import { useEffect, useMemo, useState } from 'react';
import MessageModal from '../components/MessageModal';
import AppHeader from '../components/layout/AppHeader';
import LogoutModal from '../components/layout/LogoutModal';
import Sidebar from '../components/layout/Sidebar';
import { useProfileForm } from '../hooks/useProfileForm';
import { usePwaInstall } from '../hooks/usePwaInstall';
import AuthenticatedRoutes from '../routes/AuthenticatedRoutes';
import { getNomeExibicaoUnidade, obterUnidadeOrganizacional } from '../services/unidadeOrganizacionalService';
import { getBaseUrl } from '../utils/apiConfig';
import { getUserFromToken } from '../utils/authUser';

export default function HomePage({ token, onLogout }) {
    const usuario = useMemo(() => getUserFromToken(token), [token]);

    const {
        erro,
        sucesso,
        fieldErrors,
        formData,
        hasChanges,
        setFormData,
        handleUpdateData,
        handleCancelProfile,
        clearMessages,
        isSaving
    } = useProfileForm({ token, usuario });

    const pwaInstall = usePwaInstall();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [nomeUnidadeOrganizacional, setNomeUnidadeOrganizacional] = useState(usuario.unidadeOrganizacionalNome || '');
    const [logoUnidadeOrganizacional, setLogoUnidadeOrganizacional] = useState('');

    useEffect(() => {
        let cancelado = false;
        setNomeUnidadeOrganizacional(usuario.unidadeOrganizacionalNome || '');

        if (!usuario.unidadeOrganizacionalId) {
            setLogoUnidadeOrganizacional('');
            return () => { cancelado = true; };
        }

        obterUnidadeOrganizacional(usuario.unidadeOrganizacionalId)
            .then(res => (res.ok ? res.json() : null))
            .then(data => {
                if (cancelado || !data) return;
                if (!usuario.unidadeOrganizacionalNome) {
                    setNomeUnidadeOrganizacional(getNomeExibicaoUnidade(data));
                }
                setLogoUnidadeOrganizacional(data.logoUrl ? `${getBaseUrl()}${data.logoUrl}` : '');
            })
            .catch(() => {
                if (!cancelado) setLogoUnidadeOrganizacional('');
            });

        return () => { cancelado = true; };
    }, [token, usuario.unidadeOrganizacionalId, usuario.unidadeOrganizacionalNome]);

    const handleOrganizationLogoChange = (hasLogo) => {
        setLogoUnidadeOrganizacional(hasLogo ? `${getBaseUrl()}/v1/unidades-organizacionais/${usuario.unidadeOrganizacionalId}/logo?v=${Date.now()}` : '');
    };

    return (
        <div className="app-shell">
            <input type="checkbox" id="menu-toggle" className="sidebar-checkbox" />
            <AppHeader />
            <Sidebar
                isInstalled={pwaInstall.isInstalled}
                organizacaoNome={nomeUnidadeOrganizacional}
                organizacaoLogoUrl={logoUnidadeOrganizacional}
                onInstallClick={pwaInstall.install}
                onLogoutClick={() => setShowLogoutModal(true)}
                usuarioNome={usuario.nome}
            />
            <main className="container app-main">
                <AuthenticatedRoutes
                    fieldErrors={fieldErrors}
                    formData={formData}
                    hasProfileChanges={hasChanges}
                    onCancelProfile={handleCancelProfile}
                    onChangeProfile={setFormData}
                    onSubmitProfile={handleUpdateData}
                    token={token}
                    isSavingProfile={isSaving}
                    usuario={usuario}
                    organizacaoNome={nomeUnidadeOrganizacional}
                    organizacaoLogoUrl={logoUnidadeOrganizacional}
                    onOrganizacaoLogoChange={handleOrganizationLogoChange}
                />
            </main>

            {showLogoutModal && (
                <LogoutModal
                    onCancel={() => setShowLogoutModal(false)}
                    onConfirm={onLogout}
                />
            )}

            {(erro || sucesso) && (
                <MessageModal
                    type={erro ? 'error' : 'success'}
                    message={erro || sucesso}
                    onClose={clearMessages}
                    autoClose={8000}
                />
            )}
        </div>
    );
}
