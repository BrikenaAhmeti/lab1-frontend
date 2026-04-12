import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/ui/layouts/AppLayout';
import { GuestOnly, RequireAuth, RequireRole } from '@/domain/auth/guards';
import Login from '@/pages/Auth/login';
import Register from '@/pages/Auth/register';
import NotFound from '@/pages/NotFound';
import DesignSystemPage from '@/pages/DesignSystem';
import Home from '@/pages/Dashboard/home';
import TransactionsPageRTK from '@/pages/Dashboard/transactions';
import TransactionsPageRQ from '@/pages/Dashboard/transactions/tan-transactions';
export const router = createBrowserRouter([
    {
        element: _jsx(GuestOnly, {}),
        children: [
            {
                element: _jsx(Login, {}),
                path: '/login',
            },
            {
                element: _jsx(Register, {}),
                path: '/register',
            },
        ],
    },
    {
        path: '/transactions',
        element: _jsx(Navigate, { to: "/app/tan-transactions", replace: true }),
    },
    {
        element: _jsx(DesignSystemPage, {}),
        path: '/design-system',
    },
    {
        path: '/app',
        element: _jsx(RequireAuth, {}),
        children: [
            {
                element: _jsx(AppLayout, {}),
                children: [
                    { index: true, element: _jsx(Home, {}) },
                    { path: 'transactions', element: _jsx(TransactionsPageRTK, {}) },
                    { path: 'tan-transactions', element: _jsx(TransactionsPageRQ, {}) },
                    {
                        element: _jsx(RequireRole, { allow: ['ADMIN'] }),
                        children: [{ path: 'admin', element: _jsx("div", { className: "p-6", children: "Admin Area" }) }],
                    },
                ],
            },
        ],
    },
    {
        path: '/403',
        element: _jsx("div", { className: "p-6", children: "Forbidden" }),
    },
    {
        path: '*',
        element: _jsx(NotFound, {}),
    },
    {
        path: '/dashboard',
        element: _jsx(Navigate, { to: "/app", replace: true }),
    },
]);
