import { describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { api } from '@/libs/axios/client';
import { store } from '@/app/store';
import { setSession, clearSession } from '@/domain/auth/authSlice';
const mockUser = {
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
function makeResponse(cfg, status, data) {
    return {
        data,
        status,
        statusText: status === 200 ? 'OK' : status === 401 ? 'Unauthorized' : '',
        headers: {},
        config: cfg,
    };
}
// stable absolute url (handles baseURL + url)
function fullUrl(cfg) {
    const base = (cfg.baseURL ?? '').toString();
    const url = (cfg.url ?? '').toString();
    try {
        return new URL(url, base || 'http://local.test').toString();
    }
    catch {
        return `${base}${url}`;
    }
}
// create a minimal Axios-like error object that interceptors understand
function makeAxios401(cfg) {
    const res = makeResponse(cfg, 401, {});
    return {
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed with status code 401',
        config: cfg,
        response: res,
        toJSON() { return {}; }
    };
}
describe('axios refresh', () => {
    beforeEach(() => {
        window.history.replaceState({}, '', '/app');
        store.dispatch(clearSession());
    });
    it('retries original request after refresh', async () => {
        store.dispatch(setSession({ user: mockUser, tokens: { accessToken: 'old', refreshToken: 'ref' } }));
        let protectedCalls = 0;
        // INSTANCE adapter
        const originalCoreAdapter = api.core.defaults.adapter;
        api.core.defaults.adapter = async (cfg) => {
            const url = fullUrl(cfg);
            if (url.includes('/protected')) {
                protectedCalls += 1;
                if (protectedCalls === 1) {
                    // **reject** with an Axios-like 401 error to trigger the interceptor path
                    return Promise.reject(makeAxios401(cfg));
                }
                // After refresh, succeed
                return makeResponse(cfg, 200, { ok: true });
            }
            return makeResponse(cfg, 200, {});
        };
        // GLOBAL adapter (used by axios.post('<core>/auth/refresh'))
        const originalGlobalAdapter = axios.defaults.adapter;
        axios.defaults.adapter = async (cfg) => {
            const url = fullUrl(cfg);
            if (url.includes('/auth/refresh')) {
                return makeResponse(cfg, 200, {
                    user: mockUser,
                    accessToken: 'new',
                    refreshToken: 'ref-rotated',
                });
            }
            return makeResponse(cfg, 200, {});
        };
        const res = await api.core.get('/protected');
        // Assertions
        expect(protectedCalls).toBe(2); // first 401 + retried once after refresh
        expect(store.getState().auth.tokens?.accessToken).toBe('new');
        expect(store.getState().auth.tokens?.refreshToken).toBe('ref-rotated');
        expect(res?.data?.ok).toBe(true);
        // cleanup
        api.core.defaults.adapter = originalCoreAdapter;
        axios.defaults.adapter = originalGlobalAdapter;
    });
    it('handles concurrent 401 responses with a single refresh request', async () => {
        store.dispatch(setSession({ user: mockUser, tokens: { accessToken: 'expired', refreshToken: 'refresh-1' } }));
        let refreshCalls = 0;
        let protectedCalls = 0;
        const originalCoreAdapter = api.core.defaults.adapter;
        api.core.defaults.adapter = async (cfg) => {
            const url = fullUrl(cfg);
            if (url.includes('/protected')) {
                protectedCalls += 1;
                if (protectedCalls <= 2) {
                    return Promise.reject(makeAxios401(cfg));
                }
                return makeResponse(cfg, 200, { ok: true });
            }
            return makeResponse(cfg, 200, {});
        };
        const originalGlobalAdapter = axios.defaults.adapter;
        axios.defaults.adapter = async (cfg) => {
            const url = fullUrl(cfg);
            if (url.includes('/auth/refresh')) {
                refreshCalls += 1;
                return makeResponse(cfg, 200, {
                    user: mockUser,
                    accessToken: 'fresh-token',
                    refreshToken: 'refresh-2',
                });
            }
            return makeResponse(cfg, 200, {});
        };
        const [first, second] = await Promise.all([
            api.core.get('/protected'),
            api.core.get('/protected'),
        ]);
        expect(first.data.ok).toBe(true);
        expect(second.data.ok).toBe(true);
        expect(refreshCalls).toBe(1);
        expect(store.getState().auth.tokens?.accessToken).toBe('fresh-token');
        expect(store.getState().auth.tokens?.refreshToken).toBe('refresh-2');
        api.core.defaults.adapter = originalCoreAdapter;
        axios.defaults.adapter = originalGlobalAdapter;
    });
    it('clears session and redirects to login when refresh fails', async () => {
        store.dispatch(setSession({ user: mockUser, tokens: { accessToken: 'expired', refreshToken: 'refresh-1' } }));
        const originalCoreAdapter = api.core.defaults.adapter;
        api.core.defaults.adapter = async (cfg) => {
            if (fullUrl(cfg).includes('/protected')) {
                return Promise.reject(makeAxios401(cfg));
            }
            return makeResponse(cfg, 200, {});
        };
        const originalGlobalAdapter = axios.defaults.adapter;
        axios.defaults.adapter = async (cfg) => {
            if (fullUrl(cfg).includes('/auth/refresh')) {
                return Promise.reject(makeAxios401(cfg));
            }
            return makeResponse(cfg, 200, {});
        };
        await expect(api.core.get('/protected')).rejects.toBeTruthy();
        expect(store.getState().auth.user).toBe(null);
        expect(store.getState().auth.tokens).toBe(null);
        expect(window.location.pathname).toBe('/login');
        api.core.defaults.adapter = originalCoreAdapter;
        axios.defaults.adapter = originalGlobalAdapter;
    });
});
