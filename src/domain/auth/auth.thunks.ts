import { createAsyncThunk } from '@reduxjs/toolkit';
import { AuthApi } from './auth.api';
import type { AuthSession, LoginDTO, RegisterDTO, Tokens } from './types';
import { toAuthSession } from './types';

type AuthStateShape = {
  auth: {
    tokens: Tokens | null;
  };
};

export const login = createAsyncThunk<AuthSession, LoginDTO>(
  'auth/login',
  async (payload) => toAuthSession(await AuthApi.login(payload))
);

export const register = createAsyncThunk<AuthSession, RegisterDTO>(
  'auth/register',
  async (payload) => toAuthSession(await AuthApi.register(payload))
);

export const fetchMe = createAsyncThunk(
  'auth/me',
  async () => AuthApi.me()
);

export const bootstrapAuth = createAsyncThunk<AuthSession | null>(
  'auth/bootstrap',
  async (_, { getState }) => {
    const state = getState() as AuthStateShape;
    const currentTokens = state.auth.tokens;

    if (!currentTokens?.accessToken || !currentTokens.refreshToken) return null;

    const user = await AuthApi.me();
    const latestTokens = ((getState() as AuthStateShape).auth.tokens ?? currentTokens);
    return { user, tokens: latestTokens };
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    const state = getState() as AuthStateShape;
    const refreshToken = state.auth.tokens?.refreshToken;
    if (!refreshToken) return;

    try {
      await AuthApi.logout({ refreshToken });
    } catch {
      return;
    }
  }
);
