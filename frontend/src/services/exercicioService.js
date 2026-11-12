import { getBaseUrl } from '../utils/apiConfig';
import { encryptedFetch } from '../utils/payloadCrypto';
import { authHeaders } from './httpHeaders';

const montarQuery = (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        query.set(key, String(value));
    });
    return query.toString();
};

export const listarExercicios = ({ token, unidadeOrganizacionalId, skip = 0 }) => {
    const query = montarQuery({ unidadeOrganizacionalId, skip, top: 50 });
    return fetch(`${getBaseUrl()}/v1/exercicios${query ? `?${query}` : ''}`, {
        headers: authHeaders(token)
    });
};

export const obterExercicio = ({ token, exercicioId }) => (
    fetch(`${getBaseUrl()}/v1/exercicios/${exercicioId}`, {
        headers: authHeaders(token)
    })
);

export const criarExercicio = ({ token, payload }) => (
    encryptedFetch(`${getBaseUrl()}/v1/exercicios`, {
        method: 'POST',
        headers: authHeaders(token),
        payload
    })
);

export const atualizarExercicio = ({ token, exercicioId, payload }) => (
    encryptedFetch(`${getBaseUrl()}/v1/exercicios/${exercicioId}`, {
        method: 'PUT',
        headers: authHeaders(token),
        payload
    })
);

export const excluirExercicio = ({ token, exercicioId }) => (
    fetch(`${getBaseUrl()}/v1/exercicios/${exercicioId}`, {
        method: 'DELETE',
        headers: authHeaders(token)
    })
);