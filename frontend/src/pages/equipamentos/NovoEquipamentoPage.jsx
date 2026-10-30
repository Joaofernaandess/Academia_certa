import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '../../components/LoadingButton';
import MessageModal from '../../components/MessageModal';
import ZeniteIcon from '../../components/ZeniteIcon';
import { criarEquipamento } from '../../services/equipamentoService';
import { aplicarErrosCampos, extrairErro, extrairMensagem } from '../../utils/apiUtils';

export default function NovoEquipamentoPage({ token, unidadeOrganizacionalId }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nome: '',
        grupoMuscular: '',
        imagemUrl: ''
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setErro('');
        setFieldErrors({});
        setLoading(true);

        try {
            const response = await criarEquipamento({
                token,
                payload: {
                    unidadeOrganizacionalId,
                    ...formData
                }
            });

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

    return (
        <div className="detail-view detail-form-view space-detail-form-view space-create-form-view w-full">
            <div className="detail-heading">
                <h2 className="page-title no-margin">Novo Equipamento</h2>
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
                                <label className="label-sm">URL da Foto do Equipamento (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="https://exemplo.com/foto-crossover.jpg"
                                    value={formData.imagemUrl}
                                    onChange={e => setFormData({ ...formData, imagemUrl: e.target.value })}
                                    className="w-full no-field-margin"
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