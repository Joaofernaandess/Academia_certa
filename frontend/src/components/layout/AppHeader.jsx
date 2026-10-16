import ThemeToggle from '../ThemeToggle';
import ZeniteIcon from '../ZeniteIcon';

export default function AppHeader() {
    return (
        <header className="app-header">
            <div className="app-header-left">
                <label htmlFor="menu-toggle" className="button button-outline btn-mobile header-menu-button">
                    <ZeniteIcon name="menu" size={18} />
                    <span className="texto-mobile button-icon-text">Menu</span>
                </label>
            </div>

            <h3 className="app-brand">
                Academia Certa
            </h3>

            <div className="app-header-right">
                <ThemeToggle fixo={false} />
            </div>
        </header>
    );
}