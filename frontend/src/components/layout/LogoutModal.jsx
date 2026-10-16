export default function LogoutModal({ onCancel, onConfirm }) {
    return (
        <div className="modal-overlay">
            <div className="card modal-card">
                <div className="modal-card-body">
                    <h2 className="modal-title">Sair do Sistema</h2>
                    <p className="modal-description">Tem certeza que deseja encerrar a sua sessão?</p>
                    <div className="modal-actions">
                        <button type="button" className="button button-outline button-flex" onClick={onCancel}>Cancelar</button>
                        <button type="button" className="button button-danger button-flex" onClick={onConfirm}>Sair</button>
                    </div>
                </div>
            </div>
        </div>
    );
}