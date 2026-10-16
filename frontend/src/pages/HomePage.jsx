import { useEffect, useMemo, useState } from 'react';
import MessageModal from '../components/MessageModal';
import AppHeader from '../components/layout/AppHeader';
import LogoutModal from '../components/layout/LogoutModal';
import Sidebar from '../components/layout/Sidebar';
import { useProfileForm } from '../hooks/useProfileForm';
import { usePwaInstall } from '../hooks/usePwaInstall';
import AuthenticatedRoutes from '../routes/AuthenticatedRoutes';
import { getNomeExibicaoUnidade, obterUnidadeOrganizacional } from '../services/unidadeOrganizacionalService';
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

    useEffect(() => {
        let cancelado = false;
        if (usuario.unidadeOrganizacionalNome) {
            setNomeUnidadeOrganizacional(usuario.unidadeOrganizacionalNome);
            return () => { cancelado = true; };
        }

        if (!usuario.unidadeOrganizacionalId) {
            setNomeUnidadeOrganizacional('');
            return () => { cancelado = true; };
        }

        obterUnidadeOrganizacional(usuario.unidadeOrganizacionalId)
            .then(res => (res.ok ? res.json() : null))
            .then(data => {
                if (cancelado || !data) return;
                setNomeUnidadeOrganizacional(getNomeExibicaoUnidade(data));
            })
            .catch(() => {
                if (!cancelado) setNomeUnidadeOrganizacional('');
            });

        return () => { cancelado = true; };
    }, [usuario.unidadeOrganizacionalId, usuario.unidadeOrganizacionalNome]);

    const isCebudv = nomeUnidadeOrganizacional?.toUpperCase().startsWith('CEBUDV');

    return (
        <div className="app-shell">
            <input type="checkbox" id="menu-toggle" className="sidebar-checkbox" />
            <AppHeader />
            <Sidebar
                isAdmin={usuario.isAdmin}
                isInstalled={pwaInstall.isInstalled}
                organizacaoNome={nomeUnidadeOrganizacional}
                onInstallClick={pwaInstall.install}
                onLogoutClick={() => setShowLogoutModal(true)}
                usuarioNome={usuario.nome}
            />
            <main className="container app-main">
                <AuthenticatedRoutes
                    fieldErrors={fieldErrors}
                    formData={formData}
                    hasProfileChanges={hasChanges}
                    isAdmin={usuario.isAdmin}
                    isCebudv={isCebudv}
                    onCancelProfile={handleCancelProfile}
                    onChangeProfile={setFormData}
                    onSubmitProfile={handleUpdateData}
                    token={token}
                    unidadeOrganizacionalId={formData.unidadeOrganizacionalId}
                    usuarioId={usuario.usuarioId}
                    isSavingProfile={isSaving}
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
