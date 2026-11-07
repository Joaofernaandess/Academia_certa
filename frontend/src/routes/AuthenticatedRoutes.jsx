import { Navigate, Route, Routes } from 'react-router-dom';
import EquipamentosPage from '../pages/equipamentos/EquipamentosPage';
import NovoEquipamentoPage from '../pages/equipamentos/NovoEquipamentoPage';
import FeedbackEquipamentoPage from '../pages/feedback/FeedbackEquipamentoPage';
import HomeHero from '../pages/home/HomeHero';
import InstallIosPage from '../pages/home/InstallIosPage';
import ManagementPage from '../pages/home/ManagementPage';
import ProfilePage from '../pages/home/ProfilePage';
import TreinosPage from '../pages/treinos/TreinosPage';
import NovoTreinoPage from '../pages/treinos/NovoTreinoPage';

export default function AuthenticatedRoutes({
    fieldErrors,
    formData,
    hasProfileChanges,
    onCancelProfile,
    onChangeProfile,
    onSubmitProfile,
    token,
    isSavingProfile,
    usuario,
    organizacaoNome,
    organizacaoLogoUrl,
    onOrganizacaoLogoChange
}) {
    return (
        <Routes>
            <Route index element={<HomeHero />} />
            <Route path="alunos" element={<ManagementPage tipo="alunos" token={token} />} />
            <Route path="planos" element={<ManagementPage tipo="planos" token={token} />} />
            <Route path="instrutores" element={<ManagementPage tipo="instrutores" token={token} />} />
            <Route path="controle-pagamentos" element={<ManagementPage tipo="pagamentos" token={token} />} />
            <Route path="treinos" element={<TreinosPage token={token} usuarioId={usuario?.usuarioId} usuarioNome={formData.nome} />} />
            <Route path="treinos/novo" element={<NovoTreinoPage token={token} unidadeOrganizacionalId={usuario?.unidadeOrganizacionalId} usuarioId={usuario?.usuarioId} />} />
            <Route path="equipamentos" element={<EquipamentosPage token={token} unidadeOrganizacionalId={usuario?.unidadeOrganizacionalId} />} />
            <Route path="equipamentos/novo" element={<NovoEquipamentoPage token={token} unidadeOrganizacionalId={usuario?.unidadeOrganizacionalId} />} />
            <Route path="feedback" element={<FeedbackEquipamentoPage token={token} unidadeOrganizacionalId={usuario?.unidadeOrganizacionalId} usuarioId={usuario?.usuarioId} />} />
            <Route path="instalar-ios" element={<InstallIosPage />} />

            <Route
                path="meus-dados"
                element={
                    <ProfilePage
                        fieldErrors={fieldErrors}
                        formData={formData}
                        hasChanges={hasProfileChanges}
                        onCancel={onCancelProfile}
                        onChange={onChangeProfile}
                        onSubmit={onSubmitProfile}
                        isSaving={isSavingProfile}
                        token={token}
                        usuario={usuario}
                        organizacaoNome={organizacaoNome}
                        organizacaoLogoUrl={organizacaoLogoUrl}
                        onOrganizacaoLogoChange={onOrganizacaoLogoChange}
                    />
                }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}