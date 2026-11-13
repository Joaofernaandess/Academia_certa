import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ExercicioComboBox from '../../components/ExercicioCombobox';
import LoadingButton from '../../components/LoadingButton';
import LoadingWaves from '../../components/LoadingWaves';
import MessageModal from '../../components/MessageModal';
import ZeniteIcon from '../../components/ZeniteIcon';
import { atualizarTreino, criarTreino, obterTreino } from '../../services/treinoService';
import { aplicarErrosCampos, extrairErro } from '../../utils/apiUtils';

export default function NovoTreinoPage({ token, unidadeOrganizacionalId, usuarioId, canManage }) {
    const navigate = useNavigate();
    const { treinoId } = useParams();
    const isEdit = Boolean(treinoId);

    const [formData, setFormData] = useState({ diaSemana: '', titulo: '' });
    const [exerciciosAdicionados, setExerciciosAdicionados] = useState([]);

    const [fieldErrors, setFieldErrors] = useState({});
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    const [carregandoTreino, setCarregandoTreino] = useState(isEdit);

    useEffect(() => {
        if (!isEdit) return;
        setCarregandoTreino(true);
        obterTreino({ token, treinoId })
            .then(async (res) => {
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        diaSemana: data.diaSemana || '',
                        titulo: data.titulo || ''
                    });
                    const listaFormatada = (data.exercicios || []).map((ex) => ({
                        idLocal: ex.treinoExercicioId || Math.random().toString(36).slice(2, 11),
                        exercicioId: ex.exercicioId,
                        nomeExercicio: ex.nomeExercicio,
                        series: ex.series || '',
                        repeticoes: ex.repeticoes || '',
                        tempoDescanso: ex.tempoDescanso || '',
                        concluido: Boolean(ex.concluido)
                    }));
                    setExerciciosAdicionados(listaFormatada);
                } else {
                    setErro(await extrairErro(res));
                }
            })
            .catch(() => setErro('Não foi possível carregar o treino para edição.'))
            .finally(() => setCarregandoTreino(false));
    }, [isEdit, token, treinoId]);

    const handleSelecionarExercicio = (exercicio) => {
        const novoItem = {
            idLocal: Math.random().toString(36).slice(2, 11),
            exercicioId: exercicio.exercicioId,
            nomeExercicio: exercicio.nome,
            series: '4',
            repeticoes: '10-12',
            tempoDescanso: '60s',
            concluido: false
        };

        setExerciciosAdicionados(prev => [...prev, novoItem]);
        setFieldErrors(prev => ({ ...prev, Exercicios: '' }));
    };

    const handleAlterarCampoExercicio = (idLocal, campo, valor) => {
        setExerciciosAdicionados(prev =>
            prev.map(item => (item.idLocal === idLocal ? { ...item, [campo]: valor } : item))
        );
    };

    const handleRemoverExercicio = (idLocal) => {
        setExerciciosAdicionados(prev => prev.filter(e => e.idLocal !== idLocal));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setErro('');
        setFieldErrors({});
        setLoading(true);

        const payload = {
            unidadeOrganizacionalId,
            usuarioId,
            titulo: formData.titulo,
            diaSemana: formData.diaSemana,
            exercicios: exerciciosAdicionados
        };

        try {
            const response = isEdit
                ? await atualizarTreino({ token, treinoId, payload })
                : await criarTreino({ token, payload });

            if (response.ok) {
                navigate('/treinos', { replace: true });
            } else if (response.status === 400) {
                await aplicarErrosCampos(response, setFieldErrors, setErro);
            } else {
                setErro(await extrairErro(response));
            }
        } catch (err) {
            console.error(err);
            setErro('Erro de conexão ao tentar salvar o treino.');
        } finally {
            setLoading(false);
        }
    };

    if (carregandoTreino) {
        return <LoadingWaves variant="cards" rows={3} label="Carregando dados do treino" />;
    }

    const ghostClass = !canManage ? 'academia-btn-smoke-disabled' : '';

    return (
        <div className="detail-view detail-form-view space-detail-form-view space-create-form-view w-full">
            <div className="detail-heading">
                <h2 className="page-title no-margin">
                    {isEdit ? 'Editar Ficha de Treino' : 'Criar Ficha de Treino'}
                </h2>
            </div>

            <form className="detail-form-layout" onSubmit={handleSubmit} noValidate>
                <div className="card detail-card detail-form-scroll-card">
                    <div className="detail-card-body">
                        <div className="row detail-form-fields">
                            <div className="column-6 mb-1">
                                <label className="label-sm">Título do Treino</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Peito e Tríceps"
                                    value={formData.titulo}
                                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                    className={`w-full no-field-margin ${fieldErrors.Titulo ? 'is-invalid' : ''}`}
                                />
                                {fieldErrors.Titulo && <small className="invalid-feedback d-block">{fieldErrors.Titulo}</small>}
                            </div>
                            <div className="column-6 mb-1">
                                <label className="label-sm">Dia da Semana (ou Frequência)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Segunda-feira ou Treino A"
                                    value={formData.diaSemana}
                                    onChange={e => setFormData({ ...formData, diaSemana: e.target.value })}
                                    className={`w-full no-field-margin ${fieldErrors.DiaSemana ? 'is-invalid' : ''}`}
                                />
                                {fieldErrors.DiaSemana && <small className="invalid-feedback d-block">{fieldErrors.DiaSemana}</small>}
                            </div>

                            <div className="column-12 mb-1">
                                <ExercicioComboBox
                                    token={token}
                                    unidadeOrganizacionalId={unidadeOrganizacionalId}
                                    onSelect={handleSelecionarExercicio}
                                    error={!!fieldErrors.Exercicios}
                                    errorMessage={fieldErrors.Exercicios}
                                    action={
                                        <button
                                            type="button"
                                            disabled={!canManage}
                                            className={`button zf-input-with-action__button ${ghostClass}`}
                                            aria-label="Cadastrar novo exercício"
                                            title={canManage ? 'Novo Exercício' : 'Apenas gestores e administradores'}
                                            onClick={() => canManage && navigate('/exercicios/novo')}
                                        >
                                            <ZeniteIcon name="plus" size={22} />
                                        </button>
                                    }
                                />
                            </div>
                        </div>

                        <h3 className="section-title-reset mb-1">
                            Exercícios Selecionados ({exerciciosAdicionados.length})
                        </h3>

                        {exerciciosAdicionados.length === 0 ? (
                            <p className="text-muted text-center exercicios-empty-hint">
                                Selecione um exercício no campo acima para adicioná-lo automaticamente à lista.
                            </p>
                        ) : (
                            <div className="exercicios-added-list">
                                {exerciciosAdicionados.map((item, index) => (
                                    <div key={item.idLocal} className="exercicios-added-card">
                                        <div className="exercicios-added-header">
                                            <strong>{index + 1}. {item.nomeExercicio}</strong>
                                            <button
                                                type="button"
                                                className="button-icon-danger"
                                                onClick={() => handleRemoverExercicio(item.idLocal)}
                                                aria-label={`Remover ${item.nomeExercicio}`}
                                            >
                                                <ZeniteIcon name="trash" size={18} />
                                            </button>
                                        </div>

                                        <div className="row exercicios-added-inputs">
                                            <div className="column-4">
                                                <label className="label-sm">Séries</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex: 4"
                                                    value={item.series}
                                                    onChange={e => handleAlterarCampoExercicio(item.idLocal, 'series', e.target.value)}
                                                    className="w-full no-field-margin text-center"
                                                />
                                            </div>
                                            <div className="column-4">
                                                <label className="label-sm">Repetições</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex: 10-12"
                                                    value={item.repeticoes}
                                                    onChange={e => handleAlterarCampoExercicio(item.idLocal, 'repeticoes', e.target.value)}
                                                    className="w-full no-field-margin text-center"
                                                />
                                            </div>
                                            <div className="column-4">
                                                <label className="label-sm">Descanso</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex: 60s"
                                                    value={item.tempoDescanso}
                                                    onChange={e => handleAlterarCampoExercicio(item.idLocal, 'tempoDescanso', e.target.value)}
                                                    className="w-full no-field-margin text-center"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="detail-action-bar detail-action-bar-two">
                    <button type="button" className="button button-outline" onClick={() => navigate('/treinos')}>
                        Cancelar
                    </button>
                    <LoadingButton type="submit" className="button" loading={loading}>
                        <ZeniteIcon name="save" size={18} />
                        <span className="button-icon-text">
                            {isEdit ? ' Salvar Alterações' : ' Salvar Treino'}
                        </span>
                    </LoadingButton>
                </div>
            </form>

            {erro && <MessageModal type="error" message={erro} onClose={() => setErro('')} autoClose={8000} />}
        </div>
    );
}