import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission, type AppModule, type PermissionAction } from '../permissions';

export default function PermissionGuard({
  module,
  action,
  fallback = null,
  children,
}: {
  module: AppModule;
  action: PermissionAction;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const { user } = useAuth();

  if (!hasPermission({ userRoles: user?.roles, module, action })) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
