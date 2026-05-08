import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '@/ui/atoms/Card';
import { commonCopy } from '../copy';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchArrayWithFallback } from '../lib/api';
import { formatDate, formatPersonName, getValue } from '../lib/utils';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';

const DASHBOARD_QUERY_STALE_TIME = 60_000;

const LoadingList = memo(function LoadingList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
});

async function getTodayAppointments() {
  return fetchArrayWithFallback(['/api/dashboard/appointments/today', '/api/appointments/today']);
}

async function getAvailableRooms() {
  return fetchArrayWithFallback(['/api/dashboard/rooms/available', '/api/rooms/available']);
}

async function getActiveAdmissions() {
  return fetchArrayWithFallback(['/api/dashboard/admissions/active', '/api/admissions/active']);
}

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const todayAppointments = useQuery({
    queryKey: ['dashboard', 'appointments-today'],
    queryFn: getTodayAppointments,
    staleTime: DASHBOARD_QUERY_STALE_TIME,
  });
  const availableRooms = useQuery({
    queryKey: ['dashboard', 'available-rooms'],
    queryFn: getAvailableRooms,
    staleTime: DASHBOARD_QUERY_STALE_TIME,
  });
  const activeAdmissions = useQuery({
    queryKey: ['dashboard', 'active-admissions'],
    queryFn: getActiveAdmissions,
    staleTime: DASHBOARD_QUERY_STALE_TIME,
  });

  const summaryCards = useMemo(
    () => [
      {
        title: t(commonCopy.todayAppointments),
        value: todayAppointments.data?.length ?? 0,
      },
      {
        title: t(commonCopy.availableRooms),
        value: availableRooms.data?.length ?? 0,
      },
      {
        title: t(commonCopy.activeAdmissions),
        value: activeAdmissions.data?.length ?? 0,
      },
    ],
    [activeAdmissions.data?.length, availableRooms.data?.length, t, todayAppointments.data?.length]
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t(commonCopy.dashboard)} description={t(commonCopy.appSubtitle)} />

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title} title={card.title}>
            <div className="text-3xl font-bold text-foreground">{card.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card title={t(commonCopy.todayAppointments)}>
          {todayAppointments.isLoading ? (
            <LoadingList />
          ) : todayAppointments.data?.length ? (
            <div className="space-y-3">
              {todayAppointments.data.map((appointment: any) => (
                <div key={String(appointment.id)} className="rounded-2xl border border-border bg-background/60 p-4">
                  <p className="font-semibold text-foreground">
                    {formatPersonName(getValue(appointment, 'patient')) || getValue(appointment, 'patient_name')}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(String(getValue(appointment, 'date', 'appointmentDate')), language)} ·{' '}
                    {String(getValue(appointment, 'time', 'appointmentTime'))}
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    {formatPersonName(getValue(appointment, 'doctor')) || getValue(appointment, 'doctor_name')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title={t(commonCopy.emptyTitle)} description={t(commonCopy.noItems)} />
          )}
        </Card>

        <Card title={t(commonCopy.availableRooms)}>
          {availableRooms.isLoading ? (
            <LoadingList />
          ) : availableRooms.data?.length ? (
            <div className="space-y-3">
              {availableRooms.data.map((room: any) => (
                <div key={String(room.id)} className="rounded-2xl border border-border bg-background/60 p-4">
                  <p className="font-semibold text-foreground">
                    {String(getValue(room, 'room_number', 'roomNumber'))}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{String(getValue(room, 'type'))}</p>
                  <p className="mt-2 text-sm text-foreground">
                    {String(getValue(room, 'department.name', 'departmentName')) || t(commonCopy.notAvailable)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title={t(commonCopy.emptyTitle)} description={t(commonCopy.noItems)} />
          )}
        </Card>

        <Card title={t(commonCopy.activeAdmissions)}>
          {activeAdmissions.isLoading ? (
            <LoadingList />
          ) : activeAdmissions.data?.length ? (
            <div className="space-y-3">
              {activeAdmissions.data.map((admission: any) => (
                <div key={String(admission.id)} className="rounded-2xl border border-border bg-background/60 p-4">
                  <p className="font-semibold text-foreground">
                    {formatPersonName(getValue(admission, 'patient')) || getValue(admission, 'patient_name')}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {String(getValue(admission, 'room.room_number', 'roomNumber', 'room_id'))}
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    {formatDate(
                      String(getValue(admission, 'admission_date', 'admitted_at', 'admissionDate', 'admittedAt')),
                      language
                    )}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title={t(commonCopy.emptyTitle)} description={t(commonCopy.noItems)} />
          )}
        </Card>
      </div>
    </div>
  );
}
