import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingWaves from '../../components/LoadingWaves';
import MessageModal from '../../components/MessageModal';
import ZeniteIcon from '../../components/ZeniteIcon';
import { excluirExercicio, listarExercicios } from '../../services/exercicioService';
import { extrairErro, extrairMensagem } from '../../utils/apiUtils';

export default function ExerciciosPage({ token, unidadeOrganizacionalId }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [exercicios, setExercicios] = useState([]);
    const [pesquisa, setPesquisa] = useState('');
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    const carregar = useCallback(async () => {
        if (!unidadeOrganizacionalId) return;
        setLoading(true);
        try {
            const res = await listarExercicios({ token, unidadeOrganizacionalId });
            if (res.ok) {
                setExercicios(await res.json());
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

    const handleExcluir = async (exercicioId) => {
        try {
            const res = await excluirExercicio({ token, exercicioId });
            if (res.ok) {
                setSucesso(await extrairMensagem(res));
                setExercicios(prev => prev.filter(e => e.exercicioId !== exercicioId));
            } else {
                setErro(await extrairErro(res));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const filtrados = exercicios.filter(ex =>
        ex.nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
        ex.descricao?.toLowerCase().includes(pesquisa.toLowerCase())
    );

    return (
        <div className="w-full inventory-list-fixed">
            <div className="inventory-list-fixed-header">
                <h2 className="page-title no-margin inventory-page-title">Catálogo de Exercícios</h2>
                <div className="inventory-list-header-row mb-1">
                    <div className="inventory-search-wrapper w-full">
                        <label className="space-items-search no-margin">
                            <ZeniteIcon name="search" size={24} />
                            <input
                                type="text"
                                value={pesquisa}
                                onChange={(e) => setPesquisa(e.target.value)}
                                placeholder="Pesquisar exercício..."
                                className="space-items-search-input w-full"
                            />
                        </label>
                    </div>
                </div>
            </div>

            <div className="inventory-list-scroll">
                {loading ? (
                    <LoadingWaves variant="cards" rows={3} label="Carregando exercícios" className="inventory-grid space-list-grid" />
                ) : filtrados.length === 0 ? (
                    <div className="empty-state-plain">
                        <div className="empty-state-icon">
                            <ZeniteIcon name="ban" size={92} strokeWidth={1.7} />
                        </div>
                        <p className="empty-state-text">Nenhum exercício cadastrado.</p>
                    </div>
                ) : (
                    <div className="inventory-grid space-list-grid">
                        {filtrados.map(ex => (
                            <div key={ex.exercicioId} className="inventory-grid-item">
                                <div className="card inventory-card inventory-list-card space-list-card inventory-card-surface">
                                    {ex.arquivoUrl && (
                                        <div className="equipamento-card-thumb">
                                            <img
                                                src={ex.arquivoUrl}
                                                alt={ex.nome}
                                                className="equipamento-card-img"
                                            />
                                        </div>
                                    )}
                                    <div className="space-list-card-main">
                                        <div className="inventory-card-header">
                                            <h3 className="inventory-card-title">{ex.nome}</h3>
                                            <p className="inventory-card-description">
                                                {ex.descricao || 'Sem descrição'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="inventory-card-footer space-list-card-footer">
                                        <button
                                            type="button"
                                            className="button button-outline inventory-card-action"
                                            onClick={() => navigate(`/exercicios/${ex.exercicioId}/editar`)}
                                        >
                                            <ZeniteIcon name="pencil" size={16} />
                                            <span className="button-icon-text">Editar</span>
                                        </button>
                                        <div className="space-list-card-actions">
                                            <button
                                                type="button"
                                                className="button-icon-danger"
                                                onClick={() => handleExcluir(ex.exercicioId)}
                                                aria-label={`Excluir ${ex.nome}`}
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
                    type="button"
                    className="button academia-action-btn-main"
                    onClick={() => navigate('/exercicios/novo')}
                >
                    <ZeniteIcon name="plus" size={22} />
                    <span className="button-icon-text">Novo Exercício</span>
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