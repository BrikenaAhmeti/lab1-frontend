import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { store } from '@/app/store';
import { clearSession, setSession } from '@/domain/auth/authSlice';
import { env } from '@/config/env';
import type { AuthTokensResponse } from '@/domain/auth/types';
import { toAuthSession } from '@/domain/auth/types';

type ApiKey = 'core' | 'deviceInfo';
const base: Record<ApiKey, string> = { core: env.API_CORE, deviceInfo: env.API_DEVICE_INFO };

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<AuthTokensResponse> | null = null;

const shouldSkipRefresh = (cfg: RetryableConfig) => {
  const url = cfg.url ?? '';
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh')
  );
};

const redirectToLogin = () => {
  if (typeof window === 'undefined') return;
  if (window.location.pathname === '/login') return;
  window.history.replaceState({}, '', '/login');
  window.dispatchEvent(new PopStateEvent('popstate'));
};

const getRefreshPromise = () => {
  if (refreshPromise) return refreshPromise;

  const refreshToken = store.getState().auth.tokens?.refreshToken;
  if (!refreshToken) {
    return Promise.reject(new Error('No refresh token'));
  }

  refreshPromise = axios
    .post<AuthTokensResponse>(`${base.core}/auth/refresh`, { refreshToken }, { timeout: 20000 })
    .then((r) => r.data)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

function build(key: ApiKey): AxiosInstance {
  const instance = axios.create({ baseURL: base[key], timeout: 20000 });

  instance.interceptors.request.use((cfg) => {
    const token = store.getState().auth.tokens?.accessToken;
    if (token) {
      cfg.headers = cfg.headers ?? {};
      cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
  });

  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const orig = error.config as RetryableConfig | undefined;
      const status = error.response?.status;

      if (!orig) return Promise.reject(error);

      if (status === 401 && !orig._retry && !shouldSkipRefresh(orig)) {
        orig._retry = true;

        try {
          const refreshed = await getRefreshPromise();
          store.dispatch(setSession(toAuthSession(refreshed)));
          orig.headers = orig.headers ?? {};
          orig.headers.Authorization = `Bearer ${refreshed.accessToken}`;
          return instance(orig);
        } catch (refreshError) {
          store.dispatch(clearSession());
          redirectToLogin();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

export const api = {
  core: build('core'),
  deviceInfo: build('deviceInfo')
};
