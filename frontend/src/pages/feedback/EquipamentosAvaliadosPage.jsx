import { useCallback, useEffect, useMemo, useState } from 'react';
import LoadingWaves from '../../components/LoadingWaves';
import MessageModal from '../../components/MessageModal';
import ZeniteIcon from '../../components/ZeniteIcon';
import PizzaDashboardChart from '../../components/charts/PizzaDashboardChart';
import { listarFeedbacks } from '../../services/feedbackService';
import { extrairErro } from '../../utils/apiUtils';

export default function EquipamentosAvaliadosPage({ token, unidadeOrganizacionalId }) {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState('');
    const [equipamentoSelecionadoId, setEquipamentoSelecionadoId] = useState(null);
    const [theme, setTheme] = useState(() => (
        document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'dark'
    ));

    useEffect(() => {
        const updateTheme = () => {
            setTheme(document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'dark');
        };
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    const carregarAvaliacoes = useCallback(async () => {
        if (!unidadeOrganizacionalId) return;
        setLoading(true);
        try {
            const res = await listarFeedbacks({ token, unidadeOrganizacionalId, top: 500 });
            if (res.ok) {
                setFeedbacks(await res.json());
            } else {
                setErro(await extrairErro(res));
            }
        } catch (e) {
            console.error(e);
            setErro('Não foi possível carregar as avaliações dos equipamentos.');
        } finally {
            setLoading(false);
        }
    }, [token, unidadeOrganizacionalId]);

    useEffect(() => {
        carregarAvaliacoes();
    }, [carregarAvaliacoes]);

    const equipamentosAvaliados = useMemo(() => {
        const mapa = new Map();

        feedbacks.forEach((fb) => {
            if (!fb.equipamentoId) return;
            if (!mapa.has(fb.equipamentoId)) {
                mapa.set(fb.equipamentoId, {
                    equipamentoId: fb.equipamentoId,
                    equipamentoNome: fb.equipamentoNome || 'Equipamento',
                    equipamentoImagemUrl: fb.equipamentoImagemUrl || '',
                    quantidadeAvaliacoes: 0,
                    somaEstrelas: 0,
                    mediaEstrelas: 0,
                    avaliacoes: []
                });
            }

            const item = mapa.get(fb.equipamentoId);
            item.quantidadeAvaliacoes += 1;
            item.somaEstrelas += Number(fb.estrelas || 0);
            item.mediaEstrelas = item.somaEstrelas / item.quantidadeAvaliacoes;
            item.avaliacoes.push(fb);
        });

        return Array.from(mapa.values()).sort((a, b) => {
            if (a.mediaEstrelas !== b.mediaEstrelas) {
                return a.mediaEstrelas - b.mediaEstrelas;
            }
            return b.quantidadeAvaliacoes - a.quantidadeAvaliacoes;
        });
    }, [feedbacks]);

    const dadosGrafico = useMemo(() => (
        equipamentosAvaliados.map((item) => ({
            label: item.equipamentoNome,
            value: item.quantidadeAvaliacoes
        }))
    ), [equipamentosAvaliados]);

    const equipamentoModal = useMemo(() => (
        equipamentosAvaliados.find((e) => e.equipamentoId === equipamentoSelecionadoId) || null
    ), [equipamentosAvaliados, equipamentoSelecionadoId]);

    const formatarEstrelas = (nota) => {
        const arredondada = Math.max(1, Math.min(5, Math.round(nota)));
        return '★'.repeat(arredondada) + '☆'.repeat(5 - arredondada);
    };

    const formatarDataHora = (isoStr) => {
        if (!isoStr) return '';
        const data = new Date(isoStr);
        if (Number.isNaN(data.getTime())) return '';
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="w-full avaliacoes-admin-container">
            <div className="detail-heading mb-1">
                <h2 className="page-title no-margin">Equipamentos Avaliados</h2>
            </div>

            {loading ? (
                <LoadingWaves variant="cards" rows={3} label="Carregando avaliações" />
            ) : equipamentosAvaliados.length === 0 ? (
                <div className="empty-state-plain">
                    <div className="empty-state-icon">
                        <ZeniteIcon name="ban" size={92} strokeWidth={1.7} />
                    </div>
                    <p className="empty-state-text">Nenhuma avaliação registrada para os equipamentos até o momento.</p>
                </div>
            ) : (
                <div className="avaliacoes-admin-grid">
                    <div className="card avaliacoes-chart-card">
                        <h3 className="avaliacoes-section-title">Quantidade de Avaliações por Equipamento</h3>
                        <PizzaDashboardChart data={dadosGrafico} theme={theme} unidade="avaliações" />
                    </div>

                    <div className="card avaliacoes-list-card">
                        <h3 className="avaliacoes-section-title">Equipamentos Mais Mal Avaliados</h3>
                        <p className="avaliacoes-section-subtitle">
                            Clique em um equipamento para ver quem avaliou e os comentários detalhados.
                        </p>

                        <div className="avaliacoes-ranking-list">
                            {equipamentosAvaliados.map((item, index) => (
                                <button
                                    key={item.equipamentoId}
                                    type="button"
                                    className="avaliacoes-ranking-item"
                                    onClick={() => setEquipamentoSelecionadoId(item.equipamentoId)}
                                >
                                    <div className="avaliacoes-ranking-left">
                                        <span className="avaliacoes-ranking-pos">{index + 1}º</span>
                                        <div className="avaliacoes-ranking-info">
                                            <strong className="avaliacoes-ranking-name">{item.equipamentoNome}</strong>
                                            <span className="avaliacoes-ranking-count">
                                                {item.quantidadeAvaliacoes} {item.quantidadeAvaliacoes === 1 ? 'avaliação' : 'avaliações'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="avaliacoes-ranking-right">
                                        <span className="avaliacoes-ranking-stars">
                                            {formatarEstrelas(item.mediaEstrelas)}
                                        </span>
                                        <span className="avaliacoes-ranking-avg">
                                            Média: {item.mediaEstrelas.toFixed(1)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {equipamentoModal && (
                <div className="modal-overlay">
                    <div className="card modal-card avaliacoes-modal-card">
                        <div className="modal-card-body">
                            <h2 className="modal-title">{equipamentoModal.equipamentoNome}</h2>
                            <p className="modal-description mb-1">
                                Média de {equipamentoModal.mediaEstrelas.toFixed(1)} estrelas em {equipamentoModal.quantidadeAvaliacoes} {equipamentoModal.quantidadeAvaliacoes === 1 ? 'avaliação' : 'avaliações'}:
                            </p>

                            <div className="avaliacoes-modal-list">
                                {equipamentoModal.avaliacoes.map((av) => (
                                    <div key={av.feedbackId} className="avaliacoes-modal-item">
                                        <div className="avaliacoes-modal-item-header">
                                            <strong className="avaliacoes-modal-user">
                                                {av.usuarioNome || 'Aluno'}
                                            </strong>
                                            <span className="feedback-history-stars">
                                                {'★'.repeat(av.estrelas)}{'☆'.repeat(5 - av.estrelas)}
                                            </span>
                                        </div>
                                        <p className="avaliacoes-modal-comment">{av.comentario}</p>
                                        {av.dataHora && (
                                            <small className="avaliacoes-modal-date">
                                                {formatarDataHora(av.dataHora)}
                                            </small>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="button button-outline button-full"
                                    onClick={() => setEquipamentoSelecionadoId(null)}
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {erro && (
                <MessageModal
                    type="error"
                    message={erro}
                    onClose={() => setErro('')}
                    autoClose={8000}
                />
            )}
        </div>
    );
}