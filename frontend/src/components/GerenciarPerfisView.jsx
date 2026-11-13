import { useCallback, useMemo, useState } from 'react';
import useInfiniteGet from '../hooks/useInfiniteGet';
import { getBaseUrl } from '../utils/apiConfig';
import { extrairErro, extrairMensagem } from '../utils/apiUtils';
import { encryptedJsonBody } from '../utils/payloadCrypto';
import { formatPhone } from '../utils/phone';
import LoadingWaves from './LoadingWaves';
import MessageModal from './MessageModal';
import ZeniteIcon from './ZeniteIcon';

const PERFIS = [
    { valor: 2, codigo: 'Normal', label: 'Aluno (Normal)' },
    { valor: 3, codigo: 'Gestor', label: 'Personal (Gestor)' },
    { valor: 1, codigo: 'Admin', label: 'Administrador' }
];

const normalizarPerfilValor = (perfil) => {
    if (perfil === 1 || perfil === '1' || String(perfil).toLowerCase() === 'admin') return 1;
    if (perfil === 3 || perfil === '3' || String(perfil).toLowerCase() === 'gestor') return 3;
    return 2;
};

export default function GerenciarPerfisView({ token, unidadeOrganizacionalId }) {
    const [pesquisa, setPesquisa] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [salvandoUsuarioId, setSalvandoUsuarioId] = useState(null);

    const usuarioGetParams = useMemo(() => ({
        unidadeOrganizacionalId,
        cadastroCompleto: true
    }), [unidadeOrganizacionalId]);

    const obterUsuarioId = useCallback((u) => u.usuarioId, []);

    const {
        items: usuarios,
        setItems: setUsuarios,
        loading,
        loadingMais,
        erro,
        setErro,
        scrollHandlers
    } = useInfiniteGet({
        endpoint: '/v1/usuarios',
        token,
        params: usuarioGetParams,
        getItemId: obterUsuarioId,
        errorMessage: 'Não foi possível carregar a lista de usuários.'
    });

    const handleAlterarPerfil = async (usuario, novoValorPerfil) => {
        const perfilAtual = normalizarPerfilValor(usuario.perfil);
        if (perfilAtual === novoValorPerfil || salvandoUsuarioId) return;

        setErro('');
        setSucesso('');
        setSalvandoUsuarioId(usuario.usuarioId);

        try {
            const response = await fetch(`${getBaseUrl()}/v1/usuarios/${usuario.usuarioId}/perfil`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: await encryptedJsonBody({ perfil: novoValorPerfil })
            });

            if (response.ok) {
                const mensagem = await extrairMensagem(response);
                if (mensagem) setSucesso(mensagem);
                setUsuarios(prev =>
                    prev.map(u => (u.usuarioId === usuario.usuarioId ? { ...u, perfil: novoValorPerfil } : u))
                );
            } else {
                setErro(await extrairErro(response));
            }
        } catch (error) {
            console.error(error);
            setErro('Erro ao atualizar o perfil do usuário.');
        } finally {
            setSalvandoUsuarioId(null);
        }
    };

    const usuariosFiltrados = usuarios.filter(user => {
        const termo = pesquisa.trim().toLowerCase();
        if (!termo) return true;
        return (
            user.nome?.toLowerCase().includes(termo) ||
            user.username?.toLowerCase().includes(termo) ||
            formatPhone(user.username).toLowerCase().includes(termo)
        );
    });

    return (
        <div className="w-full inventory-list-fixed validation-user-view">
            <div className="inventory-list-fixed-header">
                <div className="inventory-list-header">
                    <h2 className="page-title no-margin">Gerenciar Perfis de Usuários</h2>
                </div>
                <div className="inventory-list-header-row mb-1">
                    <div className="inventory-search-wrapper w-full">
                        <label className="space-items-search no-margin">
                            <ZeniteIcon name="search" size={24} />
                            <input
                                type="text"
                                placeholder="Pesquisar por nome ou telefone..."
                                value={pesquisa}
                                onChange={(e) => setPesquisa(e.target.value)}
                                className="space-items-search-input w-full no-field-margin"
                            />
                        </label>
                    </div>
                </div>
            </div>

            <div className="inventory-list-scroll validation-user-scroll" {...scrollHandlers}>
                {loading ? (
                    <LoadingWaves variant="cards" rows={4} label="Carregando usuários" className="validation-loading-grid" />
                ) : usuariosFiltrados.length === 0 ? (
                    <div className="empty-state-plain validation-empty-state">
                        <div className="empty-state-icon">
                            <ZeniteIcon name="ban" size={92} strokeWidth={1.7} />
                        </div>
                        <p className="empty-state-text">Nenhum usuário encontrado.</p>
                    </div>
                ) : (
                    <div className="row validation-user-grid">
                        {usuariosFiltrados.map(user => {
                            const perfilAtual = normalizarPerfilValor(user.perfil);
                            const estaSalvando = salvandoUsuarioId === user.usuarioId;

                            return (
                                <div key={user.usuarioId} className="column-4 mb-1">
                                    <div className="card validation-user-card perfil-user-card">
                                        <h3 className="validation-user-title">{user.nome}</h3>
                                        <p className="validation-user-meta">
                                            <strong>Telefone:</strong> {formatPhone(user.username)}
                                        </p>
                                        <p className="validation-user-description">
                                            <strong>Unidade:</strong> {user.nomeUnidadeOrganizacional || 'Academia'}
                                        </p>

                                        <div className="perfil-selector-group">
                                            {PERFIS.map((opcao) => {
                                                const ativo = perfilAtual === opcao.valor;
                                                return (
                                                    <button
                                                        key={opcao.valor}
                                                        type="button"
                                                        disabled={estaSalvando}
                                                        className={`perfil-selector-btn ${ativo ? 'is-active' : ''}`}
                                                        onClick={() => handleAlterarPerfil(user, opcao.valor)}
                                                    >
                                                        {opcao.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {loadingMais && (
                            <LoadingWaves variant="cards" rows={1} label="Carregando mais usuários" className="validation-loading-grid" />
                        )}
                    </div>
                )}
            </div>

            {(erro || sucesso) && (
                <MessageModal
                    type={erro ? 'error' : 'success'}
                    message={erro || sucesso}
                    onClose={() => { setErro(''); setSucesso(''); }}
                    autoClose={8000}
                />
            )}
        </div>
    );
}