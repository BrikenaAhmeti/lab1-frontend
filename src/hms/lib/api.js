import axios from 'axios';
import { buildQueryString, normalizeArrayResponse, normalizeListResponse } from './utils';
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const apiClient = axios.create({
    baseURL,
});
const authClient = axios.create({
    baseURL,
});
let getAccessToken = () => '';
let getRefreshToken = () => '';
let onRefreshSuccess = () => { };
let onRefreshFailure = () => { };
let refreshRequest = null;
export function configureApiClient(config) {
    getAccessToken = config.getAccessToken;
    getRefreshToken = config.getRefreshToken;
    onRefreshSuccess = config.onRefreshSuccess;
    onRefreshFailure = config.onRefreshFailure;
}
apiClient.interceptors.request.use((config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});
apiClient.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isRefreshCall = String(originalRequest?.url || '').includes('/auth/refresh');
    if (!isUnauthorized || originalRequest?._retry || isRefreshCall) {
        throw error;
    }
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        onRefreshFailure();
        throw error;
    }
    originalRequest._retry = true;
    if (!refreshRequest) {
        refreshRequest = authClient
            .post('/auth/refresh', { refreshToken })
            .then((response) => response.data)
            .finally(() => {
            refreshRequest = null;
        });
    }
    try {
        const payload = await refreshRequest;
        onRefreshSuccess(payload);
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
        return apiClient(originalRequest);
    }
    catch (refreshError) {
        onRefreshFailure();
        throw refreshError;
    }
});
export const authApi = {
    login: async (payload) => {
        const response = await authClient.post('/auth/login', payload);
        return response.data;
    },
    refresh: async (refreshToken) => {
        const response = await authClient.post('/auth/refresh', { refreshToken });
        return response.data;
    },
    logout: async (refreshToken) => {
        await authClient.post('/auth/logout', { refreshToken });
    },
    me: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};
export function createCrudService(endpoint) {
    return {
        list: async (params = {}) => {
            const query = buildQueryString(params);
            const url = query ? `${endpoint}?${query}` : endpoint;
            const response = await apiClient.get(url);
            return normalizeListResponse(response.data);
        },
        get: async (id) => {
            const response = await apiClient.get(`${endpoint}/${id}`);
            return response.data;
        },
        create: async (payload) => {
            const response = await apiClient.post(endpoint, payload);
            return response.data;
        },
        update: async (id, payload) => {
            const response = await apiClient.put(`${endpoint}/${id}`, payload);
            return response.data;
        },
        remove: async (id) => {
            await apiClient.delete(`${endpoint}/${id}`);
        },
    };
}
export async function fetchArrayWithFallback(paths) {
    for (const path of paths) {
        try {
            const response = await apiClient.get(path);
            return normalizeArrayResponse(response.data);
        }
        catch (error) {
            if (error?.response?.status !== 404 || path === paths[paths.length - 1]) {
                throw error;
            }
        }
    }
    return [];
}
