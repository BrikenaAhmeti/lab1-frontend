import { createAsyncThunk } from '@reduxjs/toolkit';
import { AuthApi } from './auth.api';
import { toAuthSession } from './types';
async function createSession(payload) {
    const user = payload.user ?? (await AuthApi.me(payload.accessToken));
    return toAuthSession(payload, user);
}
export const login = createAsyncThunk('auth/login', async (payload) => createSession(await AuthApi.login(payload)));
export const register = createAsyncThunk('auth/register', async (payload) => createSession(await AuthApi.register(payload)));
export const fetchMe = createAsyncThunk('auth/me', async () => AuthApi.me());
export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
    const payload = await AuthApi.refresh();
    return createSession(payload);
});
export const logout = createAsyncThunk('auth/logout', async () => {
    try {
        await AuthApi.logout();
    }
    catch {
        return;
    }
});
export const logoutAll = createAsyncThunk('auth/logoutAll', async () => {
    try {
        await AuthApi.logoutAll();
    }
    catch {
        return;
    }
});
