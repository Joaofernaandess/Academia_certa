import { NavLink, useNavigate } from 'react-router-dom';
import ZeniteIcon from '../ZeniteIcon';
import { APP_VERSION } from '../../config/appVersion';

const isIOS = () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
};

export default function Sidebar({ isAdmin, isInstalled, organizacaoNome, onInstallClick, onLogoutClick, usuarioNome }) {
    const navigate = useNavigate();

    const isCebudv = organizacaoNome?.toUpperCase().startsWith('CEBUDV');

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
                        <h3 className="sidebar-title">Gestão Fitness</h3>
                        <p className="sidebar-subtitle">Academia Certa</p>
                    </div>

                    <div className="sidebar-nav">
                        <NavLink to="/" end onClick={closeMenu}>Início</NavLink>

                        {isAdmin && (
                            <NavLink to="/aprovar-usuarios" onClick={closeMenu}>Aprovar Usuários</NavLink>
                        )}
                        {isAdmin && (
                            <NavLink to="/aprovar-empresas" onClick={closeMenu}>Aprovar Empresas</NavLink>
                        )}
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
