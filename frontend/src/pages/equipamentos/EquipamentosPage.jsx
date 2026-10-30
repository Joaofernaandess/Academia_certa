import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingWaves from '../../components/LoadingWaves';
import MessageModal from '../../components/MessageModal';
import ZeniteIcon from '../../components/ZeniteIcon';
import { excluirEquipamento, listarEquipamentos } from '../../services/equipamentoService';
import { extrairErro, extrairMensagem } from '../../utils/apiUtils';

export default function EquipamentosPage({ token, unidadeOrganizacionalId }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [equipamentos, setEquipamentos] = useState([]);
    const [pesquisa, setPesquisa] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    const carregar = useCallback(async () => {
        if (!unidadeOrganizacionalId) return;
        setLoading(true);
        try {
            const res = await listarEquipamentos({ token, unidadeOrganizacionalId });
            if (res.ok) {
                setEquipamentos(await res.json());
            } else {
                setErro(await extrairErro(res));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [token, unidadeOrganizacionalId]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    useEffect(() => {
        if (location.state?.sucesso) {
            setSucesso(location.state.sucesso);
            navigate(location.pathname, { replace: true, state: null });
        }
    }, [location.pathname, location.state, navigate]);

    const handleExcluir = async (equipamentoId) => {
        try {
            const res = await excluirEquipamento({ token, equipamentoId });
            if (res.ok) {
                setSucesso(await extrairMensagem(res));
                setEquipamentos(prev => prev.filter(e => e.equipamentoId !== equipamentoId));
            } else {
                setErro(await extrairErro(res));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const filtrados = equipamentos.filter(e =>
        e.nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
        e.grupoMuscular?.toLowerCase().includes(pesquisa.toLowerCase())
    );

    return (
        <div className="w-full inventory-list-fixed">
            <div className="inventory-list-fixed-header">
                <h2 className="page-title no-margin inventory-page-title">Equipamentos da Academia</h2>
                <div className="inventory-list-header-row mb-1">
                    <div className="inventory-search-wrapper w-full">
                        <label className="space-items-search no-margin">
                            <ZeniteIcon name="search" size={24} />
                            <input
                                type="text"
                                value={pesquisa}
                                onChange={(e) => setPesquisa(e.target.value)}
                                placeholder="Pesquisar equipamento ou grupo muscular..."
                                className="space-items-search-input w-full"
                            />
                        </label>
                    </div>
                </div>
            </div>

            <div className="inventory-list-scroll">
                {loading ? (
                    <LoadingWaves variant="cards" rows={3} label="Carregando equipamentos" className="inventory-grid space-list-grid" />
                ) : filtrados.length === 0 ? (
                    <div className="empty-state-plain">
                        <div className="empty-state-icon">
                            <ZeniteIcon name="ban" size={92} strokeWidth={1.7} />
                        </div>
                        <p className="empty-state-text">Nenhum equipamento cadastrado.</p>
                    </div>
                ) : (
                    <div className="inventory-grid space-list-grid">
                        {filtrados.map(eq => (
                            <div key={eq.equipamentoId} className="inventory-grid-item">
                                <div className="card inventory-card inventory-list-card space-list-card inventory-card-surface">
                                    {eq.imagemUrl && (
                                        <div className="equipamento-card-thumb">
                                            <img
                                                src={eq.imagemUrl}
                                                alt={eq.nome}
                                                className="equipamento-card-img"
                                            />
                                        </div>
                                    )}
                                    <div className="space-list-card-main">
                                        <div className="inventory-card-header">
                                            <h3 className="inventory-card-title">{eq.nome}</h3>
                                            <p className="inventory-card-description">
                                                <strong>Músculos:</strong> {eq.grupoMuscular || 'Geral'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="inventory-card-footer space-list-card-footer">
                                        <button
                                            className="button button-outline inventory-card-action"
                                            onClick={() => navigate(`/feedback?equipamentoId=${eq.equipamentoId}`)}
                                        >
                                            Avaliar
                                        </button>
                                        <div className="space-list-card-actions">
                                            <button
                                                type="button"
                                                className="button-icon-danger"
                                                onClick={() => handleExcluir(eq.equipamentoId)}
                                                aria-label={`Excluir ${eq.nome}`}
                                            >
                                                <ZeniteIcon name="trash" size={22} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="detail-action-bar detail-action-bar-one">
                <button
                    className="button academia-action-btn-main"
                    onClick={() => navigate('/equipamentos/novo')}
                >
                    <ZeniteIcon name="plus" size={22} />
                    <span className="button-icon-text">Novo Equipamento</span>
                </button>
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