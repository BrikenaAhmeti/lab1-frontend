import { Navigate, Outlet, useLocation } from 'react-router-dom';
import RouteSkeleton from '@/ui/molecules/RouteSkeleton';
import { useAuth } from '@/app/contexts/AuthContext';
import { buildLocationPath } from '@/libs/app/navigation';

export default function PrivateRoute() {
  const location = useLocation();
  const { ready, isAuthenticated } = useAuth();

  if (!ready) {
    return <RouteSkeleton variant="fullscreen" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: buildLocationPath(location) }} />;
  }

  return <Outlet />;
}
