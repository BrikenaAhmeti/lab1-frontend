import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/ui/layouts/AppLayout';
import { GuestOnly, RequireAuth } from '@/domain/auth/guards';
import Login from '@/pages/Auth/login';
import Register from '@/pages/Auth/register';
import NotFound from '@/pages/NotFound';
import DesignSystemPage from '@/pages/DesignSystem';
import ModulePage from '@/pages/Dashboard/modules';
import TransactionsPageRTK from '@/pages/Dashboard/transactions';
import TransactionsPageRQ from '@/pages/Dashboard/transactions/tan-transactions';
import { moduleNavigation } from '@/config/moduleNavigation';
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
                    { index: true, element: _jsx(Navigate, { to: "patients", replace: true }) },
                    ...moduleNavigation.map((item) => ({
                        path: item.path,
                        element: _jsx(ModulePage, { moduleKey: item.key }),
                    })),
                    { path: 'transactions', element: _jsx(TransactionsPageRTK, {}) },
                    { path: 'tan-transactions', element: _jsx(TransactionsPageRQ, {}) },
                    { path: 'admin', element: _jsx(Navigate, { to: "/app/patients", replace: true }) },
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
