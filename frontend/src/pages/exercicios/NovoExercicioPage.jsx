import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArquivoUploadArea from '../../components/ArquivoUploadArea';
import LoadingButton from '../../components/LoadingButton';
import LoadingWaves from '../../components/LoadingWaves';
import MessageModal from '../../components/MessageModal';
import ZeniteIcon from '../../components/ZeniteIcon';
import { atualizarExercicio, criarExercicio, obterExercicio } from '../../services/exercicioService';
import { aplicarErrosCampos, extrairErro, extrairMensagem } from '../../utils/apiUtils';

export default function NovoExercicioPage({ token, unidadeOrganizacionalId }) {
    const navigate = useNavigate();
    const { exercicioId } = useParams();
    const isEdit = Boolean(exercicioId);

    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        arquivoUrl: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    const [carregando, setCarregando] = useState(isEdit);

    useEffect(() => {
        if (!isEdit) return;
        setCarregando(true);
        obterExercicio({ token, exercicioId })
            .then(async (res) => {
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        nome: data.nome || '',
                        descricao: data.descricao || '',
                        arquivoUrl: data.arquivoUrl || ''
                    });
                } else {
                    setErro(await extrairErro(res));
                }
            })
            .catch(() => setErro('Não foi possível carregar o exercício.'))
            .finally(() => setCarregando(false));
    }, [exercicioId, isEdit, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setErro('');
        setFieldErrors({});
        setLoading(true);

        const payload = {
            unidadeOrganizacionalId,
            ...formData
        };

        try {
            const response = isEdit
                ? await atualizarExercicio({ token, exercicioId, payload })
                : await criarExercicio({ token, payload });

            if (response.ok) {
                const mensagem = await extrairMensagem(response);
                navigate('/exercicios', { replace: true, state: { sucesso: mensagem } });
            } else if (response.status === 400) {
                await aplicarErrosCampos(response, setFieldErrors, setErro);
            } else {
                setErro(await extrairErro(response));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (carregando) {
        return <LoadingWaves variant="cards" rows={2} label="Carregando exercício" />;
    }

    return (
        <div className="detail-view detail-form-view space-detail-form-view space-create-form-view w-full">
            <div className="detail-heading">
                <h2 className="page-title no-margin">
                    {isEdit ? 'Editar Exercício' : 'Novo Exercício'}
                </h2>
            </div>
            <form className="detail-form-layout" onSubmit={handleSubmit} noValidate>
                <div className="card detail-card detail-form-scroll-card">
                    <div className="detail-card-body">
                        <div className="row detail-form-fields">
                            <div className="column-12 mb-1">
                                <label className="label-sm">Nome do Exercício</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Supino Reto com Barra, Agachamento Livre..."
                                    value={formData.nome}
                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                    className={`w-full no-field-margin ${fieldErrors.Nome ? 'is-invalid' : ''}`}
                                />
                                {fieldErrors.Nome && <small className="invalid-feedback d-block">{fieldErrors.Nome}</small>}
                            </div>

                            <div className="column-12 mb-1">
                                <label className="label-sm">Descrição / Instruções de Execução</label>
                                <textarea
                                    rows={3}
                                    placeholder="Ex: Deite no banco, desça a barra até o peito e empurre..."
                                    value={formData.descricao}
                                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                    className="w-full no-field-margin"
                                />
                            </div>

                            <div className="column-12 mb-1">
                                <label className="label-sm">Demonstração do Exercício (Imagem, GIF ou Vídeo)</label>
                                <ArquivoUploadArea
                                    value={formData.arquivoUrl}
                                    onChange={(novoArquivo) => setFormData({ ...formData, arquivoUrl: novoArquivo })}
                                    arquivoInputId="exercicio-arquivo-input"
                                    fotoInputId="exercicio-foto-input"
                                    aceitarArquivo="image/*,video/mp4,video/webm"
                                    mensagemVazia="Envie uma foto, GIF ou vídeo da execução do exercício"
                                    variant="wizard"
                                    headerContent={<span className="label-sm no-margin">Prévia da Execução</span>}
                                    onError={setErro}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="detail-action-bar detail-action-bar-two">
                    <button type="button" className="button button-outline" onClick={() => navigate(-1)}>
                        Voltar
                    </button>
                    <LoadingButton type="submit" className="button" loading={loading}>
                        <ZeniteIcon name="save" size={18} />
                        <span className="button-icon-text"> Salvar</span>
                    </LoadingButton>
                </div>
            </form>
            {erro && <MessageModal type="error" message={erro} onClose={() => setErro('')} autoClose={8000} />}
        </div>
    );
}