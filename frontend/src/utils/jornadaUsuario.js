export const JORNADA_USUARIO = Object.freeze({
    REGISTER_PAGE: 1,
    CODE_VALIDATE_PAGE: 2,
    WAITING_APPROVAL_PAGE: 3,
    COMPLETED: 4
});

export const JORNADA_USUARIO_NOME = Object.freeze({
    REGISTER_PAGE: 'RegisterPage',
    CODE_VALIDATE_PAGE: 'CodeValidatePage',
    WAITING_APPROVAL_PAGE: 'WaitingApprovalPage',
    COMPLETED: 'Completed'
});

export const isCodeValidateJourney = (jornadaUsuario) =>
    jornadaUsuario === JORNADA_USUARIO_NOME.CODE_VALIDATE_PAGE ||
    jornadaUsuario === JORNADA_USUARIO.CODE_VALIDATE_PAGE;

export const isWaitingApprovalJourney = (jornadaUsuario) =>
    jornadaUsuario === JORNADA_USUARIO_NOME.WAITING_APPROVAL_PAGE ||
    jornadaUsuario === JORNADA_USUARIO.WAITING_APPROVAL_PAGE;
