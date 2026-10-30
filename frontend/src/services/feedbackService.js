import { getBaseUrl } from '../utils/apiConfig';
import { encryptedFetch } from '../utils/payloadCrypto';
import { authHeaders } from './httpHeaders';

export const criarFeedback = ({ token, payload }) => (
    encryptedFetch(`${getBaseUrl()}/v1/feedbacks`, {
        method: 'POST',
        headers: authHeaders(token),
        payload
    })
);

export const listarFeedbacks = ({ token, unidadeOrganizacionalId, equipamentoId = '' }) => {
    const query = new URLSearchParams({ unidadeOrganizacionalId });
    if (equipamentoId) query.set('equipamentoId', equipamentoId);
    return fetch(`${getBaseUrl()}/v1/feedbacks?${query.toString()}`, {
        headers: authHeaders(token)
    });
};