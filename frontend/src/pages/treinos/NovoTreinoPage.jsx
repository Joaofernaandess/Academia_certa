import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingButton from '../../components/LoadingButton';
import ZeniteIcon from '../../components/ZeniteIcon';

export default function NovoTreinoPage({ token, unidadeOrganizacionalId, usuarioId }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        diaSemana: '',
        titulo: ''
    });
    
    // Deixaremos a lógica completa de salvar para o próximo passo!
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Salvar treino em construção...");
    };

    return (
        <div className="detail-view detail-form-view space-detail-form-view space-create-form-view w-full">
            <div className="detail-heading">
                <h2 className="page-title no-margin">Criar Ficha de Treino</h2>
            </div>
            
            <form className="detail-form-layout" onSubmit={handleSubmit} noValidate>
                <div className="card detail-card detail-form-scroll-card">
                    <div className="detail-card-body">
                        <div className="row detail-form-fields">
                            <div className="column-12 mb-1">
                                <label className="label-sm">Título do Treino</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Peito e Tríceps"
                                    value={formData.titulo}
                                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                    className="w-full no-field-margin"
                                />
                            </div>
                            <div className="column-12 mb-1">
                                <label className="label-sm">Dia da Semana (ou Frequência)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Segunda-feira ou Treino A"
                                    value={formData.diaSemana}
                                    onChange={e => setFormData({ ...formData, diaSemana: e.target.value })}
                                    className="w-full no-field-margin"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="detail-action-bar detail-action-bar-two">
                    <button type="button" className="button button-outline" onClick={() => navigate('/treinos')}>
                        Voltar
                    </button>
                    <LoadingButton type="submit" className="button">
                        <ZeniteIcon name="save" size={18} />
                        <span className="button-icon-text"> Salvar Treino</span>
                    </LoadingButton>
                </div>
            </form>
        </div>
    );
}