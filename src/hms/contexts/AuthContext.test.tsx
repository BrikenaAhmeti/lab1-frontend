import { render, screen, waitFor } from '@testing-library/react';
import { REFRESH_TOKEN_KEY, AuthProvider, useAuth } from './AuthContext';
import { authApi } from '../lib/api';

function AuthState() {
  const { ready, isAuthenticated, user } = useAuth();

  if (!ready) {
    return <span>loading</span>;
  }

  return <span>{isAuthenticated ? user?.roles.join(',') : 'guest'}</span>;
}

describe('AuthProvider', () => {
  it('restores the session from the refresh token', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'old-refresh-token');

    vi.spyOn(authApi, 'refresh').mockResolvedValue({
      user: { id: '1', roles: ['ADMIN'] },
      accessToken: 'access-token',
      refreshToken: 'new-refresh-token',
    });

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });

    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('new-refresh-token');
  });
});
