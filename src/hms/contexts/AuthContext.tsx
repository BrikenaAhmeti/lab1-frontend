import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, configureApiClient } from '../lib/api';
import { getErrorMessage, normalizeRoles, normalizeUser } from '../lib/utils';
import type { AuthPayload, User } from '../types';

export const REFRESH_TOKEN_KEY = 'refreshToken';

type AuthContextValue = {
  user: User | null;
  accessToken: string;
  ready: boolean;
  isAuthenticated: boolean;
  login: (values: { identifier: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  can: (roles?: string[]) => boolean;
  errorMessage: (error: any) => string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredRefreshToken() {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY) || '';
}

function storeRefreshToken(refreshToken: string) {
  if (refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

function clearStoredRefreshToken() {
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [ready, setReady] = useState(false);

  const clearSession = () => {
    setUser(null);
    setAccessToken('');
    clearStoredRefreshToken();
  };

  const applySession = (payload: AuthPayload) => {
    setUser(normalizeUser(payload.user));
    setAccessToken(payload.accessToken);
    storeRefreshToken(payload.refreshToken);
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
      getRefreshToken: getStoredRefreshToken,
      onRefreshSuccess: applySession,
      onRefreshFailure: handleRefreshFailure,
    });
  }, [accessToken, handleRefreshFailure]);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const refreshToken = getStoredRefreshToken();

      if (!refreshToken) {
        if (!cancelled) {
          setReady(true);
        }
        return;
      }

      try {
        const payload = await authApi.refresh(refreshToken);

        if (!cancelled) {
          applySession(payload);
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
    applySession(payload);
  };

  const logout = async () => {
    const refreshToken = getStoredRefreshToken();

    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
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
