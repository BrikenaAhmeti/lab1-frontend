import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthSession, AuthUser, Tokens } from './types';
import { bootstrapAuth, fetchMe, login, logout, logoutAll, register } from './auth.thunks';

type AuthState = {
  user: AuthUser | null;
  tokens: Tokens | null;
  finishedGetStarted: boolean;
  loading: boolean;
  initialized: boolean;
  error: string | null;
};

const SESSION_STORAGE_KEY = 'auth.session';
const ROLE_STORAGE_KEY = 'role';

function clearStoredSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(ROLE_STORAGE_KEY);
}

function clearLegacySession() {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (raw) {
    clearStoredSession();
  }
}

function persistUserRole(session: AuthSession) {
  localStorage.setItem(ROLE_STORAGE_KEY, session.user.roles[0] ?? '');
}

clearLegacySession();

const initialState: AuthState = {
  user: null,
  tokens: null,
  finishedGetStarted: false,
  loading: false,
  initialized: false,
  error: null,
};

function applySession(state: AuthState, session: AuthSession) {
  state.user = session.user;
  state.tokens = session.tokens;
  persistUserRole(session);
}

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (s, a: PayloadAction<AuthSession>) => {
      applySession(s, a.payload);
      s.error = null;
      s.initialized = true;
    },
    clearSession: (s) => {
      s.user = null;
      s.tokens = null;
      s.finishedGetStarted = false;
      s.error = null;
      s.loading = false;
      s.initialized = true;
      clearStoredSession();
    },
    markFinishedGetStarted: (s) => {
      s.finishedGetStarted = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.loading = false;
        applySession(s, a.payload);
        s.initialized = true;
      })
      .addCase(login.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message ?? 'Unable to login';
      })

      .addCase(register.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(register.fulfilled, (s, a) => {
        s.loading = false;
        applySession(s, a.payload);
        s.initialized = true;
      })
      .addCase(register.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message ?? 'Unable to register';
      })

      .addCase(fetchMe.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchMe.fulfilled, (s, a) => {
        s.loading = false;
        s.error = null;
        s.user = a.payload;
        if (s.tokens) {
          persistUserRole({ user: a.payload, tokens: s.tokens });
        }
      })
      .addCase(fetchMe.rejected, (s, a) => {
        s.loading = false;
        s.error = a.error.message ?? 'Unable to load current user';
      })

      .addCase(bootstrapAuth.pending, (s) => {
        s.loading = true;
      })
      .addCase(bootstrapAuth.fulfilled, (s, a) => {
        s.loading = false;
        s.initialized = true;
        s.error = null;
        if (a.payload) applySession(s, a.payload);
      })
      .addCase(bootstrapAuth.rejected, (s, a) => {
        s.loading = false;
        s.initialized = true;
        s.user = null;
        s.tokens = null;
        s.finishedGetStarted = false;
        s.error = a.error.message ?? 'Session expired';
        clearStoredSession();
      })

      .addCase(logout.pending, (s) => {
        s.loading = true;
      })
      .addCase(logout.fulfilled, (s) => {
        s.loading = false;
        s.user = null;
        s.tokens = null;
        s.finishedGetStarted = false;
        s.error = null;
        s.initialized = true;
        clearStoredSession();
      })
      .addCase(logout.rejected, (s) => {
        s.loading = false;
        s.user = null;
        s.tokens = null;
        s.finishedGetStarted = false;
        s.initialized = true;
        clearStoredSession();
      })
      .addCase(logoutAll.pending, (s) => {
        s.loading = true;
      })
      .addCase(logoutAll.fulfilled, (s) => {
        s.loading = false;
        s.user = null;
        s.tokens = null;
        s.finishedGetStarted = false;
        s.error = null;
        s.initialized = true;
        clearStoredSession();
      })
      .addCase(logoutAll.rejected, (s) => {
        s.loading = false;
        s.user = null;
        s.tokens = null;
        s.finishedGetStarted = false;
        s.initialized = true;
        clearStoredSession();
      });
  },
});

export const { setSession, clearSession, markFinishedGetStarted } = slice.actions;
export default slice.reducer;
