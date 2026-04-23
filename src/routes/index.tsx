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
    element: <ModulePage moduleKey={item.key} />,
  }));

export const router = createBrowserRouter([
  {
    element: <GuestOnly />,
    children: [
      {
        element: <Login />,
        path: '/login',
      },
      {
        element: <Register />,
        path: '/register',
      },
    ],
  },
  {
    path: '/transactions',
    element: <Navigate to="/app/tan-transactions" replace />,
  },
  {
    element: <DesignSystemPage />,
    path: '/design-system',
  },
  {
    path: '/app',
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="patients" replace /> },
          {
            path: 'patients',
            children: [
              { index: true, element: <PatientsListPage /> },
              { path: 'new', element: <PatientFormPage /> },
              { path: ':id', element: <PatientDetailsPage /> },
              { path: ':id/edit', element: <PatientFormPage /> },
            ],
          },
          ...moduleRoutes,
          { path: 'transactions', element: <TransactionsPageRTK /> },
          { path: 'tan-transactions', element: <TransactionsPageRQ /> },
          { path: 'admin', element: <Navigate to="/app/patients" replace /> },
        ],
      },
    ],
  },

  {
    path: '/403',
    element: <div className="p-6">Forbidden</div>,
  },
  {
    path: '*',
    element: <NotFound />,
  },
  {
    path: '/dashboard',
    element: <Navigate to="/app" replace />,
  },
]);
