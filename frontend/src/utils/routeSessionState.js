const PREFIX = 'estoque-certo:route-state:';

export const readRouteSessionState = (key) => {
    try {
        const value = sessionStorage.getItem(`${PREFIX}${key}`);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        return null;
    }
};

export const saveRouteSessionState = (key, value) => {
    try {
        sessionStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    } catch (error) {
        return null;
    }
};

export const clearRouteSessionState = (key) => {
    try {
        sessionStorage.removeItem(`${PREFIX}${key}`);
    } catch (error) {
        return null;
    }
};