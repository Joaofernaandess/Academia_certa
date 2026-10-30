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

export const listarEquipamentos = ({ token, unidadeOrganizacionalId, skip = 0 }) => {
    const query = montarQuery({ unidadeOrganizacionalId, skip, top: 50 });
    return fetch(`${getBaseUrl()}/v1/equipamentos${query ? `?${query}` : ''}`, {
        headers: authHeaders(token)
    });
};

export const obterEquipamento = ({ token, equipamentoId }) => (
    fetch(`${getBaseUrl()}/v1/equipamentos/${equipamentoId}`, {
        headers: authHeaders(token)
    })
);

export const criarEquipamento = ({ token, payload }) => (
    encryptedFetch(`${getBaseUrl()}/v1/equipamentos`, {
        method: 'POST',
        headers: authHeaders(token),
        payload
    })
);

export const atualizarEquipamento = ({ token, equipamentoId, payload }) => (
    encryptedFetch(`${getBaseUrl()}/v1/equipamentos/${equipamentoId}`, {
        method: 'PUT',
        headers: authHeaders(token),
        payload
    })
);

export const excluirEquipamento = ({ token, equipamentoId }) => (
    fetch(`${getBaseUrl()}/v1/equipamentos/${equipamentoId}`, {
        method: 'DELETE',
        headers: authHeaders(token)
    })
);