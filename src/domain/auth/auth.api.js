import { api } from '@/libs/axios/client';
const BASE = '/auth';
const USERS_BASE = `${BASE}/users`;
const ROLES_BASE = `${BASE}/roles`;
export const AuthApi = {
    register: (payload) => api.core
        .post(`${BASE}/register`, payload, { withCredentials: true })
        .then((r) => r.data),
    login: (payload) => api.core
        .post(`${BASE}/login`, payload, { withCredentials: true })
        .then((r) => r.data),
    refresh: () => api.core
        .post(`${BASE}/refresh`, undefined, { withCredentials: true })
        .then((r) => r.data),
    logout: () => api.core.post(`${BASE}/logout`, undefined, { withCredentials: true }).then(() => undefined),
    logoutAll: () => api.core.post(`${BASE}/logout-all`, undefined, { withCredentials: true }).then(() => undefined),
    me: (accessToken) => api.core
        .get(`${BASE}/me`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    })
        .then((r) => r.data),
};
export const AuthAdminApi = {
    listUsers: () => api.core.get(USERS_BASE).then((r) => r.data),
    getUser: (id) => api.core.get(`${USERS_BASE}/${id}`).then((r) => r.data),
    createUser: (payload) => api.core.post(USERS_BASE, payload).then((r) => r.data),
    updateUser: (id, payload) => api.core.put(`${USERS_BASE}/${id}`, payload).then((r) => r.data),
    deleteUser: (id) => api.core.delete(`${USERS_BASE}/${id}`).then(() => undefined),
    activateUser: (id) => api.core.post(`${USERS_BASE}/${id}/activate`).then((r) => r.data),
    deactivateUser: (id) => api.core.post(`${USERS_BASE}/${id}/deactivate`).then((r) => r.data),
    listRoles: () => api.core.get(ROLES_BASE).then((r) => r.data),
    getRole: (id) => api.core.get(`${ROLES_BASE}/${id}`).then((r) => r.data),
    createRole: (payload) => api.core.post(ROLES_BASE, payload).then((r) => r.data),
    updateRole: (id, payload) => api.core.put(`${ROLES_BASE}/${id}`, payload).then((r) => r.data),
    deleteRole: (id) => api.core.delete(`${ROLES_BASE}/${id}`).then(() => undefined),
    listUserRoles: (userId) => api.core.get(`${USERS_BASE}/${userId}/roles`).then((r) => r.data),
    assignUserRole: (userId, payload) => api.core.post(`${USERS_BASE}/${userId}/roles`, payload).then((r) => r.data),
    removeUserRole: (userId, role) => api.core
        .delete(`${USERS_BASE}/${userId}/roles/${encodeURIComponent(role)}`)
        .then((r) => r.data),
    listUserRefreshTokens: (userId) => api.core.get(`${USERS_BASE}/${userId}/refresh-tokens`).then((r) => r.data),
    revokeUserRefreshToken: (userId, tokenId) => api.core
        .post(`${USERS_BASE}/${userId}/refresh-tokens/${tokenId}/revoke`)
        .then(() => undefined),
    revokeAllUserRefreshTokens: (userId) => api.core.post(`${USERS_BASE}/${userId}/refresh-tokens/revoke-all`).then(() => undefined),
};
export function tokensFromAuthResponse(payload) {
    return {
        accessToken: payload.accessToken,
    };
}
