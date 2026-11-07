import { NavLink, useNavigate } from 'react-router-dom';
import ZeniteIcon from '../ZeniteIcon';
import { APP_VERSION } from '../../config/appVersion';

const isIOS = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
};

export default function Sidebar({ isInstalled, organizacaoNome, organizacaoLogoUrl, onInstallClick, onLogoutClick, usuarioNome }) {
    const navigate = useNavigate();

    const closeMenu = () => {
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) {
            menuToggle.checked = false;
            menuToggle.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };

    return (
        <>
            <div className="sidebar-overlay">
                <label htmlFor="menu-toggle" className="sidebar-backdrop-toggle"></label>
            </div>
            <aside className="sidebar">
                <button type="button" className="sidebar-close-icon" onClick={closeMenu} aria-label="Fechar menu">
                    <ZeniteIcon name="x" size={22} />
                </button>

                <div className="sidebar-body">
                    <div className="sidebar-brand-block">
                        <img
                            className="sidebar-logo"
                            src={organizacaoLogoUrl || '/academia-certa-logo.png'}
                            alt={organizacaoNome ? `Logo da ${organizacaoNome}` : 'Academia Certa — Gestão Fitness'}
                            onError={event => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = '/academia-certa-logo.png';
                            }}
                        />
                    </div>

                    <div className="sidebar-nav">
                        <NavLink to="/" end onClick={closeMenu}>Início</NavLink>
                        <NavLink to="/alunos" onClick={closeMenu}>Alunos</NavLink>
                        <NavLink to="/planos" onClick={closeMenu}>Planos</NavLink>
                        <NavLink to="/instrutores" onClick={closeMenu}>Instrutores</NavLink>
                        <NavLink to="/controle-pagamentos" onClick={closeMenu}>Controle de Pagamento</NavLink>
                        <NavLink to="/treinos" onClick={closeMenu}>Treinos</NavLink>
                        <NavLink to="/equipamentos" onClick={closeMenu}>Equipamentos</NavLink>
                        <NavLink to="/feedback" onClick={closeMenu}>Feedback</NavLink>
                        {!isInstalled && (
                            <NavLink
                                to="/instalar-ios"
                                onClick={async (event) => {
                                    closeMenu();
                                    if (isIOS()) return;
                                    event.preventDefault();
                                    const installed = await onInstallClick();
                                    if (!installed) navigate('/instalar-ios');
                                }}
                            >
                                Adicionar a tela inicial
                            </NavLink>
                        )}
                    </div>
                </div>

                <div className="sidebar-footer">
                    {(usuarioNome || organizacaoNome) && (
                        <div className="sidebar-user-block">
                            {usuarioNome && <p className="sidebar-user-name">{usuarioNome}</p>}
                            {organizacaoNome && <p className="sidebar-user-org">{organizacaoNome}</p>}
                        </div>
                    )}
                    <NavLink
                        to="/meus-dados"
                        onClick={closeMenu}
                        className={({ isActive }) => `link-action text-center d-block mb-1 ${isActive ? 'active' : ''}`}
                    >
                        Alterar Meus Dados
                    </NavLink>
                    <button onClick={onLogoutClick} className="button button-danger sidebar-logout-button">
                        Sair do Sistema
                    </button>

                    <div className="sidebar-version">
                        <p className="sidebar-version">v{APP_VERSION}</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
