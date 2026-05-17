import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { REFRESH_TOKEN_KEY, AuthProvider, useAuth } from './AuthContext';
import { authApi } from '@/libs/app/api';

function AuthState() {
  const { ready, isAuthenticated, user, accessToken, login, logout } = useAuth();

  if (!ready) {
    return <span>loading</span>;
  }

  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? user?.roles.join(',') : 'guest'}</span>
      <span data-testid="access-token">{accessToken || 'none'}</span>
      <button onClick={() => void login({ identifier: 'ana@example.com', password: 'secret' })}>
        login
      </button>
      <button onClick={() => void logout()}>logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('restores the session with cookie-based refresh', async () => {
    const refreshSpy = vi.spyOn(authApi, 'refresh').mockResolvedValue({
      user: { id: '1', roles: ['ADMIN'] },
      accessToken: 'access-token',
    });

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('ADMIN');
    });

    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe(null);
    expect(localStorage.getItem('auth.session')).toBe(null);
  });

  it('stores only the access token in memory on login', async () => {
    vi.spyOn(authApi, 'refresh').mockRejectedValue(new Error('No session'));
    const loginSpy = vi.spyOn(authApi, 'login').mockResolvedValue({
      user: { id: '1', roles: ['ADMIN'] },
      accessToken: 'access-token',
    });

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('guest');
    });

    fireEvent.click(screen.getByRole('button', { name: 'login' }));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('ADMIN');
    });

    expect(loginSpy).toHaveBeenCalledWith({
      identifier: 'ana@example.com',
      password: 'secret',
    });
    expect(screen.getByTestId('access-token')).toHaveTextContent('access-token');
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe(null);
    expect(localStorage.getItem('auth.session')).toBe(null);
  });

  it('clears auth state on logout', async () => {
    vi.spyOn(authApi, 'refresh').mockRejectedValue(new Error('No session'));
    vi.spyOn(authApi, 'login').mockResolvedValue({
      user: { id: '1', roles: ['ADMIN'] },
      accessToken: 'access-token',
    });
    const logoutSpy = vi.spyOn(authApi, 'logout').mockResolvedValue(undefined);

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('guest');
    });

    fireEvent.click(screen.getByRole('button', { name: 'login' }));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('ADMIN');
    });

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('guest');
    });

    expect(logoutSpy).toHaveBeenCalledWith();
    expect(screen.getByTestId('access-token')).toHaveTextContent('none');
  });
});
