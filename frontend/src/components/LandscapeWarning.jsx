import { useEffect, useState } from 'react';
import ZeniteIcon from './ZeniteIcon';

export default function LandscapeWarning() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const check = () => {
            const isMobileUA = /Andriod|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isSmallScreen = Math.min(window.screen.width, window.screen.height) <= 480;
            const isMobile = isMobileUA && isSmallScreen;
            const isLandscape = window.matchMedia('(orientation: landscape)').matches;
            setShow(isMobile && isLandscape);
        };

        check();
        window.addEventListener('resize', check);
        window.addEventListener('orientationchange', check);

        return () => {
            window.removeEventListener('resize', check);
            window.removeEventListener('orientationchange', check);
        };
    }, []);

    if (!show) return null;

    return (
        <div className="landscape-warning-overlay">
            <div className="landscape-warning-card">
                <ZeniteIcon className="landscape-warning-icon" name="rotate-ccw" size={64} strokeWidth={1.5} />
                <p>Volte o telefone para o modo retrato para melhor experiência.</p>
            </div>
        </div>
    );
}
