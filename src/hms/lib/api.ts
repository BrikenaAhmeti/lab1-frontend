import axios from 'axios';
import type { AuthPayload } from '../types';
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
let onRefreshSuccess: (payload: AuthPayload) => void = () => {};
let onRefreshFailure = () => {};
let refreshRequest: Promise<AuthPayload> | null = null;

export function configureApiClient(config: {
  getAccessToken: () => string;
  getRefreshToken: () => string;
  onRefreshSuccess: (payload: AuthPayload) => void;
  onRefreshFailure: () => void;
}) {
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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;
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
        .post<AuthPayload>('/auth/refresh', { refreshToken })
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
    } catch (refreshError) {
      onRefreshFailure();
      throw refreshError;
    }
  }
);

export const authApi = {
  login: async (payload: { identifier: string; password: string }) => {
    const response = await authClient.post<AuthPayload>('/auth/login', payload);
    return response.data;
  },
  refresh: async (refreshToken: string) => {
    const response = await authClient.post<AuthPayload>('/auth/refresh', { refreshToken });
    return response.data;
  },
  logout: async (refreshToken: string) => {
    await authClient.post('/auth/logout', { refreshToken });
  },
  me: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

export function createCrudService(endpoint: string) {
  return {
    list: async (params: Record<string, any> = {}) => {
      const query = buildQueryString(params);
      const url = query ? `${endpoint}?${query}` : endpoint;
      const response = await apiClient.get(url);
      return normalizeListResponse(response.data);
    },
    get: async (id: string) => {
      const response = await apiClient.get(`${endpoint}/${id}`);
      return response.data;
    },
    create: async (payload: any) => {
      const response = await apiClient.post(endpoint, payload);
      return response.data;
    },
    update: async (id: string, payload: any) => {
      const response = await apiClient.put(`${endpoint}/${id}`, payload);
      return response.data;
    },
    remove: async (id: string) => {
      await apiClient.delete(`${endpoint}/${id}`);
    },
  };
}

export async function fetchArrayWithFallback(paths: string[]) {
  for (const path of paths) {
    try {
      const response = await apiClient.get(path);
      return normalizeArrayResponse(response.data);
    } catch (error: any) {
      if (error?.response?.status !== 404 || path === paths[paths.length - 1]) {
        throw error;
      }
    }
  }

  return [];
}
