import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, configureApiClient } from '../lib/api';
import { getErrorMessage, normalizeRoles, normalizeUser } from '../lib/utils';
import type { AuthPayload, LocalizedText, User } from '../types';

export const REFRESH_TOKEN_KEY = 'refreshToken';

type AuthContextValue = {
  user: User | null;
  accessToken: string;
  ready: boolean;
  isAuthenticated: boolean;
  login: (values: { identifier: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  can: (roles?: string[]) => boolean;
  errorMessage: (error: any, translate?: (value: LocalizedText) => string) => string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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

function persistRefreshToken(refreshToken?: string) {
  if (typeof window === 'undefined') {
    return;
  }

  if (refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    return;
  }

  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [ready, setReady] = useState(false);

  const clearSession = () => {
    setUser(null);
    setAccessToken('');
    clearLegacyRefreshToken();
  };

  const applySession = (payload: AuthPayload) => {
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
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
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

  const login = async (values: { identifier: string; password: string }) => {
    const payload = await authApi.login(values);
    const sessionUser = payload.user ?? (await authApi.me(payload.accessToken));
    applySession({ ...payload, user: sessionUser });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  };

  const logoutAll = async () => {
    try {
      await authApi.logoutAll();
    } finally {
      clearSession();
    }
  };

  const can = (roles?: string[]) => {
    if (!roles?.length) {
      return true;
    }

    const currentRoles = normalizeRoles(user?.roles ?? []);

    if (currentRoles.includes('ADMIN')) {
      return true;
    }

    return roles.some((role) => currentRoles.includes(role.toUpperCase()));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        ready,
        isAuthenticated: Boolean(user && accessToken),
        login,
        logout,
        logoutAll,
        can,
        errorMessage: getErrorMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
