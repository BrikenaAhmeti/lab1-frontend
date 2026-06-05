import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { store } from '@/app/store';
import { authApi, configureApiClient } from '@/libs/app/api';
import { getErrorMessage, normalizeRoles, normalizeUser } from '@/libs/app/utils';
import { clearSession as clearReduxSession, setSession as setReduxSession } from '@/domain/auth/authSlice';
import type { AuthPayload, LocalizedText, User } from '@/types/app';

export const REFRESH_TOKEN_KEY = 'refreshToken';

type AuthContextValue = {
  user: User | null;
  accessToken: string;
  ready: boolean;
  isAuthenticated: boolean;
  login: (values: { identifier: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  syncUser: (user: any) => void;
  can: (roles?: string[]) => boolean;
  errorMessage: (error: any, translate?: (value: LocalizedText) => string) => string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function clearLegacyRefreshStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('auth.session');
  localStorage.removeItem('role');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [ready, setReady] = useState(false);
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const clearSession = useCallback(() => {
    userRef.current = null;
    setUser(null);
    setAccessToken('');
    clearLegacyRefreshStorage();
    store.dispatch(clearReduxSession());
  }, []);

  const applySession = useCallback((payload: AuthPayload) => {
    const nextUser = payload.user ? normalizeUser(payload.user) : userRef.current;

    userRef.current = nextUser;
    setUser(nextUser);
    setAccessToken(payload.accessToken);
    clearLegacyRefreshStorage();

    if (nextUser) {
      store.dispatch(
        setReduxSession({
          user: nextUser as any,
          tokens: { accessToken: payload.accessToken },
        })
      );
    }
  }, []);

  const handleRefreshFailure = useCallback(() => {
    clearSession();

    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
  }, [clearSession]);

  useEffect(() => {
    configureApiClient({
      getAccessToken: () => accessToken,
      onRefreshSuccess: applySession,
      onRefreshFailure: handleRefreshFailure,
    });
  }, [accessToken, applySession, handleRefreshFailure]);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        clearLegacyRefreshStorage();
        const payload = await authApi.refresh();
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
  }, [applySession, clearSession]);

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

  const syncUser = useCallback(
    (nextUserPayload: any) => {
      const nextUser = normalizeUser(nextUserPayload);

      userRef.current = nextUser;
      setUser(nextUser);

      if (accessToken) {
        store.dispatch(
          setReduxSession({
            user: nextUser as any,
            tokens: { accessToken },
          })
        );
      }
    },
    [accessToken]
  );

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
        syncUser,
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
