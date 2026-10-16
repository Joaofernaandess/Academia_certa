export const authHeaders = (token) => ({
    'Authorization': `Bearer ${token}`
});

export const jsonHeaders = (token) => ({
    'Content-Type': 'application/json',
    ...authHeaders(token)
});