import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '@/ui/layouts/AppLayout';
import { GuestOnly, RequireAuth } from '@/domain/auth/guards';

import Login from '@/pages/Auth/login';
import Register from '@/pages/Auth/register';
import NotFound from '@/pages/NotFound';
import DesignSystemPage from '@/pages/DesignSystem';
import ModulePage from '@/pages/Dashboard/modules';
import DashboardHomePage from '@/pages/Dashboard/home';
import TransactionsPageRTK from '@/pages/Dashboard/transactions';
import TransactionsPageRQ from '@/pages/Dashboard/transactions/tan-transactions';
import PatientsListPage from '@/pages/Dashboard/patients';
import PatientDetailsPage from '@/pages/Dashboard/patients/details';
import PatientFormPage from '@/pages/Dashboard/patients/form';
import AppointmentsListPage from '@/pages/Dashboard/appointments';
import AppointmentDetailsPage from '@/pages/Dashboard/appointments/details';
import AppointmentFormPage from '@/pages/Dashboard/appointments/form';
import DoctorsListPage from '@/pages/Dashboard/doctors';
import DoctorDetailsPage from '@/pages/Dashboard/doctors/details';
import DoctorFormPage from '@/pages/Dashboard/doctors/form';
import DepartmentsListPage from '@/pages/Dashboard/departments';
import DepartmentDetailsPage from '@/pages/Dashboard/departments/details';
import DepartmentFormPage from '@/pages/Dashboard/departments/form';
import NursesListPage from '@/pages/Dashboard/nurses';
import NurseDetailsPage from '@/pages/Dashboard/nurses/details';
import NurseFormPage from '@/pages/Dashboard/nurses/form';
import { moduleNavigation } from '@/config/moduleNavigation';

const moduleRoutes = moduleNavigation
  .filter((item) => !['patients', 'doctors', 'departments', 'appointments', 'nurses'].includes(item.key))
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
          { index: true, element: <DashboardHomePage /> },
          {
            path: 'patients',
            children: [
              { index: true, element: <PatientsListPage /> },
              { path: 'new', element: <PatientFormPage /> },
              { path: ':id', element: <PatientDetailsPage /> },
              { path: ':id/edit', element: <PatientFormPage /> },
            ],
          },
          {
            path: 'appointments',
            children: [
              { index: true, element: <AppointmentsListPage /> },
              { path: 'new', element: <AppointmentFormPage /> },
              { path: ':id', element: <AppointmentDetailsPage /> },
              { path: ':id/edit', element: <AppointmentFormPage /> },
            ],
          },
          {
            path: 'doctors',
            children: [
              { index: true, element: <DoctorsListPage /> },
              { path: 'new', element: <DoctorFormPage /> },
              { path: ':id', element: <DoctorDetailsPage /> },
              { path: ':id/edit', element: <DoctorFormPage /> },
            ],
          },
          {
            path: 'departments',
            children: [
              { index: true, element: <DepartmentsListPage /> },
              { path: 'new', element: <DepartmentFormPage /> },
              { path: ':id', element: <DepartmentDetailsPage /> },
              { path: ':id/edit', element: <DepartmentFormPage /> },
            ],
          },
          {
            path: 'nurses',
            children: [
              { index: true, element: <NursesListPage /> },
              { path: 'new', element: <NurseFormPage /> },
              { path: ':id', element: <NurseDetailsPage /> },
              { path: ':id/edit', element: <NurseFormPage /> },
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
