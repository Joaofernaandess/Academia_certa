import { Navigate, Route, Routes } from 'react-router-dom';
import AprovarUnidadeOrganizacionalView from '../components/AprovarEmpresasView';
import ValidarUsuariosView from '../components/ValidarUsuariosView';
import HomeHero from '../pages/home/HomeHero';
import InstallIosPage from '../pages/home/InstallIosPage';
import ProfilePage from '../pages/home/ProfilePage';

export default function AuthenticatedRoutes({
    fieldErrors,
    formData,
    hasProfileChanges,
    isAdmin,
    onCancelProfile,
    onChangeProfile,
    onSubmitProfile,
    token,
    isSavingProfile
}) {
    return (
        <Routes>
            <Route index element={<HomeHero />} />
            
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