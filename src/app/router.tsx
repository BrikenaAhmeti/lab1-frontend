import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AppLayout from '@/ui/organisms/AppLayout';
import PrivateRoute from '@/app/routing/PrivateRoute';
import RouteSkeleton from '@/ui/molecules/RouteSkeleton';
import { useAuth } from '@/app/contexts/AuthContext';
import { moduleOrder, moduleRouteMeta } from '@/config/moduleMeta';
import type { ModuleKey } from '@/types/app';

const LoginPage = lazy(() => import('@/pages/app/routes/LoginRoutePage'));
const LandingPage = lazy(() => import('@/pages/app/routes/LandingRoutePage'));
const DashboardPage = lazy(() => import('@/pages/app/routes/DashboardRoutePage'));
const AccessDeniedPage = lazy(() => import('@/pages/app/routes/AccessDeniedRoutePage'));
const NotFoundPage = lazy(() => import('@/pages/app/routes/NotFoundRoutePage'));

const moduleRoutePages: Record<ModuleKey, LazyExoticComponent<ComponentType>> = {
  patients: lazy(() => import('@/pages/app/routes/PatientsRoutePage')),
  doctors: lazy(() => import('@/pages/app/routes/DoctorsRoutePage')),
  departments: lazy(() => import('@/pages/app/routes/DepartmentsRoutePage')),
  appointments: lazy(() => import('@/pages/app/routes/AppointmentsRoutePage')),
  'medical-records': lazy(() => import('@/pages/app/routes/MedicalRecordsRoutePage')),
  prescriptions: lazy(() => import('@/pages/app/routes/PrescriptionsRoutePage')),
  rooms: lazy(() => import('@/pages/app/routes/RoomsRoutePage')),
  admissions: lazy(() => import('@/pages/app/routes/AdmissionsRoutePage')),
  invoices: lazy(() => import('@/pages/app/routes/InvoicesRoutePage')),
  nurses: lazy(() => import('@/pages/app/routes/NursesRoutePage')),
  receptionists: lazy(() => import('@/pages/app/routes/ReceptionistsRoutePage')),
};

function renderLazyPage(
  PageComponent: LazyExoticComponent<ComponentType>,
  variant: 'page' | 'fullscreen' = 'page'
) {
  return (
    <Suspense fallback={<RouteSkeleton variant={variant} />}>
      <PageComponent />
    </Suspense>
  );
}

function GuestRoute() {
  const { ready, isAuthenticated } = useAuth();

  if (!ready) {
    return <RouteSkeleton variant="fullscreen" />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route index element={renderLazyPage(LandingPage, 'fullscreen')} />
        <Route path="login" element={renderLazyPage(LoginPage, 'fullscreen')} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={renderLazyPage(DashboardPage)} />
          <Route path="/unauthorized" element={renderLazyPage(AccessDeniedPage)} />
          {moduleOrder.map((key) => (
            <Route
              key={key}
              path={`/${moduleRouteMeta[key].path}`}
              element={renderLazyPage(moduleRoutePages[key])}
            />
          ))}
        </Route>
      </Route>
      <Route
        path="*"
        element={
          <Suspense fallback={<RouteSkeleton variant="fullscreen" />}>
            <NotFoundPage />
          </Suspense>
        }
      />
    </Routes>
  );
}
