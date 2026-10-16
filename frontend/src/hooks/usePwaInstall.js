import { useCallback, useEffect, useState } from 'react';

export function usePwaInstall() {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const updateInstalledState = () => {
            setIsInstalled(
                window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone === true
            );
        };

        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault();
            setInstallPrompt(event);
        };

        const handleAppInstalled = () => {
            setInstallPrompt(null);
            setIsInstalled(true);
        };

        updateInstalledState();
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const install = useCallback(async () => {
        if (!installPrompt) return false;

        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        setInstallPrompt(null);

        return choice.outcome === 'accepted';
    }, [installPrompt]);

    return {
        canInstall: Boolean(installPrompt),
        install,
        isInstalled
    };
}