import RouteGuard from '@/app/routing/RouteGuard';
import DashboardPage from '../DashboardPage';

export default function DashboardRoutePage() {
  return (
    <RouteGuard module="dashboard" action="VIEW">
      <DashboardPage />
    </RouteGuard>
  );
}
