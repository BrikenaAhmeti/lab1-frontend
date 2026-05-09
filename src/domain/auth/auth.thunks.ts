import { createAsyncThunk } from '@reduxjs/toolkit';
import { AuthApi } from './auth.api';
import type { AuthSession, LoginDTO, RegisterDTO } from './types';
import { toAuthSession } from './types';

async function createSession(payload: Awaited<ReturnType<typeof AuthApi.login>>) {
  const user = payload.user ?? (await AuthApi.me(payload.accessToken));
  return toAuthSession(payload, user);
}

export const login = createAsyncThunk<AuthSession, LoginDTO>(
  'auth/login',
  async (payload) => createSession(await AuthApi.login(payload))
);

export const register = createAsyncThunk<AuthSession, RegisterDTO>(
  'auth/register',
  async (payload) => createSession(await AuthApi.register(payload))
);

export const fetchMe = createAsyncThunk(
  'auth/me',
  async () => AuthApi.me()
);

export const bootstrapAuth = createAsyncThunk<AuthSession | null>(
  'auth/bootstrap',
  async () => {
    const payload = await AuthApi.refresh();
    return createSession(payload);
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await AuthApi.logout();
    } catch {
      return;
    }
  }
);

export const logoutAll = createAsyncThunk(
  'auth/logoutAll',
  async () => {
    try {
      await AuthApi.logoutAll();
    } catch {
      return;
    }
  }
);
