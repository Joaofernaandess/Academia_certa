import { parseJwt } from './jwt';

export const getUserFromToken = (token) => {
    const decoded = parseJwt(token);

    if (!decoded) {
        return {
            usuarioId: '',
            username: '',
            unidadeOrganizacionalId: '',
            unidadeOrganizacionalNome: '',
            nome: '',
            role: 'Normal',
            isAdmin: false,
            isGestor: false,
            canManage: false
        };
    }

    const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || 'Normal';
    const isAdmin = role === 'Admin';
    const isGestor = role === 'Gestor';

    return {
        usuarioId: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded.nameid || '',
        username: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.unique_name || '',
        unidadeOrganizacionalId: decoded.UnidadeOrganizacionalId || '',
        unidadeOrganizacionalNome: decoded.UnidadeOrganizacionalNome || decoded.NomeUnidadeOrganizacional || decoded.nomeUnidadeOrganizacional || '',
        nome: decoded.Nome || decoded.nome || '',
        cadastroCompleto: decoded.CadastroCompleto === 'True' || decoded.CadastroCompleto === true,
        jornadaUsuario: decoded.JornadaUsuario || '',
        role,
        isAdmin,
        isGestor,
        canManage: isAdmin || isGestor
    };
};