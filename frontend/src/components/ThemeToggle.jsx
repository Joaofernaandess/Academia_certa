import { useEffect, useState } from 'react';
import ZeniteIcon from './ZeniteIcon';

const THEME_STORAGE_KEY = 'theme';

function getStoredTheme() {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : null;
}

function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeToggle({ fixo = true }) {
    const [theme, setTheme] = useState(() => getStoredTheme() || getSystemTheme());

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);

        const metaThemeColor = document.querySelector("meta[name='theme-color']");
        if (metaThemeColor) {
            metaThemeColor.setAttribute("content", theme === 'light' ? "#0A1F44" : "#D4AF37");
        }
    }, [theme]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const syncTheme = () => {
            setTheme(getStoredTheme() || getSystemTheme());
        };

        mediaQuery.addEventListener('change', syncTheme);
        window.addEventListener('storage', syncTheme);
        window.addEventListener('themechange', syncTheme);

        return () => {
            mediaQuery.removeEventListener('change', syncTheme);
            window.removeEventListener('storage', syncTheme);
            window.removeEventListener('themechange', syncTheme);
        };
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        setTheme(nextTheme);
        window.dispatchEvent(new Event('themechange'));
    };

    return (
        <button
            type="button"
            className={`button button-outline btn-mobile theme-toggle-button ${fixo ? 'theme-toggle-fixed' : ''}`}
            onClick={toggleTheme}
        >
            {theme === 'dark' ? (
                <>
                    <ZeniteIcon name="sun" size={18} />
                    <span className="texto-mobile button-icon-text">Modo Claro</span>
                </>
            ) : (
                <>
                    <ZeniteIcon name="moon" size={18} />
                    <span className="texto-mobile button-icon-text">Modo Escuro</span>
                </>
            )}
        </button>
    );
}