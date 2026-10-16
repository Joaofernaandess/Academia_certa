import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import ZeniteIcon from '../components/ZeniteIcon';

export default function CompanyPendingApprovalPage() {
    const navigate = useNavigate();

    return (
        <>
            <div className="container">
                <div className="auth-page pending-approval-page">
                    <div className="auth-page-theme">
                        <ThemeToggle fixo={false} />
                    </div>

                    <div className="pending-approval-content">
                        <div className="card auth-card pending-approval-card text-center">
                            <div className="pending-approval-icon">
                                <ZeniteIcon name="rocket" size={120} strokeWidth={1.6} />
                            </div>

                            <h1 className="pending-approval-title">Quase lá!</h1>

                            <p className="pending-approval-main">
                                Sua empresa está aguardando aprovação final.
                            </p>

                            <p className="pending-approval-description">
                                Isso pode levar algumas horas.
                            </p>
                        </div>
                    </div>

                    <div className="detail-action-bar detail-action-bar-one">
                        <button
                            type="button"
                            className="button button-outline"
                            onClick={() => navigate('/login', { replace: true })}
                        >
                            Entendi
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}