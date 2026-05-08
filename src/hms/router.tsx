import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import PrivateRoute from './components/PrivateRoute';
import { commonCopy } from './copy';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import { moduleConfigs, moduleOrder } from './modules';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ModulePage from './pages/ModulePage';

function HomeRedirect() {
  const { ready, isAuthenticated } = useAuth();

  if (!ready) {
    return null;
  }

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function GuestRoute() {
  const { ready, isAuthenticated } = useAuth();

  if (!ready) {
    return null;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t(commonCopy.emptyDescription)}</p>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          {moduleOrder.map((key) => (
            <Route
              key={key}
              path={`/${moduleConfigs[key].path}`}
              element={<ModulePage moduleKey={key} />}
            />
          ))}
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
