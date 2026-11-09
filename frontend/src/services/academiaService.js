import { getBaseUrl } from '../utils/apiConfig';

const endpoints = {
    alunos: '/v1/alunos',
    planos: '/v1/planos',
    instrutores: '/v1/instrutores',
    pagamentos: '/v1/controle-pagamentos'
};

async function request(path, token, options = {}) {
    let response;
    try {
        response = await fetch(`${getBaseUrl()}${path}`, {
            ...options,
            headers: {
                Authorization: `Bearer ${token}`,
                ...(options.body ? { 'Content-Type': 'application/json' } : {}),
                ...options.headers
            }
        });
    } catch {
        throw new Error('Não foi possível conectar ao servidor. Verifique se a API está iniciada.');
    }

    const text = await response.text();
    let body = null;
    if (text) {
        try {
            body = JSON.parse(text);
        } catch {
            body = text;
        }
    }

    if (!response.ok) {
        const message = Array.isArray(body)
            ? body.map(item => item.message || item.mensagem).filter(Boolean).join(' ')
            : typeof body === 'string'
                ? body
                : body?.message || body?.mensagem;
        throw new Error(message || `A solicitação falhou (${response.status}).`);
    }

    return body;
}

export const listarAlunos = (token) => request(endpoints.alunos, token);
export const listarPlanos = (token) => request(endpoints.planos, token);
export const listarInstrutores = (token) => request(endpoints.instrutores, token);
export const listarPagamentos = (token) => request(endpoints.pagamentos, token);

export const salvarRegistro = (token, tipo, registro, id) => request(
    id ? `${endpoints[tipo]}/${id}` : endpoints[tipo],
    token,
    {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(registro)
    }
);

export const excluirRegistro = (token, tipo, id) => request(
    `${endpoints[tipo]}/${id}`,
    token,
    { method: 'DELETE' }
);
