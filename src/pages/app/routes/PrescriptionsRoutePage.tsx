import RouteGuard from '@/app/routing/RouteGuard';
import PrescriptionsPage from '@/pages/Dashboard/prescriptions';

export default function PrescriptionsRoutePage() {
  return (
    <RouteGuard module="prescriptions" action="READ">
      <PrescriptionsPage />
    </RouteGuard>
  );
}
