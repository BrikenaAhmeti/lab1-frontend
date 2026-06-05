import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/contexts/AuthContext';
import { hasPermission, type AppModule, type PermissionAction } from '@/config/permissions';
import { buildLocationPath } from '@/libs/app/navigation';

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
  const returnTo = buildLocationPath(location);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: returnTo }} />;
  }

  if (!hasPermission({ userRoles: user?.roles, module, action })) {
    return <Navigate to="/unauthorized" replace state={{ from: returnTo }} />;
  }

  return <>{children}</>;
}
