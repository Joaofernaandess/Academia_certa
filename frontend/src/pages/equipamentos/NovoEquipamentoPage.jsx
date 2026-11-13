import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArquivoUploadArea from '../../components/ArquivoUploadArea';
import LoadingButton from '../../components/LoadingButton';
import LoadingWaves from '../../components/LoadingWaves';
import MessageModal from '../../components/MessageModal';
import ZeniteIcon from '../../components/ZeniteIcon';
import { atualizarEquipamento, criarEquipamento, obterEquipamento } from '../../services/equipamentoService';
import { aplicarErrosCampos, extrairErro, extrairMensagem } from '../../utils/apiUtils';

export default function NovoEquipamentoPage({ token, unidadeOrganizacionalId }) {
    const navigate = useNavigate();
    const { equipamentoId } = useParams();
    const isEdit = Boolean(equipamentoId);

    const [formData, setFormData] = useState({
        nome: '',
        grupoMuscular: '',
        imagemUrl: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);
    const [carregando, setCarregando] = useState(isEdit);

    useEffect(() => {
        if (!isEdit) return;
        setCarregando(true);
        obterEquipamento({ token, equipamentoId })
            .then(async (res) => {
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        nome: data.nome || '',
                        grupoMuscular: data.grupoMuscular || '',
                        imagemUrl: data.imagemUrl || ''
                    });
                } else {
                    setErro(await extrairErro(res));
                }
            })
            .catch(() => setErro('Não foi possível carregar os dados do equipamento.'))
            .finally(() => setCarregando(false));
    }, [equipamentoId, isEdit, token]);

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
                ? await atualizarEquipamento({ token, equipamentoId, payload })
                : await criarEquipamento({ token, payload });

            if (response.ok) {
                const mensagem = await extrairMensagem(response);
                navigate('/equipamentos', { replace: true, state: { sucesso: mensagem } });
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
        return <LoadingWaves variant="cards" rows={2} label="Carregando equipamento" />;
    }

    return (
        <div className="detail-view detail-form-view space-detail-form-view space-create-form-view w-full">
            <div className="detail-heading">
                <h2 className="page-title no-margin">
                    {isEdit ? 'Editar Equipamento' : 'Novo Equipamento'}
                </h2>
            </div>
            <form className="detail-form-layout" onSubmit={handleSubmit} noValidate>
                <div className="card detail-card detail-form-scroll-card">
                    <div className="detail-card-body">
                        <div className="row detail-form-fields">
                            <div className="column-12 mb-1">
                                <label className="label-sm">Nome do Equipamento</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Crossover (Polia), Supino Reto..."
                                    value={formData.nome}
                                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                    className={`w-full no-field-margin ${fieldErrors.Nome ? 'is-invalid' : ''}`}
                                />
                                {fieldErrors.Nome && <small className="invalid-feedback d-block">{fieldErrors.Nome}</small>}
                            </div>

                            <div className="column-12 mb-1">
                                <label className="label-sm">Grupos Musculares (separados por vírgula)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Peito, Ombro, Tríceps"
                                    value={formData.grupoMuscular}
                                    onChange={e => setFormData({ ...formData, grupoMuscular: e.target.value })}
                                    className="w-full no-field-margin"
                                />
                            </div>

                            <div className="column-12 mb-1">
                                <label className="label-sm">Foto do Equipamento</label>
                                <ArquivoUploadArea
                                    value={formData.imagemUrl}
                                    onChange={(novaImagem) => setFormData({ ...formData, imagemUrl: novaImagem })}
                                    arquivoInputId="equipamento-arquivo-input"
                                    fotoInputId="equipamento-foto-input"
                                    aceitarArquivo="image/*"
                                    mensagemVazia="Envie uma foto do equipamento ou tire uma foto na hora"
                                    variant="wizard"
                                    headerContent={<span className="label-sm no-margin">Prévia da Imagem</span>}
                                    onError={setErro}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="detail-action-bar detail-action-bar-two">
                    <button type="button" className="button button-outline" onClick={() => navigate('/equipamentos')}>
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