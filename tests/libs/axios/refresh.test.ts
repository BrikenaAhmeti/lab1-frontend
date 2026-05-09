import { beforeEach, describe, expect, it } from 'vitest';
import axios from 'axios';
import type { AxiosAdapter, AxiosResponse } from 'axios';
import { api } from '@/libs/axios/client';
import { store } from '@/app/store';
import { clearSession, setSession } from '@/domain/auth/authSlice';
import type { AuthUser } from '@/domain/auth/types';

const mockUser: AuthUser = {
  id: '1',
  firstName: 'Ana',
  lastName: 'Admin',
  email: 'ana@example.com',
  phoneNumber: null,
  emailConfirmed: true,
  isActive: true,
  lockoutEnabled: false,
  accessFailedCount: 0,
  roles: ['ADMIN'],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function makeResponse<T>(cfg: any, status: number, data: T): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : status === 401 ? 'Unauthorized' : '',
    headers: {},
    config: cfg,
  };
}

function fullUrl(cfg: any) {
  const base = (cfg.baseURL ?? '').toString();
  const url = (cfg.url ?? '').toString();
  try {
    return new URL(url, base || 'http://local.test').toString();
  } catch {
    return `${base}${url}`;
  }
}

function makeAxios401(cfg: any) {
  const res = makeResponse(cfg, 401, {} as any);
  return {
    isAxiosError: true,
    name: 'AxiosError',
    message: 'Request failed with status code 401',
    config: cfg,
    response: res,
    toJSON() {
      return {};
    },
  } as any;
}

describe('axios refresh', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/app');
    store.dispatch(clearSession());
  });

  it('retries the original request with cookie-based refresh', async () => {
    store.dispatch(setSession({ user: mockUser, tokens: { accessToken: 'old' } }));

    let protectedCalls = 0;
    const refreshConfigs: any[] = [];

    const originalCoreAdapter = api.core.defaults.adapter as AxiosAdapter | undefined;
    api.core.defaults.adapter = async (cfg) => {
      const url = fullUrl(cfg);
      if (url.includes('/protected')) {
        protectedCalls += 1;
        if (protectedCalls === 1) {
          return Promise.reject(makeAxios401(cfg));
        }
        return makeResponse(cfg, 200, { ok: true } as any);
      }

      return makeResponse(cfg, 200, {} as any);
    };

    const originalGlobalAdapter = axios.defaults.adapter as AxiosAdapter | undefined;
    axios.defaults.adapter = async (cfg) => {
      const url = fullUrl(cfg);
      if (url.includes('/auth/refresh')) {
        refreshConfigs.push(cfg);
        return makeResponse(cfg, 200, {
          accessToken: 'new',
        } as any);
      }
      return makeResponse(cfg, 200, {} as any);
    };

    const res = await api.core.get('/protected');

    expect(protectedCalls).toBe(2);
    expect(refreshConfigs).toHaveLength(1);
    expect(refreshConfigs[0].withCredentials).toBe(true);
    expect(String(refreshConfigs[0].data ?? '')).not.toContain('refreshToken');
    expect(store.getState().auth.user).toEqual(mockUser);
    expect(store.getState().auth.tokens).toEqual({ accessToken: 'new' });
    expect(res.data.ok).toBe(true);

    api.core.defaults.adapter = originalCoreAdapter;
    axios.defaults.adapter = originalGlobalAdapter;
  });

  it('handles concurrent 401 responses with a single refresh request', async () => {
    store.dispatch(setSession({ user: mockUser, tokens: { accessToken: 'expired' } }));

    let refreshCalls = 0;
    let protectedCalls = 0;

    const originalCoreAdapter = api.core.defaults.adapter as AxiosAdapter | undefined;
    api.core.defaults.adapter = async (cfg) => {
      const url = fullUrl(cfg);
      if (url.includes('/protected')) {
        protectedCalls += 1;
        if (protectedCalls <= 2) {
          return Promise.reject(makeAxios401(cfg));
        }
        return makeResponse(cfg, 200, { ok: true } as any);
      }

      return makeResponse(cfg, 200, {} as any);
    };

    const originalGlobalAdapter = axios.defaults.adapter as AxiosAdapter | undefined;
    axios.defaults.adapter = async (cfg) => {
      const url = fullUrl(cfg);
      if (url.includes('/auth/refresh')) {
        refreshCalls += 1;
        return makeResponse(cfg, 200, {
          accessToken: 'fresh-token',
        } as any);
      }
      return makeResponse(cfg, 200, {} as any);
    };

    const [first, second] = await Promise.all([api.core.get('/protected'), api.core.get('/protected')]);

    expect(first.data.ok).toBe(true);
    expect(second.data.ok).toBe(true);
    expect(refreshCalls).toBe(1);
    expect(store.getState().auth.tokens).toEqual({ accessToken: 'fresh-token' });

    api.core.defaults.adapter = originalCoreAdapter;
    axios.defaults.adapter = originalGlobalAdapter;
  });

  it('clears session and redirects to login when refresh fails', async () => {
    store.dispatch(setSession({ user: mockUser, tokens: { accessToken: 'expired' } }));

    const originalCoreAdapter = api.core.defaults.adapter as AxiosAdapter | undefined;
    api.core.defaults.adapter = async (cfg) => {
      if (fullUrl(cfg).includes('/protected')) {
        return Promise.reject(makeAxios401(cfg));
      }
      return makeResponse(cfg, 200, {} as any);
    };

    const originalGlobalAdapter = axios.defaults.adapter as AxiosAdapter | undefined;
    axios.defaults.adapter = async (cfg) => {
      if (fullUrl(cfg).includes('/auth/refresh')) {
        return Promise.reject(makeAxios401(cfg));
      }
      return makeResponse(cfg, 200, {} as any);
    };

    await expect(api.core.get('/protected')).rejects.toBeTruthy();

    expect(store.getState().auth.user).toBe(null);
    expect(store.getState().auth.tokens).toBe(null);
    expect(window.location.pathname).toBe('/login');

    api.core.defaults.adapter = originalCoreAdapter;
    axios.defaults.adapter = originalGlobalAdapter;
  });
});
