import axios from 'axios';
import type { AuthPayload } from '../types';
import {
  buildQueryString,
  deepCamelCaseKeys,
  normalizeArrayResponse,
  normalizeListResponse,
} from './utils';
import { env } from '@/config/env';

const baseURL = env.API_HMS;
const AUTH_BASE = '/api/auth';

export const apiClient = axios.create({
  baseURL,
});

const authClient = axios.create({
  baseURL,
  withCredentials: true,
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

    originalRequest._retry = true;

    if (!refreshRequest) {
      const refreshToken = getRefreshToken();
      refreshRequest = authClient
        .post<AuthPayload>(`${AUTH_BASE}/refresh`, refreshToken ? { refreshToken } : {})
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
    const response = await authClient.post<AuthPayload>(`${AUTH_BASE}/login`, payload);
    return response.data;
  },
  refresh: async (refreshToken?: string) => {
    const response = await authClient.post<AuthPayload>(
      `${AUTH_BASE}/refresh`,
      refreshToken ? { refreshToken } : {}
    );
    return response.data;
  },
  logout: async () => {
    await authClient.post(`${AUTH_BASE}/logout`);
  },
  logoutAll: async () => {
    await authClient.post(`${AUTH_BASE}/logout-all`);
  },
  me: async (accessToken?: string) => {
    const response = await apiClient.get(`${AUTH_BASE}/me`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    return response.data;
  },
  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const response = await apiClient.post(`${AUTH_BASE}/change-password`, payload);
    return response.data;
  },
  resetUserPassword: async (userId: string, payload: { password: string }) => {
    const response = await apiClient.patch(`${AUTH_BASE}/users/${userId}/password`, payload);
    return response.data;
  },
};

function normalizeEndpointParams(params: Record<string, any>) {
  const nextParams = { ...params };

  if (typeof nextParams.sortBy === 'string' && nextParams.sortBy.trim()) {
    nextParams.sortBy = nextParams.sortBy
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .toLowerCase();
  }

  return nextParams;
}

function pickParams(params: Record<string, any>, allowedParams?: string[]) {
  if (!allowedParams?.length) {
    return params;
  }

  return Object.fromEntries(
    Object.entries(params).filter(([key]) => allowedParams.includes(key))
  );
}

export function createCrudService(
  endpoint: string,
  options?: {
    allowedListParams?: string[];
  }
) {
  return {
    list: async (params: Record<string, any> = {}) => {
      const query = buildQueryString(
        normalizeEndpointParams(pickParams(params, options?.allowedListParams))
      );
      const url = query ? `${endpoint}?${query}` : endpoint;
      const response = await apiClient.get(url);
      return normalizeListResponse(response.data);
    },
    get: async (id: string) => {
      const response = await apiClient.get(`${endpoint}/${id}`);
      return deepCamelCaseKeys(response.data);
    },
    create: async (payload: any) => {
      const response = await apiClient.post(endpoint, payload);
      return deepCamelCaseKeys(response.data);
    },
    update: async (id: string, payload: any) => {
      const response = await apiClient.put(`${endpoint}/${id}`, payload);
      return deepCamelCaseKeys(response.data);
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
