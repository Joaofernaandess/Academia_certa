import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import {
    excluirRegistro,
    listarAlunos,
    listarInstrutores,
    listarPagamentos,
    listarPlanos,
    salvarRegistro
} from '../../services/academiaService';

const situacoesAluno = [
    { value: 'ATIVO', label: 'Ativo' },
    { value: 'INATIVO', label: 'Inativo' }
];

const situacoesPagamento = [
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'PAGO', label: 'Pago' },
    { value: 'CANCELADO', label: 'Cancelado' }
];

const configuracoes = {
    alunos: {
        titulo: 'Alunos',
        descricao: 'Cadastre e acompanhe os alunos da academia.',
        singular: 'aluno',
        id: 'alunoId',
        colunas: [
            { chave: 'nome', titulo: 'Aluno' },
            { chave: 'cpf', titulo: 'CPF', formatar: formatarCpf },
            { chave: 'email', titulo: 'E-mail', vazio: '—' },
            { chave: 'telefone', titulo: 'Telefone', vazio: '—' },
            { chave: 'situacao', titulo: 'Situação', tipo: 'situacao' }
        ],
        campos: [
            { chave: 'nome', titulo: 'Nome completo', obrigatorio: true, maxLength: 120 },
            { chave: 'cpf', titulo: 'CPF', tipo: 'cpf', obrigatorio: true },
            { chave: 'email', titulo: 'E-mail', tipo: 'email', maxLength: 160 },
            { chave: 'telefone', titulo: 'Telefone', tipo: 'tel', maxLength: 20 },
            { chave: 'dataNascimento', titulo: 'Data de nascimento', tipo: 'date' },
            { chave: 'situacao', titulo: 'Situação', tipo: 'select', opcoes: situacoesAluno }
        ],
        criarInicial: () => ({ nome: '', cpf: '', email: '', telefone: '', dataNascimento: '', situacao: 'ATIVO' }),
        paraFormulario: item => ({ ...item, cpf: formatarCpf(item.cpf) }),
        paraEnvio: form => ({
            ...form,
            cpf: somenteDigitos(form.cpf),
            dataNascimento: form.dataNascimento || null
        })
    },
    planos: {
        titulo: 'Planos',
        descricao: 'Defina os planos, valores e períodos de matrícula.',
        singular: 'plano',
        id: 'planoId',
        colunas: [
            { chave: 'nome', titulo: 'Plano' },
            { chave: 'valor', titulo: 'Valor', tipo: 'moeda' },
            { chave: 'duracaoDias', titulo: 'Duração', tipo: 'dias' },
            { chave: 'ativo', titulo: 'Situação', tipo: 'booleano' }
        ],
        campos: [
            { chave: 'nome', titulo: 'Nome do plano', obrigatorio: true, maxLength: 100, placeholder: 'Ex.: Plano Mensal' },
            { chave: 'descricao', titulo: 'Descrição', tipo: 'textarea', maxLength: 500 },
            { chave: 'valor', titulo: 'Valor', tipo: 'number', obrigatorio: true, min: '0.01', step: '0.01' },
            { chave: 'duracaoDias', titulo: 'Duração (dias)', tipo: 'number', obrigatorio: true, min: '1', step: '1' },
            { chave: 'ativo', titulo: 'Situação', tipo: 'select', opcoes: [
                { value: true, label: 'Ativo' },
                { value: false, label: 'Inativo' }
            ] }
        ],
        criarInicial: () => ({ nome: '', descricao: '', valor: '', duracaoDias: '', ativo: true }),
        paraFormulario: item => ({ ...item, valor: String(item.valor), duracaoDias: String(item.duracaoDias), ativo: Boolean(item.ativo) }),
        paraEnvio: form => ({ ...form, valor: Number(form.valor), duracaoDias: Number(form.duracaoDias), ativo: form.ativo === true || form.ativo === 'true' })
    },
    instrutores: {
        titulo: 'Instrutores',
        descricao: 'Organize a equipe e as especialidades dos instrutores.',
        singular: 'instrutor',
        id: 'instrutorId',
        colunas: [
            { chave: 'nome', titulo: 'Instrutor' },
            { chave: 'cpf', titulo: 'CPF', formatar: formatarCpf },
            { chave: 'especialidade', titulo: 'Especialidade' },
            { chave: 'telefone', titulo: 'Telefone', vazio: '—' },
            { chave: 'ativo', titulo: 'Situação', tipo: 'booleano' }
        ],
        campos: [
            { chave: 'nome', titulo: 'Nome completo', obrigatorio: true, maxLength: 120 },
            { chave: 'cpf', titulo: 'CPF', tipo: 'cpf', obrigatorio: true },
            { chave: 'email', titulo: 'E-mail', tipo: 'email', maxLength: 160 },
            { chave: 'telefone', titulo: 'Telefone', tipo: 'tel', maxLength: 20 },
            { chave: 'especialidade', titulo: 'Especialidade', obrigatorio: true, maxLength: 120 },
            { chave: 'ativo', titulo: 'Situação', tipo: 'select', opcoes: [
                { value: true, label: 'Ativo' },
                { value: false, label: 'Inativo' }
            ] }
        ],
        criarInicial: () => ({ nome: '', cpf: '', email: '', telefone: '', especialidade: '', ativo: true }),
        paraFormulario: item => ({ ...item, cpf: formatarCpf(item.cpf), ativo: Boolean(item.ativo) }),
        paraEnvio: form => ({ ...form, cpf: somenteDigitos(form.cpf), ativo: form.ativo === true || form.ativo === 'true' })
    },
    pagamentos: {
        titulo: 'Controle de Pagamento',
        descricao: 'Registre vencimentos e acompanhe mensalidades pagas ou pendentes.',
        singular: 'pagamento',
        id: 'pagamentoId',
        colunas: [
            { chave: 'alunoNome', titulo: 'Aluno' },
            { chave: 'planoNome', titulo: 'Plano' },
            { chave: 'valor', titulo: 'Valor', tipo: 'moeda' },
            { chave: 'dataVencimento', titulo: 'Vencimento', tipo: 'data' },
            { chave: 'dataPagamento', titulo: 'Pago em', tipo: 'data' },
            { chave: 'situacao', titulo: 'Situação', tipo: 'situacao' }
        ],
        campos: [
            { chave: 'alunoId', titulo: 'Aluno', tipo: 'select', fonte: 'alunos', obrigatorio: true },
            { chave: 'planoId', titulo: 'Plano', tipo: 'select', fonte: 'planos', obrigatorio: true },
            { chave: 'valor', titulo: 'Valor', tipo: 'number', obrigatorio: true, min: '0.01', step: '0.01' },
            { chave: 'dataVencimento', titulo: 'Data de vencimento', tipo: 'date', obrigatorio: true },
            { chave: 'situacao', titulo: 'Situação', tipo: 'select', opcoes: situacoesPagamento },
            { chave: 'dataPagamento', titulo: 'Data do pagamento', tipo: 'date', obrigatorioCondicional: true }
        ],
        criarInicial: () => ({ alunoId: '', planoId: '', valor: '', dataVencimento: '', dataPagamento: '', situacao: 'PENDENTE' }),
        paraFormulario: item => ({
            ...item,
            alunoId: item.alunoId || '',
            planoId: item.planoId || '',
            valor: String(item.valor),
            dataVencimento: item.dataVencimento || '',
            dataPagamento: item.dataPagamento || ''
        }),
        paraEnvio: form => ({
            ...form,
            valor: Number(form.valor),
            dataPagamento: form.situacao === 'PAGO' ? form.dataPagamento : null
        })
    }
};

function somenteDigitos(value = '') {
    return String(value).replace(/\D/g, '');
}

function formatarCpf(value = '') {
    const digits = somenteDigitos(value).slice(0, 11);
    return digits
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function formatarMoeda(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
}

function formatarData(value) {
    if (!value) return '—';
    const [year, month, day] = String(value).slice(0, 10).split('-');
    return year && month && day ? `${day}/${month}/${year}` : '—';
}

function formatarCelula(item, coluna) {
    const value = item[coluna.chave];
    if (value === null || value === undefined || value === '') return coluna.vazio || '—';
    if (coluna.formatar) return coluna.formatar(value);
    if (coluna.tipo === 'moeda') return formatarMoeda(value);
    if (coluna.tipo === 'data') return formatarData(value);
    if (coluna.tipo === 'dias') return `${value} dias`;
    if (coluna.tipo === 'booleano') return value ? 'Ativo' : 'Inativo';
    return value;
}

function nomeOpcao(item, chave) {
    if (chave === 'alunos') return `${item.nome}${item.situacao === 'INATIVO' ? ' (Inativo)' : ''}`;
    if (chave === 'planos') return `${item.nome}${item.ativo ? '' : ' (Inativo)'}`;
    return item.nome;
}

export default function ManagementPage({ tipo, token }) {
    const config = configuracoes[tipo];
    const [items, setItems] = useState([]);
    const [opcoes, setOpcoes] = useState({ alunos: [], planos: [] });
    const [pesquisa, setPesquisa] = useState('');
    const [form, setForm] = useState(null);
    const [editing, setEditing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    const carregar = useCallback(async () => {
        setLoading(true);
        setErro('');
        try {
            const loaders = {
                alunos: listarAlunos,
                planos: listarPlanos,
                instrutores: listarInstrutores,
                pagamentos: listarPagamentos
            };
            const listPromise = loaders[tipo](token);
            if (tipo === 'pagamentos') {
                const [payments, students, plans] = await Promise.all([
                    listPromise,
                    listarAlunos(token),
                    listarPlanos(token)
                ]);
                setItems(payments);
                setOpcoes({ alunos: students, planos: plans });
            } else {
                setItems(await listPromise);
            }
        } catch (error) {
            setErro(error.message || 'Não foi possível carregar os dados.');
        } finally {
            setLoading(false);
        }
    }, [tipo, token]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const filtrados = useMemo(() => {
        const term = pesquisa.trim().toLocaleLowerCase('pt-BR');
        if (!term) return items;
        return items.filter(item => Object.values(item).some(value => (
            String(value ?? '').toLocaleLowerCase('pt-BR').includes(term)
        )));
    }, [items, pesquisa]);

    const abrirNovo = () => {
        setErro('');
        setSucesso('');
        setEditing(null);
        const initial = config.criarInicial();
        if (tipo === 'pagamentos') {
            const activeStudent = opcoes.alunos.find(item => item.situacao === 'ATIVO');
            const activePlan = opcoes.planos.find(item => item.ativo);
            initial.alunoId = activeStudent?.alunoId || '';
            initial.planoId = activePlan?.planoId || '';
            initial.valor = activePlan?.valor ? String(activePlan.valor) : '';
        }
        setForm(initial);
    };

    const abrirEdicao = (item) => {
        setErro('');
        setSucesso('');
        setEditing(item[config.id]);
        setForm(config.paraFormulario(item));
    };

    const fecharFormulario = () => {
        if (saving) return;
        setForm(null);
        setEditing(null);
        setErro('');
    };

    const atualizarCampo = (key, value) => {
        setForm(current => {
            const next = { ...current, [key]: value };
            if (tipo === 'pagamentos' && key === 'planoId') {
                const selectedPlan = opcoes.planos.find(plan => plan.planoId === value);
                if (selectedPlan) next.valor = String(selectedPlan.valor);
            }
            if (tipo === 'pagamentos' && key === 'situacao' && value !== 'PAGO') {
                next.dataPagamento = '';
            }
            return next;
        });
    };

    const salvar = async (event) => {
        event.preventDefault();
        if (saving) return;
        setSaving(true);
        setErro('');
        setSucesso('');
        try {
            await salvarRegistro(token, tipo, config.paraEnvio(form), editing);
            setForm(null);
            setEditing(null);
            setSucesso(`${config.singular[0].toUpperCase()}${config.singular.slice(1)} salvo com sucesso.`);
            await carregar();
        } catch (error) {
            setErro(error.message || `Não foi possível salvar ${config.singular}.`);
        } finally {
            setSaving(false);
        }
    };

    const excluir = async (item) => {
        const label = item.nome || `${item.alunoNome} — ${item.planoNome}`;
        if (!window.confirm(`Deseja excluir ${config.singular} "${label}"?`)) return;
        setErro('');
        setSucesso('');
        try {
            await excluirRegistro(token, tipo, item[config.id]);
            setSucesso(`${config.singular[0].toUpperCase()}${config.singular.slice(1)} excluído com sucesso.`);
            await carregar();
        } catch (error) {
            setErro(error.message || `Não foi possível excluir ${config.singular}.`);
        }
    };

    const renderField = (field) => {
        const value = form[field.chave] ?? '';
        const options = field.fonte
            ? (opcoes[field.fonte] || []).map(item => ({ value: item[field.fonte === 'alunos' ? 'alunoId' : 'planoId'], label: nomeOpcao(item, field.fonte) }))
            : field.opcoes || [];
        const disabled = field.chave === 'dataPagamento' && form.situacao !== 'PAGO';
        const required = field.obrigatorio || (field.obrigatorioCondicional && form.situacao === 'PAGO');

        return (
            <label className="management-field" key={field.chave}>
                <span>{field.titulo}{required && <span className="management-required"> *</span>}</span>
                {field.tipo === 'select' ? (
                    <select
                        required={required}
                        value={String(value)}
                        onChange={event => {
                            const selected = options.find(option => String(option.value) === event.target.value);
                            atualizarCampo(field.chave, selected ? selected.value : event.target.value);
                        }}
                    >
                        <option value="">Selecione</option>
                        {options.map(option => (
                            <option key={String(option.value)} value={String(option.value)}>{option.label}</option>
                        ))}
                    </select>
                ) : field.tipo === 'textarea' ? (
                    <textarea
                        rows="3"
                        maxLength={field.maxLength}
                        value={value}
                        onChange={event => atualizarCampo(field.chave, event.target.value)}
                    />
                ) : (
                    <input
                        type={field.tipo === 'cpf' ? 'text' : field.tipo || 'text'}
                        inputMode={field.tipo === 'cpf' ? 'numeric' : undefined}
                        autoComplete={field.tipo === 'cpf' ? 'off' : undefined}
                        maxLength={field.maxLength || (field.tipo === 'cpf' ? 14 : undefined)}
                        min={field.min}
                        step={field.step}
                        placeholder={field.placeholder}
                        required={required}
                        disabled={disabled}
                        value={value}
                        onChange={event => atualizarCampo(field.chave, field.tipo === 'cpf' ? formatarCpf(event.target.value) : event.target.value)}
                    />
                )}
            </label>
        );
    };

    return (
        <section className="management-page" aria-labelledby="management-title">
            <div className="management-heading">
                <div>
                    <h1 id="management-title">{config.titulo}</h1>
                    <p>{config.descricao}</p>
                </div>
                <button type="button" className="management-primary-button" onClick={abrirNovo}>
                    <Plus size={18} aria-hidden="true" />
                    <span>Novo {config.singular}</span>
                </button>
            </div>

            {erro && <div className="management-alert management-alert-error" role="alert">{erro}</div>}
            {sucesso && <div className="management-alert management-alert-success" role="status">{sucesso}</div>}

            <div className="management-toolbar">
                <label className="management-search">
                    <Search size={18} aria-hidden="true" />
                    <span className="visually-hidden">Pesquisar {config.titulo.toLocaleLowerCase('pt-BR')}</span>
                    <input
                        type="search"
                        value={pesquisa}
                        onChange={event => setPesquisa(event.target.value)}
                        placeholder={`Pesquisar ${config.titulo.toLocaleLowerCase('pt-BR')}`}
                    />
                </label>
                <span className="management-count">{filtrados.length} {filtrados.length === 1 ? 'registro' : 'registros'}</span>
            </div>

            <div className="management-table-wrap">
                <table className="management-table">
                    <thead>
                        <tr>
                            {config.colunas.map(column => <th key={column.chave}>{column.titulo}</th>)}
                            <th className="management-actions-heading">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={config.colunas.length + 1} className="management-empty">Carregando...</td></tr>
                        ) : filtrados.length === 0 ? (
                            <tr>
                                <td colSpan={config.colunas.length + 1} className="management-empty">
                                    {items.length ? 'Nenhum resultado para esta pesquisa.' : `Nenhum ${config.singular} cadastrado ainda.`}
                                </td>
                            </tr>
                        ) : filtrados.map(item => (
                            <tr key={item[config.id]}>
                                {config.colunas.map(column => (
                                    <td key={column.chave}>
                                        {column.tipo === 'situacao' ? (
                                            <span className={`management-badge ${item[column.chave] === 'ATIVO' || item[column.chave] === 'PAGO' ? 'is-positive' : item[column.chave] === 'PENDENTE' ? 'is-warning' : 'is-muted'}`}>
                                                {situacoesAluno.concat(situacoesPagamento).find(status => status.value === item[column.chave])?.label || item[column.chave]}
                                            </span>
                                        ) : column.tipo === 'booleano' ? (
                                            <span className={`management-badge ${item[column.chave] ? 'is-positive' : 'is-muted'}`}>
                                                {formatarCelula(item, column)}
                                            </span>
                                        ) : formatarCelula(item, column)}
                                    </td>
                                ))}
                                <td className="management-actions">
                                    <button type="button" className="management-icon-button" aria-label={`Editar ${config.singular}`} onClick={() => abrirEdicao(item)}>
                                        <Pencil size={17} aria-hidden="true" />
                                    </button>
                                    <button type="button" className="management-icon-button is-danger" aria-label={`Excluir ${config.singular}`} onClick={() => excluir(item)}>
                                        <Trash2 size={17} aria-hidden="true" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {form && (
                <div className="management-dialog-backdrop" onMouseDown={event => {
                    if (event.target === event.currentTarget) fecharFormulario();
                }}>
                    <section className="management-dialog" role="dialog" aria-modal="true" aria-labelledby="management-dialog-title">
                        <div className="management-dialog-heading">
                            <div>
                                <h2 id="management-dialog-title">{editing ? `Editar ${config.singular}` : `Novo ${config.singular}`}</h2>
                                <p>Preencha os dados para salvar o cadastro.</p>
                            </div>
                            <button type="button" className="management-icon-button" aria-label="Fechar formulário" onClick={fecharFormulario}>
                                <X size={20} aria-hidden="true" />
                            </button>
                        </div>
                        {erro && <div className="management-alert management-alert-error" role="alert">{erro}</div>}
                        {tipo === 'pagamentos' && opcoes.alunos.length === 0 && (
                            <div className="management-alert management-alert-error" role="status">Cadastre um aluno antes de registrar pagamentos.</div>
                        )}
                        {tipo === 'pagamentos' && opcoes.planos.length === 0 && (
                            <div className="management-alert management-alert-error" role="status">Cadastre um plano antes de registrar pagamentos.</div>
                        )}
                        <form className="management-form" onSubmit={salvar}>
                            <div className="management-form-grid">
                                {config.campos.map(renderField)}
                            </div>
                            <div className="management-form-actions">
                                <button type="button" className="management-secondary-button" onClick={fecharFormulario} disabled={saving}>Cancelar</button>
                                <button type="submit" className="management-primary-button" disabled={saving || (tipo === 'pagamentos' && (!opcoes.alunos.length || !opcoes.planos.length))}>
                                    {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Salvar cadastro'}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </section>
    );
}
