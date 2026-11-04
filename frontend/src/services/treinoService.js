import { getBaseUrl } from '../utils/apiConfig';
import { encryptedFetch } from '../utils/payloadCrypto';
import { authHeaders } from './httpHeaders';

export const listarTreinosUsuario = ({ token, usuarioId }) => (
    fetch(`${getBaseUrl()}/v1/treinos/usuario/${usuarioId}`, {
        headers: authHeaders(token)
    })
);

export const alternarConcluido = ({ token, exercicioId, concluido }) => (
    encryptedFetch(`${getBaseUrl()}/v1/treinos/exercicios/${exercicioId}/concluido`, {
        method: 'PATCH',
        headers: authHeaders(token),
        payload: { concluido }
    })
);