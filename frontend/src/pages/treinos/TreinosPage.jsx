import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingWaves from '../../components/LoadingWaves';
import MessageModal from '../../components/MessageModal';
import ZeniteIcon from '../../components/ZeniteIcon';
import { alternarConcluido, listarTreinosUsuario } from '../../services/treinoService';
import { extrairErro } from '../../utils/apiUtils';

const IMAGEM_PADRAO = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80';

export default function TreinosPage({ token, usuarioId, usuarioNome }) {
    const navigate = useNavigate();
    const [treinos, setTreinos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    
    // Controle de qual treino está na tela e estado da modal
    const [selectedTreinoIndex, setSelectedTreinoIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);

    const carregarTreinos = useCallback(async () => {
        if (!usuarioId) return;
        setLoading(true);
        try {
            const res = await listarTreinosUsuario({ token, usuarioId });
            if (res.ok) {
                setTreinos(await res.json());
            } else {
                setErro(await extrairErro(res));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [token, usuarioId]);

    useEffect(() => {
        carregarTreinos();
    }, [carregarTreinos]);

    const handleToggleCheck = async (treinoIndex, exercicioIndex, exercicioId, statusAtual) => {
        const novosTreinos = [...treinos];
        novosTreinos[treinoIndex].exercicios[exercicioIndex].concluido = !statusAtual;
        setTreinos(novosTreinos);

        try {
            const res = await alternarConcluido({ token, exercicioId, concluido: !statusAtual });
            if (!res.ok) {
                novosTreinos[treinoIndex].exercicios[exercicioIndex].concluido = statusAtual;
                setTreinos([...novosTreinos]);
                setErro(await extrairErro(res));
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return <LoadingWaves variant="cards" rows={4} label="Carregando treinos" />;
    }

    if (treinos.length === 0) {
        return (
            <div className="w-full inventory-list-fixed">
                <div className="empty-state-plain">
                    <div className="empty-state-icon"><ZeniteIcon name="ban" size={92} /></div>
                    <p className="empty-state-text">Nenhum treino montado para você ainda.</p>
                </div>
                {/* Footer fixo caso não tenha treinos */}
                <div className="detail-action-bar detail-action-bar-one">
                    <button className="button academia-action-btn-main" onClick={() => navigate('/treinos/novo')}>
                        <ZeniteIcon name="plus" size={22} />
                        <span className="button-icon-text">Criar Treino</span>
                    </button>
                </div>
            </div>
        );
    }

    // Pega o treino selecionado com base no Index
    const treinoDoDia = treinos[selectedTreinoIndex];
    const totalExercicios = treinoDoDia.exercicios.length;
    const concluidos = treinoDoDia.exercicios.filter(e => e.concluido).length;
    const progressoPercent = totalExercicios === 0 ? 0 : (concluidos / totalExercicios) * 100;

    return (
        <div className="treino-view-container w-full">
            <header className="treino-header">
                <h1 className="treino-greeting">Olá, {usuarioNome.split(' ')[0]}</h1>
                
                {/* Linha com o Título do Treino e o Botão de Trocar */}
                <div className="treino-title-row">
                    <h2 className="treino-subtitle">{treinoDoDia.diaSemana} - {treinoDoDia.titulo}</h2>
                    
                    {treinos.length > 1 && (
                        <button className="treino-switch-btn" onClick={() => setShowModal(true)}>
                            Trocar Treino
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m16 3 4 4-4 4"/>
                                <path d="M20 7H4"/>
                                <path d="m8 21-4-4 4-4"/>
                                <path d="M4 17h16"/>
                            </svg>
                        </button>
                    )}
                </div>
                
                <div className="treino-progress-container">
                    <div className="treino-progress-bar-bg">
                        <div className="treino-progress-bar-fill" style={{ width: `${progressoPercent}%` }}></div>
                    </div>
                    <span className="treino-progress-text">
                        {concluidos}/{totalExercicios} Exercícios
                    </span>
                </div>
            </header>

            <main>
                {treinoDoDia.exercicios.map((ex, exIdx) => {
                    const tags = ex.gruposMusculares.split(',').map(t => t.trim()).filter(Boolean);
                    
                    return (
                        <div key={ex.treinoExercicioId} className="treino-card">
                            <img src={ex.equipamentoImagemUrl || IMAGEM_PADRAO} alt={ex.nomeExercicio} className="treino-card-thumb" />
                            
                            <div className="treino-card-content">
                                <h3 className="treino-card-title">{ex.nomeExercicio}</h3>
                                {tags.length > 0 && (
                                    <div className="treino-pills-row">
                                        {tags.map(tag => <span key={tag} className="treino-pill">{tag}</span>)}
                                    </div>
                                )}
                                <p className="treino-card-meta">
                                    {ex.series} {ex.carga ? ` • Carga: ${ex.carga}` : ''}
                                </p>
                            </div>

                            <div 
                                className={`treino-checkbox ${ex.concluido ? 'is-checked' : ''}`}
                                onClick={() => handleToggleCheck(selectedTreinoIndex, exIdx, ex.treinoExercicioId, ex.concluido)}
                            >
                                {ex.concluido && <ZeniteIcon name="check" size={18} strokeWidth={3} />}
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* Footer fixo para criar novo treino */}
            <div className="detail-action-bar detail-action-bar-one">
                <button className="button academia-action-btn-main" onClick={() => navigate('/treinos/novo')}>
                    <ZeniteIcon name="plus" size={22} />
                    <span className="button-icon-text">Criar Treino</span>
                </button>
            </div>

            {/* Modal de Escolha de Treinos */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="card modal-card">
                        <div className="modal-card-body">
                            <h2 className="modal-title">Meus Treinos</h2>
                            <p className="modal-description mb-1">Selecione a ficha que deseja visualizar:</p>
                            
                            <div className="treinos-modal-list">
                                {treinos.map((t, idx) => (
                                    <button
                                        key={t.treinoId}
                                        className={`treinos-modal-item ${idx === selectedTreinoIndex ? 'is-active' : ''}`}
                                        onClick={() => {
                                            setSelectedTreinoIndex(idx);
                                            setShowModal(false);
                                        }}
                                    >
                                        <strong>{t.diaSemana}</strong> - {t.titulo}
                                    </button>
                                ))}
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="button button-outline button-full" onClick={() => setShowModal(false)}>
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {erro && <MessageModal type="error" message={erro} onClose={() => setErro('')} />}
        </div>
    );
}