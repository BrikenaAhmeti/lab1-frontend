import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function RoleGuard({
  allow,
  children,
}: {
  allow?: string[];
  children: ReactNode;
}) {
  const { can } = useAuth();

  if (!can(allow)) {
    return null;
  }

  return <>{children}</>;
}
