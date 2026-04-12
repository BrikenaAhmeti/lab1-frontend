import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

const getStoredRoles = () => {
  const role = localStorage.getItem('role');
  return role ? [role] : [];
};

const normalizeRole = (role: string) => role.trim().toUpperCase();

export function GuestOnly() {
  const { user, tokens, initialized } = useAppSelector((s) => s.auth);
  if (!initialized) return null;
  const isAuthed = !!(user && tokens?.accessToken);
  return isAuthed ? <Navigate to="/app" replace /> : <Outlet />;
}

export function RequireAuth() {
  const { user, tokens, initialized } = useAppSelector((s) => s.auth);
  const location = useLocation();
  if (!initialized) return null;
  const isAuthed = !!(user && tokens?.accessToken);
  return isAuthed ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
}

export function RequireRole({ allow }: { allow: string[] }) {
  const { user, initialized } = useAppSelector((s) => s.auth);
  if (!initialized) return null;

  const allowedRoles = allow.map(normalizeRole);
  const userRoles = [...(user?.roles ?? []), ...getStoredRoles()].map(normalizeRole);
  const hasRole = userRoles.some((role) => allowedRoles.includes(role));

  if (!userRoles.length) return <Navigate to="/login" replace />;
  return hasRole ? <Outlet /> : <Navigate to="/403" replace />;
}

export function RequireFinishedGetStarted() {
  const { finishedGetStarted, initialized } = useAppSelector((s) => s.auth);
  if (!initialized) return null;
  return finishedGetStarted ? <Outlet /> : <Navigate to="/choose" replace />;
}
