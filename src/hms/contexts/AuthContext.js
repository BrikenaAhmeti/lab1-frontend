import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi, configureApiClient } from '../lib/api';
import { getErrorMessage, normalizeRoles, normalizeUser } from '../lib/utils';
export const REFRESH_TOKEN_KEY = 'refreshToken';
const AuthContext = createContext(null);
function clearLegacyRefreshToken() {
    if (typeof window === 'undefined') {
        return;
    }
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}
function readRefreshToken() {
    if (typeof window === 'undefined') {
        return '';
    }
    return sessionStorage.getItem(REFRESH_TOKEN_KEY) || '';
}
function persistRefreshToken(refreshToken) {
    if (typeof window === 'undefined') {
        return;
    }
    if (refreshToken) {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        return;
    }
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState('');
    const [ready, setReady] = useState(false);
    const clearSession = () => {
        setUser(null);
        setAccessToken('');
        clearLegacyRefreshToken();
    };
    const applySession = (payload) => {
        setUser((currentUser) => (payload.user ? normalizeUser(payload.user) : currentUser));
        setAccessToken(payload.accessToken);
        persistRefreshToken(payload.refreshToken);
    };
    const handleRefreshFailure = useCallback(() => {
        clearSession();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.assign('/login');
        }
    }, []);
    useEffect(() => {
        configureApiClient({
            getAccessToken: () => accessToken,
            getRefreshToken: readRefreshToken,
            onRefreshSuccess: applySession,
            onRefreshFailure: handleRefreshFailure,
        });
    }, [accessToken, handleRefreshFailure]);
    useEffect(() => {
        let cancelled = false;
        const restoreSession = async () => {
            try {
                const refreshToken = readRefreshToken() || undefined;
                const payload = await authApi.refresh(refreshToken);
                const sessionUser = payload.user ?? (await authApi.me(payload.accessToken));
                if (!cancelled) {
                    applySession({ ...payload, user: sessionUser });
                }
            }
            catch {
                if (!cancelled) {
                    clearSession();
                }
            }
            finally {
                if (!cancelled) {
                    setReady(true);
                }
            }
        };
        restoreSession();
        return () => {
            cancelled = true;
        };
    }, []);
    const login = async (values) => {
        const payload = await authApi.login(values);
        const sessionUser = payload.user ?? (await authApi.me(payload.accessToken));
        applySession({ ...payload, user: sessionUser });
    };
    const logout = async () => {
        try {
            await authApi.logout();
        }
        finally {
            clearSession();
        }
    };
    const logoutAll = async () => {
        try {
            await authApi.logoutAll();
        }
        finally {
            clearSession();
        }
    };
    const can = (roles) => {
        if (!roles?.length) {
            return true;
        }
        const currentRoles = normalizeRoles(user?.roles ?? []);
        if (currentRoles.includes('ADMIN')) {
            return true;
        }
        return roles.some((role) => currentRoles.includes(role.toUpperCase()));
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            accessToken,
            ready,
            isAuthenticated: Boolean(user && accessToken),
            login,
            logout,
            logoutAll,
            can,
            errorMessage: getErrorMessage,
        }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider');
    }
    return context;
}
