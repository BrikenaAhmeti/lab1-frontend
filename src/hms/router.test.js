import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AppRouter from './router';
vi.mock('./contexts/AuthContext', () => ({
    useAuth: () => ({
        ready: true,
        isAuthenticated: false,
        can: () => true,
    }),
}));
vi.mock('./contexts/LanguageContext', () => ({
    useLanguage: () => ({
        language: 'en',
        t: (value) => value.en,
    }),
}));
vi.mock('./pages/routes/LoginRoutePage', async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    return {
        default: function MockLoginRoutePage() {
            return _jsx("div", { children: "Lazy login page" });
        },
    };
});
describe('AppRouter', () => {
    it('shows a suspense skeleton before a lazy route resolves', async () => {
        render(_jsx(MemoryRouter, { initialEntries: ['/login'], children: _jsx(AppRouter, {}) }));
        expect(screen.getByTestId('route-skeleton')).toBeInTheDocument();
        expect(await screen.findByText('Lazy login page')).toBeInTheDocument();
    });
});
