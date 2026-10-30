import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoadingButton from '../../components/LoadingButton';
import MessageModal from '../../components/MessageModal';
import { listarEquipamentos } from '../../services/equipamentoService';
import { criarFeedback, listarFeedbacks } from '../../services/feedbackService';
import { aplicarErrosCampos, extrairErro, extrairMensagem } from '../../utils/apiUtils';

const IMAGEM_PADRAO = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80';

export default function FeedbackEquipamentoPage({ token, unidadeOrganizacionalId, usuarioId }) {
    const [searchParams] = useSearchParams();
    const equipamentoUrlId = searchParams.get('equipamentoId') || '';

    const [equipamentos, setEquipamentos] = useState([]);
    const [equipamentoId, setEquipamentoId] = useState(equipamentoUrlId);
    const [estrelas, setEstrelas] = useState(3);
    const [comentario, setComentario] = useState('');
    const [feedbacks, setFeedbacks] = useState([]);

    const [fieldErrors, setFieldErrors] = useState({});
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [loading, setLoading] = useState(false);

    const carregarDados = useCallback(async () => {
        if (!unidadeOrganizacionalId) return;
        try {
            const [resEq, resFb] = await Promise.all([
                listarEquipamentos({ token, unidadeOrganizacionalId }),
                listarFeedbacks({ token, unidadeOrganizacionalId })
            ]);
            if (resEq.ok) {
                const listaEq = await resEq.json();
                setEquipamentos(listaEq);
                if (!equipamentoId && listaEq.length > 0) {
                    setEquipamentoId(listaEq[0].equipamentoId);
                }
            }
            if (resFb.ok) {
                setFeedbacks(await resFb.json());
            }
        } catch (e) {
            console.error(e);
        }
    }, [token, unidadeOrganizacionalId, equipamentoId]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const equipamentoSelecionado = equipamentos.find(e => e.equipamentoId === equipamentoId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setErro('');
        setSucesso('');
        setFieldErrors({});
        setLoading(true);

        try {
            const res = await criarFeedback({
                token,
                payload: {
                    unidadeOrganizacionalId,
                    equipamentoId: equipamentoId || null,
                    usuarioId,
                    estrelas,
                    comentario
                }
            });

            if (res.ok) {
                setSucesso(await extrairMensagem(res));
                setComentario('');
                setEstrelas(5);
                carregarDados();
            } else if (res.status === 400) {
                await aplicarErrosCampos(res, setFieldErrors, setErro);
            } else {
                setErro(await extrairErro(res));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="detail-view w-full feedback-view-container">
            <div className="detail-heading text-center mb-1">
                <h2 className="page-title no-margin">FEEDBACK DE EQUIPAMENTOS</h2>
            </div>

            <form className="card detail-card feedback-form-card" onSubmit={handleSubmit} noValidate>
                <div className="mb-1">
                    <label className="label-sm">Selecione o Equipamento</label>
                    <select
                        value={equipamentoId}
                        onChange={(e) => setEquipamentoId(e.target.value)}
                        className={`w-full no-field-margin ${fieldErrors.EquipamentoId ? 'is-invalid' : ''}`}
                    >
                        <option value="">Selecione...</option>
                        {equipamentos.map(eq => (
                            <option key={eq.equipamentoId} value={eq.equipamentoId}>
                                {eq.nome}
                            </option>
                        ))}
                    </select>
                    {fieldErrors.EquipamentoId && <small className="invalid-feedback d-block">{fieldErrors.EquipamentoId}</small>}
                </div>

                <div className="feedback-preview-box">
                    <img
                        src={equipamentoSelecionado?.imagemUrl || IMAGEM_PADRAO}
                        alt={equipamentoSelecionado?.nome || 'Equipamento'}
                        className="feedback-preview-img"
                    />
                    <div className="feedback-preview-badge">
                        {equipamentoSelecionado?.nome || 'Nenhum equipamento selecionado'}
                    </div>
                </div>

                <div className="card mb-1 feedback-stars-box">
                    {[1, 2, 3, 4, 5].map((num) => {
                        const ativa = num <= estrelas;
                        return (
                            <button
                                key={num}
                                type="button"
                                onClick={() => setEstrelas(num)}
                                className={`feedback-star-btn ${ativa ? 'is-active' : ''}`}
                                aria-label={`Avaliar com ${num} estrelas`}
                            >
                                ★
                            </button>
                        );
                    })}
                </div>
                {fieldErrors.Estrelas && <small className="invalid-feedback d-block mb-1">{fieldErrors.Estrelas}</small>}

                <div className="mb-2">
                    <textarea
                        rows={4}
                        placeholder="Deixe seu comentário ou feedback..."
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        className={`w-full no-field-margin ${fieldErrors.Comentario ? 'is-invalid' : ''}`}
                    />
                    {fieldErrors.Comentario && <small className="invalid-feedback d-block">{fieldErrors.Comentario}</small>}
                </div>

                <LoadingButton type="submit" className="button button-full" loading={loading}>
                    Enviar
                </LoadingButton>
            </form>

            {feedbacks.length > 0 && (
                <div className="mt-2">
                    <h3 className="page-title mb-1 feedback-history-title">Últimos Feedbacks</h3>
                    {feedbacks.map(fb => (
                        <div key={fb.feedbackId} className="card mb-1 feedback-history-card">
                            <div className="feedback-history-header">
                                <strong>{fb.equipamentoNome}</strong>
                                <span className="feedback-history-stars">
                                    {'★'.repeat(fb.estrelas)}{'☆'.repeat(5 - fb.estrelas)}
                                </span>
                            </div>
                            <p className="feedback-history-comment">{fb.comentario}</p>
                            <small className="text-muted">
                                Por: {fb.usuarioNome || 'Aluno'}
                            </small>
                        </div>
                    ))}
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