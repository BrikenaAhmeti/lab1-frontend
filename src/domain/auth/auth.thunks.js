import { createAsyncThunk } from '@reduxjs/toolkit';
import { AuthApi } from './auth.api';
import { toAuthSession } from './types';
export const login = createAsyncThunk('auth/login', async (payload) => toAuthSession(await AuthApi.login(payload)));
export const register = createAsyncThunk('auth/register', async (payload) => toAuthSession(await AuthApi.register(payload)));
export const fetchMe = createAsyncThunk('auth/me', async () => AuthApi.me());
export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { getState }) => {
    const state = getState();
    const currentTokens = state.auth.tokens;
    if (!currentTokens?.accessToken || !currentTokens.refreshToken)
        return null;
    const user = await AuthApi.me();
    const latestTokens = (getState().auth.tokens ?? currentTokens);
    return { user, tokens: latestTokens };
});
export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
    const state = getState();
    const refreshToken = state.auth.tokens?.refreshToken;
    if (!refreshToken)
        return;
    try {
        await AuthApi.logout({ refreshToken });
    }
    catch {
        return;
    }
});
