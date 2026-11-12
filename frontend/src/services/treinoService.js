import { getBaseUrl } from '../utils/apiConfig';
import { encryptedFetch } from '../utils/payloadCrypto';
import { authHeaders } from './httpHeaders';

export const criarTreino = ({ token, payload }) => (
    encryptedFetch(`${getBaseUrl()}/v1/treinos`, {
        method: 'POST',
        headers: authHeaders(token),
        payload
    })
);

export const atualizarTreino = ({ token, treinoId, payload }) => (
    encryptedFetch(`${getBaseUrl()}/v1/treinos/${treinoId}`, {
        method: 'PUT',
        headers: authHeaders(token),
        payload
    })
);

export const excluirTreino = ({ token, treinoId }) => (
    fetch(`${getBaseUrl()}/v1/treinos/${treinoId}`, {
        method: 'DELETE',
        headers: authHeaders(token)
    })
);

export const obterTreino = ({ token, treinoId }) => (
    fetch(`${getBaseUrl()}/v1/treinos/${treinoId}`, {
        headers: authHeaders(token)
    })
);

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