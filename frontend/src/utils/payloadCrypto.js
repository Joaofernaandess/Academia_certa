// src/utils/payloadCrypto.js
const toBase64 = (str) => btoa(unescape(encodeURIComponent(str)));
const fromBase64 = (b64) => decodeURIComponent(escape(atob(b64)));

export const encryptedJsonBody = async (payload) => {
    const json = JSON.stringify(payload ?? {});
    return JSON.stringify({
        key: 'SIMPLE',
        iv: 'SIMPLE',
        payload: toBase64(json)
    });
};

export const encryptedJsonBodyWithKey = async (payload) => {
    return {
        aesKey: 'SIMPLE',
        body: await encryptedJsonBody(payload)
    };
};

export const decryptEncryptedResponse = async (encryptedResponse) => {
    if (!encryptedResponse?.payload) return encryptedResponse;
    const json = fromBase64(encryptedResponse.payload);
    return JSON.parse(json);
};

export const encryptedFetch = async (url, { method = 'POST', headers = {}, payload } = {}) => {
    return fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        body: await encryptedJsonBody(payload)
    });
};