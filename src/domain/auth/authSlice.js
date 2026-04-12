import { createSlice } from '@reduxjs/toolkit';
import { bootstrapAuth, fetchMe, login, logout, register } from './auth.thunks';
const SESSION_STORAGE_KEY = 'auth.session';
const ROLE_STORAGE_KEY = 'role';
function readStoredSession() {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw)
        return null;
    try {
        const parsed = JSON.parse(raw);
        const hasAccessToken = !!parsed?.tokens?.accessToken;
        const hasRefreshToken = !!parsed?.tokens?.refreshToken;
        const hasUser = !!parsed?.user?.id;
        if (!hasAccessToken || !hasRefreshToken || !hasUser)
            return null;
        return parsed;
    }
    catch {
        return null;
    }
}
function persistSession(session) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(ROLE_STORAGE_KEY, session.user.roles[0] ?? '');
}
function clearStoredSession() {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
}
const restoredSession = readStoredSession();
const initialState = {
    user: restoredSession?.user ?? null,
    tokens: restoredSession?.tokens ?? null,
    finishedGetStarted: false,
    loading: false,
    initialized: false,
    error: null,
};
function applySession(state, session) {
    state.user = session.user;
    state.tokens = session.tokens;
    persistSession(session);
}
const slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setSession: (s, a) => {
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
            if (s.tokens)
                persistSession({ user: a.payload, tokens: s.tokens });
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
            if (a.payload)
                applySession(s, a.payload);
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
        });
    },
});
export const { setSession, clearSession, markFinishedGetStarted } = slice.actions;
export default slice.reducer;
