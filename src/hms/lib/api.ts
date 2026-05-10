import axios from 'axios';
import type { AuthPayload } from '../types';
import { buildQueryString, normalizeArrayResponse, normalizeListResponse } from './utils';
import { env } from '@/config/env';

const baseURL = env.API_HMS;

export const apiClient = axios.create({
  baseURL,
});

const authClient = axios.create({
  baseURL,
  withCredentials: true,
});

let getAccessToken = () => '';
let onRefreshSuccess: (payload: AuthPayload) => void = () => {};
let onRefreshFailure = () => {};
let refreshRequest: Promise<AuthPayload> | null = null;

export function configureApiClient(config: {
  getAccessToken: () => string;
  onRefreshSuccess: (payload: AuthPayload) => void;
  onRefreshFailure: () => void;
}) {
  getAccessToken = config.getAccessToken;
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

    originalRequest._retry = true;

    if (!refreshRequest) {
      refreshRequest = authClient
        .post<AuthPayload>('/auth/refresh')
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
  refresh: async () => {
    const response = await authClient.post<AuthPayload>('/auth/refresh');
    return response.data;
  },
  logout: async () => {
    await authClient.post('/auth/logout');
  },
  logoutAll: async () => {
    await authClient.post('/auth/logout-all');
  },
  me: async (accessToken?: string) => {
    const response = await apiClient.get('/auth/me', {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
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
