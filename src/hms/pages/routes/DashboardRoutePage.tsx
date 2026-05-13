import RouteGuard from '../../components/RouteGuard';
import DashboardPage from '../DashboardPage';

export default function DashboardRoutePage() {
  return (
    <RouteGuard module="dashboard" action="VIEW">
      <DashboardPage />
    </RouteGuard>
  );
}
