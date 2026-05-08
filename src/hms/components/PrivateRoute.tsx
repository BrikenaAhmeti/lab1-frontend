import { Navigate, Outlet, useLocation } from 'react-router-dom';
import RouteSkeleton from './RouteSkeleton';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute() {
  const location = useLocation();
  const { ready, isAuthenticated } = useAuth();

  if (!ready) {
    return <RouteSkeleton variant="fullscreen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
