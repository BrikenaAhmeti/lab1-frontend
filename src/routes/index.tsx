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
          { index: true, element: <Home /> },
          { path: 'transactions', element: <TransactionsPageRTK /> },
          { path: 'tan-transactions', element: <TransactionsPageRQ /> },
          {
            element: <RequireRole allow={['ADMIN']} />,
            children: [{ path: 'admin', element: <div className="p-6">Admin Area</div> }],
          },
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
