import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import PrivateRoute from './components/PrivateRoute';
import RouteSkeleton from './components/RouteSkeleton';
import { useAuth } from './contexts/AuthContext';
import { moduleOrder, moduleRouteMeta } from './module-meta';
import type { ModuleKey } from './types';

const LoginPage = lazy(() => import('./pages/routes/LoginRoutePage'));
const DashboardPage = lazy(() => import('./pages/routes/DashboardRoutePage'));
const NotFoundPage = lazy(() => import('./pages/routes/NotFoundRoutePage'));

const moduleRoutePages: Record<ModuleKey, LazyExoticComponent<ComponentType>> = {
  patients: lazy(() => import('./pages/routes/PatientsRoutePage')),
  doctors: lazy(() => import('./pages/routes/DoctorsRoutePage')),
  departments: lazy(() => import('./pages/routes/DepartmentsRoutePage')),
  appointments: lazy(() => import('./pages/routes/AppointmentsRoutePage')),
  'medical-records': lazy(() => import('./pages/routes/MedicalRecordsRoutePage')),
  prescriptions: lazy(() => import('./pages/routes/PrescriptionsRoutePage')),
  rooms: lazy(() => import('./pages/routes/RoomsRoutePage')),
  admissions: lazy(() => import('./pages/routes/AdmissionsRoutePage')),
  invoices: lazy(() => import('./pages/routes/InvoicesRoutePage')),
  nurses: lazy(() => import('./pages/routes/NursesRoutePage')),
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

function HomeRedirect() {
  const { ready, isAuthenticated } = useAuth();

  if (!ready) {
    return <RouteSkeleton variant="fullscreen" />;
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
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
      <Route path="/" element={<HomeRedirect />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={renderLazyPage(LoginPage, 'fullscreen')} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={renderLazyPage(DashboardPage)} />
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
