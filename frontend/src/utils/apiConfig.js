export const getBaseUrl = () => {
    if (typeof window !== 'undefined' && window.location?.hostname) {
        return `http://${window.location.hostname}:5120`;
    }
    return 'http://localhost:5120';
};