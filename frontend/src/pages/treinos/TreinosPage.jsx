import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '../../components/LoadingButton';
import LoadingWaves from '../../components/LoadingWaves';
import MessageModal from '../../components/MessageModal';
import ZeniteIcon from '../../components/ZeniteIcon';
import { alternarConcluido, excluirTreino, listarTreinosUsuario } from '../../services/treinoService';
import { extrairErro, extrairMensagem } from '../../utils/apiUtils';

const IMAGEM_PADRAO = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80';

export default function TreinosPage({ token, usuarioId, usuarioNome }) {
    const navigate = useNavigate();
    const [treinos, setTreinos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    const [selectedTreinoIndex, setSelectedTreinoIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [mediaModal, setMediaModal] = useState(null);
    const [treinoParaExcluir, setTreinoParaExcluir] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const handleConfirmarExclusao = async () => {
        if (!treinoParaExcluir || isDeleting) return;
        setIsDeleting(true);
        setErro('');
        setSucesso('');

        try {
            const res = await excluirTreino({ token, treinoId: treinoParaExcluir.treinoId });
            if (res.ok) {
                const msg = await extrairMensagem(res);
                if (msg) setSucesso(msg);
                setTreinos(prev => prev.filter(t => t.treinoId !== treinoParaExcluir.treinoId));
                setSelectedTreinoIndex(0);
                setTreinoParaExcluir(null);
            } else {
                setErro(await extrairErro(res));
            }
        } catch (e) {
            console.error(e);
            setErro('Erro ao excluir a ficha de treino.');
        } finally {
            setIsDeleting(false);
        }
    };

    const isVideo = (url) => {
        if (!url) return false;
        return (
            url.startsWith('data:video/') ||
            url.toLowerCase().endsWith('.mp4') ||
            url.toLowerCase().endsWith('.webm')
        );
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
                <div className="detail-action-bar detail-action-bar-one">
                    <button className="button academia-action-btn-main" onClick={() => navigate('/treinos/novo')}>
                        <ZeniteIcon name="plus" size={22} />
                        <span className="button-icon-text">Criar Treino</span>
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

    const treinoDoDia = treinos[selectedTreinoIndex] || treinos[0];
    const totalExercicios = treinoDoDia.exercicios.length;
    const concluidos = treinoDoDia.exercicios.filter(e => e.concluido).length;
    const progressoPercent = totalExercicios === 0 ? 0 : (concluidos / totalExercicios) * 100;

    return (
        <div className="treino-view-container w-full">
            <header className="treino-header">
                <h1 className="treino-greeting">Olá, {usuarioNome?.split(' ')[0]}</h1>

                <div className="treino-title-row">
                    <h2 className="treino-subtitle">{treinoDoDia.diaSemana} - {treinoDoDia.titulo}</h2>

                    <div className="treino-header-actions">
                        <button
                            type="button"
                            className="treino-switch-btn"
                            onClick={() => navigate(`/treinos/${treinoDoDia.treinoId}/editar`)}
                            title="Editar ficha de treino"
                        >
                            <ZeniteIcon name="pencil" size={15} />
                            Editar
                        </button>

                        <button
                            type="button"
                            className="treino-delete-btn"
                            onClick={() => setTreinoParaExcluir(treinoDoDia)}
                            title="Excluir ficha de treino"
                            aria-label="Excluir ficha de treino"
                        >
                            <ZeniteIcon name="trash" size={16} />
                        </button>

                        {treinos.length > 1 && (
                            <button type="button" className="treino-switch-btn" onClick={() => setShowModal(true)}>
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
                {treinoDoDia.exercicios.map((ex, exIdx) => (
                    <div key={ex.treinoExercicioId} className="treino-card">
                        <div
                            className="treino-card-thumb-wrapper"
                            onClick={() => setMediaModal({ url: ex.arquivoUrl || IMAGEM_PADRAO, nome: ex.nomeExercicio })}
                        >
                            <img src={ex.arquivoUrl || IMAGEM_PADRAO} alt={ex.nomeExercicio} className="treino-card-thumb" />
                            <div className="treino-card-play-icon">
                                <ZeniteIcon name="search" size={16} strokeWidth={3} />
                            </div>
                        </div>

                        <div className="treino-card-content">
                            <h3 className="treino-card-title">{ex.nomeExercicio}</h3>
                            <p className="treino-card-meta">
                                <strong>{ex.series}</strong> séries x <strong>{ex.repeticoes}</strong> reps
                            </p>
                            <p className="treino-card-rest">
                                Descanso: {ex.tempoDescanso || 'Livre'}
                            </p>
                        </div>

                        <div
                            className={`treino-checkbox ${ex.concluido ? 'is-checked' : ''}`}
                            onClick={() => handleToggleCheck(selectedTreinoIndex, exIdx, ex.treinoExercicioId, ex.concluido)}
                        >
                            {ex.concluido && <ZeniteIcon name="check" size={18} strokeWidth={3} />}
                        </div>
                    </div>
                ))}
            </main>

            <div className="detail-action-bar detail-action-bar-one">
                <button className="button academia-action-btn-main" onClick={() => navigate('/treinos/novo')}>
                    <ZeniteIcon name="plus" size={22} />
                    <span className="button-icon-text">Criar Treino</span>
                </button>
            </div>

            {mediaModal && (
                <div className="modal-overlay" onClick={() => setMediaModal(null)}>
                    <div className="card modal-card media-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-card-body media-modal-body">
                            <h3 className="modal-title mb-1 media-modal-title">{mediaModal.nome}</h3>
                            <div className="media-modal-content-wrapper">
                                {isVideo(mediaModal.url) ? (
                                    <video src={mediaModal.url} autoPlay loop muted playsInline className="media-modal-content" />
                                ) : (
                                    <img src={mediaModal.url} alt={mediaModal.nome} className="media-modal-content" />
                                )}
                            </div>
                            <button className="button button-full mt-1" onClick={() => setMediaModal(null)}>Fechar</button>
                        </div>
                    </div>
                </div>
            )}

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
                                        type="button"
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

            {treinoParaExcluir && (
                <div className="modal-overlay">
                    <div className="card modal-card">
                        <div className="modal-card-body">
                            <h2 className="modal-title">Excluir Ficha de Treino</h2>
                            <p className="modal-description">
                                Tem certeza que deseja excluir o treino <strong>{treinoParaExcluir.diaSemana} - {treinoParaExcluir.titulo}</strong>?
                            </p>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="button button-outline button-flex"
                                    onClick={() => setTreinoParaExcluir(null)}
                                >
                                    Cancelar
                                </button>
                                <LoadingButton
                                    type="button"
                                    className="button button-danger button-flex"
                                    onClick={handleConfirmarExclusao}
                                    loading={isDeleting}
                                >
                                    Excluir
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