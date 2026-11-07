import { getBaseUrl } from '../utils/apiConfig';
import { authHeaders } from './httpHeaders';
import { isDemoMode } from '../utils/demoMode';

export const getNomeExibicaoUnidade = (unidade) => {
    if (!unidade) return '';
    return unidade.nomeFantasia || unidade.razaoSocial || unidade.nome || 'Unidade sem nome';
};

const montarQuery = (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        query.set(key, String(value));
    });

    return query.toString();
};

export const listarUnidadesOrganizacionais = (params = {}) => {
    const query = montarQuery(params);

    return fetch(`${getBaseUrl()}/v1/unidades-organizacionais${query ? `?${query}` : ''}`);
};

export const obterUnidadeOrganizacional = (unidadeOrganizacionalId) => {
    if (unidadeOrganizacionalId === 'demo-academia') {
        return Promise.resolve({
            ok: true,
            json: async () => ({ nomeFantasia: 'Academia Demonstração', razaoSocial: 'Academia Demonstração' })
        });
    }
    return fetch(`${getBaseUrl()}/v1/unidades-organizacionais/${unidadeOrganizacionalId}`);
};

export const enviarLogoOrganizacao = (unidadeOrganizacionalId, token, arquivo) => {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return fetch(`${getBaseUrl()}/v1/unidades-organizacionais/${unidadeOrganizacionalId}/logo`, {
        method: 'PATCH',
        headers: authHeaders(token),
        body: formData
    });
};

export const removerLogoOrganizacao = (unidadeOrganizacionalId, token) => (
    fetch(`${getBaseUrl()}/v1/unidades-organizacionais/${unidadeOrganizacionalId}/logo`, {
        method: 'DELETE',
        headers: authHeaders(token)
    })
);
