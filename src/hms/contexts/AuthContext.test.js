import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, waitFor } from '@testing-library/react';
import { REFRESH_TOKEN_KEY, AuthProvider, useAuth } from './AuthContext';
import { authApi } from '../lib/api';
function AuthState() {
    const { ready, isAuthenticated, user } = useAuth();
    if (!ready) {
        return _jsx("span", { children: "loading" });
    }
    return _jsx("span", { children: isAuthenticated ? user?.roles.join(',') : 'guest' });
}
describe('AuthProvider', () => {
    it('restores the session from the refresh token', async () => {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, 'old-refresh-token');
        vi.spyOn(authApi, 'refresh').mockResolvedValue({
            user: { id: '1', roles: ['ADMIN'] },
            accessToken: 'access-token',
            refreshToken: 'new-refresh-token',
        });
        render(_jsx(AuthProvider, { children: _jsx(AuthState, {}) }));
        await waitFor(() => {
            expect(screen.getByText('ADMIN')).toBeInTheDocument();
        });
        expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('new-refresh-token');
    });
});
