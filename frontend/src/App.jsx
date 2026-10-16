import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageModal from './components/MessageModal';
import AppRoutes from './routes/AppRoutes';
import LandscapeWarning from './components/LandscapeWarning';

export default function App() {
    const navigate = useNavigate();
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [sessionExpiredMessage, setSessionExpiredMessage] = useState('');

    useEffect(() => {
        const handleSessionExpired = (event) => {
            if (!localStorage.getItem('token')) return;

            setSessionExpiredMessage(event.detail?.message || '');
        };

        window.addEventListener('estoque-certo:session-expired', handleSessionExpired);
        return () => window.removeEventListener('estoque-certo:session-expired', handleSessionExpired);
    }, []);

    const handleLogin = (userToken) => {
        localStorage.setItem('token', userToken);
        setToken(userToken);
        navigate('/', { replace: true });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        navigate('/login', { replace: true });
    };

    const handlePendingApproval = () => {
        navigate('/waiting-approval', { replace: true });
    };

    const handleSessionExpiredClose = () => {
        setSessionExpiredMessage('');
        handleLogout();
    };

    return (
        <>
            <LandscapeWarning />
            
            <AppRoutes
                token={token}
                onLogin={handleLogin}
                onLogout={handleLogout}
                onPendingApproval={handlePendingApproval}
            />

            {sessionExpiredMessage && (
                <MessageModal
                type="error"
                message={sessionExpiredMessage}
                onClose={handleSessionExpiredClose}
                autoClose={8000}
                />
            )}
        </>
    );
}
