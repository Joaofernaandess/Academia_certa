import LoadingButton from '../../components/LoadingButton';

export default function ProfilePage({
    fieldErrors,
    formData,
    hasChanges,
    onCancel,
    onChange,
    onSubmit,
    isSaving
}) {
    return (
        <div className="detail-view detail-form-view space-detail-form-view space-create-form-view w-full">
            <div className="detail-heading">
                <h2 className="page-title no-margin">Alterar Meus Dados</h2>
            </div>
            <form className="detail-form-layout" onSubmit={onSubmit} noValidate>
                <div className="card detail-card detail-form-scroll-card">
                    <div className="detail-card-body">
                        <div className="row detail-form-fields">
                            <div className="column-12 mb-1">
                                <label className="label-sm">Nome</label>
                                <input
                                    type="text"
                                    placeholder="Digite seu nome"
                                    value={formData.nome}
                                    onChange={e => onChange({ ...formData, nome: e.target.value })}
                                    className={`w-full no-field-margin ${fieldErrors.Nome ? 'is-invalid' : ''}`}
                                />
                                {fieldErrors.Nome && <small className="invalid-feedback d-block">{fieldErrors.Nome}</small>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="detail-action-bar detail-action-bar-two">
                    <button type="button" className="button button-outline" onClick={onCancel}>Cancelar</button>
                    <LoadingButton type="submit" className="button" disabled={!hasChanges} loading={isSaving}>
                        Salvar
                    </LoadingButton>
                </div>
            </form>
        </div>
    );
}