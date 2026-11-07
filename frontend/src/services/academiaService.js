import { getBaseUrl } from '../utils/apiConfig';
import { isDemoMode } from '../utils/demoMode';

const endpoints = {
    alunos: '/v1/alunos',
    planos: '/v1/planos',
    instrutores: '/v1/instrutores',
    pagamentos: '/v1/controle-pagamentos'
};

const dadosDemonstracao = {
    alunos: [
        { alunoId: 'demo-aluno-1', nome: 'Ana Martins', cpf: '12345678901', email: 'ana@example.test', telefone: '(11) 99999-1001', dataNascimento: '1998-04-12', situacao: 'ATIVO' },
        { alunoId: 'demo-aluno-2', nome: 'Bruno Costa', cpf: '23456789012', email: 'bruno@example.test', telefone: '(11) 99999-1002', dataNascimento: '1992-09-20', situacao: 'ATIVO' },
        { alunoId: 'demo-aluno-3', nome: 'Carla Souza', cpf: '34567890123', email: 'carla@example.test', telefone: '(11) 99999-1003', dataNascimento: '2001-01-08', situacao: 'INATIVO' }
    ],
    planos: [
        { planoId: 'demo-plano-1', nome: 'Plano Mensal', descricao: 'Acesso à musculação', valor: 119.9, duracaoDias: 30, ativo: true },
        { planoId: 'demo-plano-2', nome: 'Plano Bronze', descricao: 'Acesso em horário reduzido', valor: 89.9, duracaoDias: 30, ativo: true }
    ],
    instrutores: [
        { instrutorId: 'demo-instrutor-1', nome: 'Rafael Lima', cpf: '45678901234', email: 'rafael@example.test', telefone: '(11) 99999-2001', especialidade: 'Musculação', ativo: true },
        { instrutorId: 'demo-instrutor-2', nome: 'Marina Alves', cpf: '56789012345', email: 'marina@example.test', telefone: '(11) 99999-2002', especialidade: 'Condicionamento físico', ativo: true }
    ],
    pagamentos: [
        { pagamentoId: 'demo-pagamento-1', alunoId: 'demo-aluno-1', planoId: 'demo-plano-1', valor: 119.9, dataVencimento: '2026-11-15', dataPagamento: null, situacao: 'PENDENTE' },
        { pagamentoId: 'demo-pagamento-2', alunoId: 'demo-aluno-2', planoId: 'demo-plano-2', valor: 89.9, dataVencimento: '2026-11-01', dataPagamento: '2026-10-30', situacao: 'PAGO' }
    ]
};

const camposId = {
    alunos: 'alunoId',
    planos: 'planoId',
    instrutores: 'instrutorId',
    pagamentos: 'pagamentoId'
};

const copiar = (valor) => JSON.parse(JSON.stringify(valor));

const novoIdDemo = () => (
    globalThis.crypto?.randomUUID?.() || `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`
);

const solicitarDemo = (path, options = {}) => {
    const tipo = Object.keys(endpoints).find(chave => path.startsWith(endpoints[chave]));
    if (!tipo) throw new Error('Tela de demonstração não encontrada.');

    const id = path.slice(endpoints[tipo].length).replace(/^\//, '');
    const method = options.method || 'GET';
    const registros = dadosDemonstracao[tipo];

    if (method === 'GET') {
        const resultado = tipo === 'pagamentos'
            ? registros.map(pagamento => ({
                ...pagamento,
                alunoNome: dadosDemonstracao.alunos.find(aluno => aluno.alunoId === pagamento.alunoId)?.nome || '',
                planoNome: dadosDemonstracao.planos.find(plano => plano.planoId === pagamento.planoId)?.nome || ''
            }))
            : registros;
        return Promise.resolve(copiar(resultado));
    }

    if (method === 'DELETE') {
        const idCampo = camposId[tipo];
        dadosDemonstracao[tipo] = registros.filter(registro => registro[idCampo] !== id);
        return Promise.resolve(null);
    }

    if (method === 'POST' || method === 'PUT') {
        const body = JSON.parse(options.body || '{}');
        const idCampo = camposId[tipo];
        const existente = registros.findIndex(registro => registro[idCampo] === id);
        const salvo = { ...body, [idCampo]: existente >= 0 ? id : novoIdDemo() };
        dadosDemonstracao[tipo] = existente >= 0
            ? registros.map((registro, index) => index === existente ? salvo : registro)
            : [...registros, salvo];
        return Promise.resolve(copiar(salvo));
    }

    return Promise.reject(new Error('Ação indisponível na demonstração.'));
};

async function request(path, token, options = {}) {
    if (isDemoMode(token)) return solicitarDemo(path, options);

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
