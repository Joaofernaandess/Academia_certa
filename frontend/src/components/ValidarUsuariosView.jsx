import { useCallback, useMemo, useState } from 'react';
import useInfiniteGet from '../hooks/useInfiniteGet';
import { getBaseUrl } from '../utils/apiConfig';
import { extrairErro, extrairMensagem } from '../utils/apiUtils';
import { formatPhone } from '../utils/phone';
import LoadingWaves from './LoadingWaves';
import MessageModal from './MessageModal';
import ZeniteIcon from './ZeniteIcon';
import LoadingButton from './LoadingButton';

export default function ValidarUsuariosView({ token }) {
    const [pesquisa, setPesquisa] = useState('');
    const [sort, setSort] = useState('nome asc');
    const [sucesso, setSucesso] = useState('');
    const [usuarioParaAprovar, setUsuarioParaAprovar] = useState(null);
    const [isApproving, setIsApproving] = useState(false);

    const usuarioGetParams = useMemo(() => ({
        cadastroCompleto: false,
        sort
    }), [sort]);

    const obterUsuarioId = useCallback((usuario) => usuario.usuarioId, []);

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
        errorMessage: 'Não foi possível carregar os usuários pendentes.'
    });

    const handleAprovar = async () => {
        if (!usuarioParaAprovar || isApproving) return;
        setErro(''); 
        setSucesso('');
        setIsApproving(true);

        try {
            const response = await fetch(`${getBaseUrl()}/v1/usuarios/${usuarioParaAprovar.usuarioId}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const mensagem = await extrairMensagem(response);
                if (mensagem) setSucesso(mensagem);
                setUsuarios(prev => prev.filter(u => u.usuarioId !== usuarioParaAprovar.usuarioId));
                setUsuarioParaAprovar(null);
            } else {
                setErro(await extrairErro(response));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsApproving(false);
        }
    };

    const renderEmptyState = () => (
        <div className="empty-state-plain validation-empty-state">
            <div className="empty-state-icon">
                <ZeniteIcon name="ban" size={92} strokeWidth={1.7} />
            </div>
            <p className="empty-state-text">
                {usuarios.length === 0 ? 'Nenhum usuário pendente de aprovação.' : 'Nenhum resultado encontrado para a pesquisa.'}
            </p>
        </div>
    );

    const campoSortAtual = sort.includes('username') ? 'username' : 'nome';
    const direcaoSortAtual = sort.includes('desc') ? 'desc' : 'asc';
    const obterCampoSortRequest = (campo) => (campo === 'username' ? 'username' : 'nome');

    const alternarSort = (campo) => {
        const campoRequest = obterCampoSortRequest(campo);

        if (campoSortAtual === campo) {
            setSort(`${campoRequest} ${direcaoSortAtual === 'asc' ? 'desc' : 'asc'}`);
            return;
        }

        setSort(`${campoRequest} asc`);
    };

    const renderSetaSort = (campo) => {
        if (campoSortAtual !== campo) return null;

        return <span className="zf-sort-arrow">{direcaoSortAtual === 'asc' ? '▲' : '▼'}</span>;
    };


    const usuariosFiltrados = usuarios.filter(user => {
        const termo = pesquisa.toLowerCase();
        return (
            user.nome?.toLowerCase().includes(termo) ||
            user.username?.toLowerCase().includes(termo) ||
            formatPhone(user.username).toLowerCase().includes(termo) ||
            user.nomeUnidadeOrganizacional?.toLowerCase().includes(termo)
        );
    });

    return (
        <div className="w-full inventory-list-fixed validation-user-view">
            <div className="inventory-list-fixed-header">
                <div className="inventory-list-header">
                    <h2 className="page-title no-margin">Usuários Pendentes</h2>
                </div>
                <div className="inventory-list-header-row mb-1">
                    <div className="inventory-search-wrapper w-full">
                        <label className="space-items-search no-margin">
                            <ZeniteIcon name="search" size={24} />    
                            <input
                                type="text"
                                placeholder="Pesquisar..."
                                value={pesquisa}
                                onChange={(e) => setPesquisa(e.target.value)}
                                className="space-items-search-input w-full no-field-margin"
                            />
                        </label>
                    </div>
                </div>
                <div className="zf-sort-filter" aria-label="Ordenar usuários pendentes">
                    <button
                        type="button"
                        className={`zf-sort-option ${campoSortAtual === 'nome' ? 'is-active' : ''}`}
                        aria-pressed={campoSortAtual === 'nome'}
                        onClick={() => alternarSort('nome')}
                    >
                        {renderSetaSort('nome')}
                        <span>Nome</span>
                    </button>
                    <button
                        type="button"
                        className={`zf-sort-option ${campoSortAtual === 'username' ? 'is-active' : ''}`}
                        aria-pressed={campoSortAtual === 'username'}
                        onClick={() => alternarSort('username')}
                    >
                        <span>Telefone</span>
                        {renderSetaSort('username')}
                    </button>
                </div>
            </div>

            <div className="inventory-list-scroll validation-user-scroll" {...scrollHandlers}>
                {loading ? (
                    <LoadingWaves variant="cards" rows={4} label="Carregando usuários pendentes" className="validation-loading-grid" />
                ) : usuariosFiltrados.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <div className="row validation-user-grid">
                        {usuariosFiltrados.map(user => (
                            <div key={user.usuarioId} className="column-4 mb-1">
                                <div className="card validation-user-card">
                                    <h3 className="validation-user-title">{user.nome}</h3>
                                    <p className="validation-user-meta">
                                        <strong>Username:</strong> {formatPhone(user.username)}
                                    </p>
                                    <p className="validation-user-description">
                                        <strong>Unidade:</strong> {user.nomeUnidadeOrganizacional || 'Sem Unidade'}
                                    </p>
                                    <button className="button button-full" onClick={() => setUsuarioParaAprovar(user)}>
                                        Aprovar Acesso
                                    </button>
                                </div>
                            </div>
                        ))}
                        {loadingMais && (
                            <LoadingWaves variant="cards" rows={1} label="Carregando mais usuários" className="validation-loading-grid" />
                        )}
                    </div>
                )}
            </div>

            {usuarioParaAprovar && (
                <div className="modal-overlay">
                    <div className="card modal-card">
                        <div className="modal-card-body">
                            <h2 className="modal-title">Validar Acesso</h2>
                            <p className="modal-description">
                                Deseja validar o acesso do usuário {usuarioParaAprovar.nome}?
                            </p>
                            <div className="modal-actions">
                                <button type="button" className="button button-outline button-flex" onClick={() => setUsuarioParaAprovar(null)}>
                                    Cancelar
                                </button>
                                <LoadingButton type="button" className="button button-flex" onClick={handleAprovar} loading={isApproving}>
                                    Confirmar
                                </LoadingButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
