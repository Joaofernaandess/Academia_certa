import { getBaseUrl } from '../utils/apiConfig';

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

export const obterUnidadeOrganizacional = (unidadeOrganizacionalId) => (
    fetch(`${getBaseUrl()}/v1/unidades-organizacionais/${unidadeOrganizacionalId}`)
);
