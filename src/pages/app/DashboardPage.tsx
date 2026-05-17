import { useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import { commonCopy } from '@/config/copy';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuth } from '@/app/contexts/AuthContext';
import { fetchArrayWithFallback } from '@/libs/app/api';
import { formatDate, formatPersonName, getErrorMessage, getValue } from '@/libs/app/utils';
import { hasPermission } from '@/config/permissions';
import EmptyState from '@/ui/molecules/EmptyState';
import ListSkeleton from '@/ui/molecules/ListSkeleton';
import PageHeader from '@/ui/molecules/PageHeader';

const DASHBOARD_QUERY_STALE_TIME = 60_000;

async function getTodayAppointments() {
  return fetchArrayWithFallback(['/api/dashboard/appointments/today', '/api/appointments/today']);
}

async function getAvailableRooms() {
  return fetchArrayWithFallback(['/api/dashboard/rooms/available', '/api/rooms/available']);
}

async function getActiveAdmissions() {
  return fetchArrayWithFallback(['/api/dashboard/admissions/active', '/api/admissions/active']);
}

type SummaryCard = {
  title: string;
  value: number;
  loading: boolean;
  hasError: boolean;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const canViewAppointments = hasPermission({
    userRoles: user?.roles,
    module: 'appointments',
    action: 'VIEW',
  });
  const canViewRooms = hasPermission({
    userRoles: user?.roles,
    module: 'rooms',
    action: 'VIEW',
  });
  const canViewAdmissions = hasPermission({
    userRoles: user?.roles,
    module: 'admissions',
    action: 'VIEW',
  });
  const todayAppointments = useQuery({
    queryKey: ['dashboard', 'appointments-today'],
    queryFn: getTodayAppointments,
    staleTime: DASHBOARD_QUERY_STALE_TIME,
    enabled: canViewAppointments,
  });
  const availableRooms = useQuery({
    queryKey: ['dashboard', 'available-rooms'],
    queryFn: getAvailableRooms,
    staleTime: DASHBOARD_QUERY_STALE_TIME,
    enabled: canViewRooms,
  });
  const activeAdmissions = useQuery({
    queryKey: ['dashboard', 'active-admissions'],
    queryFn: getActiveAdmissions,
    staleTime: DASHBOARD_QUERY_STALE_TIME,
    enabled: canViewAdmissions,
  });

  const summaryCards = useMemo(
    (): SummaryCard[] =>
      [
        canViewAppointments
          ? {
              title: t(commonCopy.todayAppointments),
              value: todayAppointments.data?.length ?? 0,
              loading: todayAppointments.isLoading,
              hasError: Boolean(todayAppointments.error),
            }
          : null,
        canViewRooms
          ? {
              title: t(commonCopy.availableRooms),
              value: availableRooms.data?.length ?? 0,
              loading: availableRooms.isLoading,
              hasError: Boolean(availableRooms.error),
            }
          : null,
        canViewAdmissions
          ? {
              title: t(commonCopy.activeAdmissions),
              value: activeAdmissions.data?.length ?? 0,
              loading: activeAdmissions.isLoading,
              hasError: Boolean(activeAdmissions.error),
            }
          : null,
      ].filter((card): card is SummaryCard => Boolean(card)),
    [
      canViewAdmissions,
      canViewAppointments,
      canViewRooms,
      activeAdmissions.data?.length,
      activeAdmissions.error,
      activeAdmissions.isLoading,
      availableRooms.data?.length,
      availableRooms.error,
      availableRooms.isLoading,
      t,
      todayAppointments.data?.length,
      todayAppointments.error,
      todayAppointments.isLoading,
    ]
  );

  const renderSectionState = (
    query: { data?: any[]; error: any; isLoading: boolean; refetch: () => Promise<any> },
    renderContent: () => ReactNode
  ) => {
    if (query.isLoading) {
      return <ListSkeleton />;
    }

    if (query.error) {
      return (
        <EmptyState
          compact
          tone="error"
          title={t(commonCopy.errorTitle)}
          description={getErrorMessage(query.error, t)}
          action={
            <Button variant="outline" onClick={() => query.refetch()}>
              {t(commonCopy.retry)}
            </Button>
          }
        />
      );
    }

    if (!query.data?.length) {
      return <EmptyState compact title={t(commonCopy.emptyTitle)} description={t(commonCopy.noItems)} />;
    }

    return renderContent();
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t(commonCopy.dashboard)} description={t(commonCopy.appSubtitle)} />

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title} title={card.title}>
            {card.loading ? (
              <div aria-hidden="true" className="h-10 w-16 animate-pulse rounded-2xl bg-muted" />
            ) : (
              <div className="text-3xl font-bold text-foreground">{card.hasError ? '--' : card.value}</div>
            )}
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {canViewAppointments ? (
          <Card title={t(commonCopy.todayAppointments)}>
            {renderSectionState(todayAppointments, () => (
              <div className="space-y-3">
                {todayAppointments.data?.map((appointment: any) => (
                  <div key={String(appointment.id)} className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="font-semibold text-foreground">
                      {formatPersonName(getValue(appointment, 'patient')) || getValue(appointment, 'patientName')}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(String(getValue(appointment, 'date', 'appointmentDate')), language)} ·{' '}
                      {String(getValue(appointment, 'time', 'appointmentTime'))}
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {formatPersonName(getValue(appointment, 'doctor')) || getValue(appointment, 'doctorName')}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </Card>
        ) : null}

        {canViewRooms ? (
          <Card title={t(commonCopy.availableRooms)}>
            {renderSectionState(availableRooms, () => (
              <div className="space-y-3">
                {availableRooms.data?.map((room: any) => (
                  <div key={String(room.id)} className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="font-semibold text-foreground">
                      {String(getValue(room, 'roomNumber'))}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{String(getValue(room, 'type'))}</p>
                    <p className="mt-2 text-sm text-foreground">
                      {String(getValue(room, 'department.name', 'departmentName')) || t(commonCopy.notAvailable)}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </Card>
        ) : null}

        {canViewAdmissions ? (
          <Card title={t(commonCopy.activeAdmissions)}>
            {renderSectionState(activeAdmissions, () => (
              <div className="space-y-3">
                {activeAdmissions.data?.map((admission: any) => (
                  <div key={String(admission.id)} className="rounded-2xl border border-border bg-background/60 p-4">
                    <p className="font-semibold text-foreground">
                      {formatPersonName(getValue(admission, 'patient')) || getValue(admission, 'patientName')}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {String(getValue(admission, 'room.roomNumber', 'roomNumber', 'roomId'))}
                    </p>
                    <p className="mt-2 text-sm text-foreground">
                      {formatDate(String(getValue(admission, 'admissionDate')), language)}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </Card>
        ) : null}
      </div>
    </div>
  );
}
