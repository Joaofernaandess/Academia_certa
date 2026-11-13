import { Navigate, Route, Routes } from 'react-router-dom';
import AprovarUnidadeOrganizacionalView from '../components/AprovarEmpresasView';
import GerenciarPerfisView from '../components/GerenciarPerfisView';
import ValidarUsuariosView from '../components/ValidarUsuariosView';
import EquipamentosPage from '../pages/equipamentos/EquipamentosPage';
import NovoEquipamentoPage from '../pages/equipamentos/NovoEquipamentoPage';
import ExerciciosPage from '../pages/exercicios/ExerciciosPage';
import NovoExercicioPage from '../pages/exercicios/NovoExercicioPage';
import EquipamentosAvaliadosPage from '../pages/feedback/EquipamentosAvaliadosPage';
import FeedbackEquipamentoPage from '../pages/feedback/FeedbackEquipamentoPage';
import HomeHero from '../pages/home/HomeHero';
import InstallIosPage from '../pages/home/InstallIosPage';
import ProfilePage from '../pages/home/ProfilePage';
import NovoTreinoPage from '../pages/treinos/NovoTreinoPage';
import TreinosPage from '../pages/treinos/TreinosPage';

export default function AuthenticatedRoutes({
    fieldErrors,
    formData,
    hasProfileChanges,
    isAdmin,
    canManage,
    onCancelProfile,
    onChangeProfile,
    onSubmitProfile,
    token,
    unidadeOrganizacionalId,
    usuarioId,
    isSavingProfile
}) {
    return (
        <Routes>
            <Route index element={<HomeHero />} />

            <Route path="treinos"
                element={
                    <TreinosPage
                        token={token}
                        unidadeOrganizacionalId={unidadeOrganizacionalId}
                        usuarioId={usuarioId}
                        usuarioNome={formData.nome}
                        canManage={canManage}
                    />
                }
            />
            <Route path="treinos/novo" element={<NovoTreinoPage token={token} unidadeOrganizacionalId={unidadeOrganizacionalId} usuarioId={usuarioId} canManage={canManage} />} />
            <Route path="treinos/:treinoId/editar" element={<NovoTreinoPage token={token} unidadeOrganizacionalId={unidadeOrganizacionalId} usuarioId={usuarioId} canManage={canManage} />} />

            <Route path="equipamentos" element={<EquipamentosPage token={token} unidadeOrganizacionalId={unidadeOrganizacionalId} canManage={canManage} />} />
            <Route path="equipamentos/novo" element={canManage ? <NovoEquipamentoPage token={token} unidadeOrganizacionalId={unidadeOrganizacionalId} /> : <Navigate to="/equipamentos" replace />} />
            <Route path="equipamentos/:equipamentoId/editar" element={canManage ? <NovoEquipamentoPage token={token} unidadeOrganizacionalId={unidadeOrganizacionalId} /> : <Navigate to="/equipamentos" replace />} />

            <Route path="exercicios" element={<ExerciciosPage token={token} unidadeOrganizacionalId={unidadeOrganizacionalId} canManage={canManage} />} />
            <Route path="exercicios/novo" element={canManage ? <NovoExercicioPage token={token} unidadeOrganizacionalId={unidadeOrganizacionalId} /> : <Navigate to="/exercicios" replace />} />
            <Route path="exercicios/:exercicioId/editar" element={canManage ? <NovoExercicioPage token={token} unidadeOrganizacionalId={unidadeOrganizacionalId} /> : <Navigate to="/exercicios" replace />} />

            <Route path="feedback" element={<FeedbackEquipamentoPage token={token} unidadeOrganizacionalId={unidadeOrganizacionalId} usuarioId={usuarioId} canManage={canManage} />} />
            <Route path="equipamentos-avaliados" element={canManage ? <EquipamentosAvaliadosPage token={token} unidadeOrganizacionalId={unidadeOrganizacionalId} /> : <Navigate to="/" replace />} />

            <Route path="gerenciar-perfis" element={isAdmin ? <GerenciarPerfisView token={token} unidadeOrganizacionalId={unidadeOrganizacionalId} /> : <Navigate to="/" replace />} />
            <Route path="aprovar-usuarios" element={isAdmin ? <ValidarUsuariosView token={token} /> : <Navigate to="/" replace />} />
            <Route path="aprovar-empresas" element={isAdmin ? <AprovarUnidadeOrganizacionalView token={token} /> : <Navigate to="/" replace />} />

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
                    />
                }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}