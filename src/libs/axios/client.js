import axios from 'axios';
import { store } from '@/app/store';
import { clearSession, setSession } from '@/domain/auth/authSlice';
import { env } from '@/config/env';
import { toAuthSession } from '@/domain/auth/types';
const base = { core: env.API_CORE, deviceInfo: env.API_DEVICE_INFO };
let refreshPromise = null;
const shouldSkipRefresh = (cfg) => {
    const url = cfg.url ?? '';
    return (url.includes('/auth/login') ||
        url.includes('/auth/register') ||
        url.includes('/auth/refresh'));
};
const redirectToLogin = () => {
    if (typeof window === 'undefined')
        return;
    if (window.location.pathname === '/login')
        return;
    window.history.replaceState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
};
const getRefreshPromise = () => {
    if (refreshPromise)
        return refreshPromise;
    const refreshToken = store.getState().auth.tokens?.refreshToken;
    if (!refreshToken) {
        return Promise.reject(new Error('No refresh token'));
    }
    refreshPromise = axios
        .post(`${base.core}/auth/refresh`, { refreshToken }, { timeout: 20000 })
        .then((r) => r.data)
        .finally(() => {
        refreshPromise = null;
    });
    return refreshPromise;
};
function build(key) {
    const instance = axios.create({ baseURL: base[key], timeout: 20000 });
    instance.interceptors.request.use((cfg) => {
        const token = store.getState().auth.tokens?.accessToken;
        if (token) {
            cfg.headers = cfg.headers ?? {};
            cfg.headers.Authorization = `Bearer ${token}`;
        }
        return cfg;
    });
    instance.interceptors.response.use((res) => res, async (error) => {
        const orig = error.config;
        const status = error.response?.status;
        if (!orig)
            return Promise.reject(error);
        if (status === 401 && !orig._retry && !shouldSkipRefresh(orig)) {
            orig._retry = true;
            try {
                const refreshed = await getRefreshPromise();
                store.dispatch(setSession(toAuthSession(refreshed)));
                orig.headers = orig.headers ?? {};
                orig.headers.Authorization = `Bearer ${refreshed.accessToken}`;
                return instance(orig);
            }
            catch (refreshError) {
                store.dispatch(clearSession());
                redirectToLogin();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    });
    return instance;
}
export const api = {
    core: build('core'),
    deviceInfo: build('deviceInfo')
};
