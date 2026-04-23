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
import PatientsListPage from '@/pages/Dashboard/patients';
import PatientDetailsPage from '@/pages/Dashboard/patients/details';
import PatientFormPage from '@/pages/Dashboard/patients/form';
import { moduleNavigation } from '@/config/moduleNavigation';
const moduleRoutes = moduleNavigation
    .filter((item) => item.key !== 'patients')
    .map((item) => ({
    path: item.path,
    element: _jsx(ModulePage, { moduleKey: item.key }),
}));
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
                    {
                        path: 'patients',
                        children: [
                            { index: true, element: _jsx(PatientsListPage, {}) },
                            { path: 'new', element: _jsx(PatientFormPage, {}) },
                            { path: ':id', element: _jsx(PatientDetailsPage, {}) },
                            { path: ':id/edit', element: _jsx(PatientFormPage, {}) },
                        ],
                    },
                    ...moduleRoutes,
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
