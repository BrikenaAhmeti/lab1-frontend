import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission, type AppModule, type PermissionAction } from '../permissions';

export default function RouteGuard({
  module,
  action,
  children,
}: {
  module: AppModule;
  action: PermissionAction;
  children: ReactNode;
}) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!hasPermission({ userRoles: user?.roles, module, action })) {
    return <Navigate to="/unauthorized" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
