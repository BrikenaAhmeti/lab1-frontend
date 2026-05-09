import { jsx as _jsx } from "react/jsx-runtime";
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ToastProvider } from '../contexts/ToastContext';
import { authApi } from '../lib/api';
import LoginPage from './LoginPage';
function renderPage() {
    render(_jsx(MemoryRouter, { initialEntries: ['/login'], children: _jsx(LanguageProvider, { children: _jsx(ToastProvider, { children: _jsx(AuthProvider, { children: _jsx(LoginPage, {}) }) }) }) }));
}
describe('LoginPage', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
        sessionStorage.clear();
    });
    it('shows the rate-limit message for login 429 responses', async () => {
        vi.spyOn(authApi, 'refresh').mockRejectedValue(new Error('No session'));
        vi.spyOn(authApi, 'login').mockRejectedValue({
            response: {
                status: 429,
                data: {
                    message: 'Too many login attempts, please try again in 15 minutes',
                },
            },
        });
        renderPage();
        fireEvent.change(screen.getByLabelText('Email or username'), {
            target: { value: 'ana@example.com' },
        });
        fireEvent.change(screen.getByLabelText('Password'), {
            target: { value: 'secret' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
        expect(await screen.findByRole('status')).toHaveTextContent('Too many login attempts, please try again in 15 minutes');
    });
});
