import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import authReducer from '@/domain/auth/authSlice';
import transactionsReducer from '@/domain/transactions/transactions.slice';
import authChatReducer from '@/domain/auth/authChat.slice';
import AppLayout from '@/ui/layouts/AppLayout';
const createUser = (roles) => ({
    id: 'u-1',
    firstName: 'Ava',
    lastName: 'Taylor',
    email: 'ava@example.com',
    phoneNumber: null,
    emailConfirmed: true,
    isActive: true,
    lockoutEnabled: false,
    accessFailedCount: 0,
    roles,
    createdAt: '2026-04-16T00:00:00.000Z',
    updatedAt: '2026-04-16T00:00:00.000Z',
});
function renderLayout({ roles = ['STAFF'], route = '/app' } = {}) {
    const store = configureStore({
        reducer: {
            auth: authReducer,
            transactions: transactionsReducer,
            authChat: authChatReducer,
        },
        preloadedState: {
            auth: {
                user: createUser(roles),
                tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
                finishedGetStarted: false,
                loading: false,
                initialized: true,
                error: null,
            },
            transactions: {
                page: null,
                byId: {},
                loading: false,
                error: undefined,
            },
            authChat: {
                chatId: null,
                messages: [],
                loading: false,
                error: null,
            },
        },
    });
    return render(_jsx(Provider, { store: store, children: _jsx(MemoryRouter, { initialEntries: [route], children: _jsx(Routes, { children: _jsxs(Route, { path: "/app", element: _jsx(AppLayout, {}), children: [_jsx(Route, { index: true, element: _jsx("div", { children: "Dashboard content" }) }), _jsx(Route, { path: "transactions", element: _jsx("div", { children: "Transactions content" }) }), _jsx(Route, { path: "admin", element: _jsx("div", { children: "Admin content" }) })] }) }) }) }));
}
describe('AppLayout', () => {
    beforeEach(() => {
        localStorage.clear();
    });
    it('renders outlet content with the primary shell controls', () => {
        renderLayout();
        expect(screen.getByText('Dashboard content')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
        expect(screen.getByText('MEDSPHERE')).toBeInTheDocument();
    });
    it('shows admin insights panel only for admin roles', () => {
        renderLayout();
        expect(screen.queryByText(/Security and permission monitoring enabled/i)).not.toBeInTheDocument();
        renderLayout({ roles: ['ADMIN'], route: '/app/admin' });
        expect(screen.getByText(/Security and permission monitoring enabled/i)).toBeInTheDocument();
    });
    it('toggles mobile navigation state from the header button', () => {
        renderLayout();
        const navToggle = screen.getByRole('button', { name: /open navigation/i });
        expect(navToggle).toHaveAttribute('aria-expanded', 'false');
        fireEvent.click(navToggle);
        expect(navToggle).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getAllByRole('button', { name: /close navigation/i }).length).toBeGreaterThan(0);
    });
});
