import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTodayAppointments } from '@/domain/appointments/appointments.hooks';
import {
  formatAppointmentDate,
  getAppointmentApiMessage,
  getAppointmentDoctorName,
  getAppointmentPatientName,
  getAppointmentStatusVariant,
  getTodayDateValue,
} from '@/domain/appointments/appointments.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import EmptyState from '@/ui/molecules/EmptyState';
import ListSkeleton from '@/ui/molecules/ListSkeleton';

export default function TodayAppointmentsWidget() {
  const { t, i18n } = useTranslation('appointments');
  const navigate = useNavigate();
  const appointmentsQuery = useTodayAppointments();
  const appointments = appointmentsQuery.data ?? [];
  const items = appointments.slice(0, 5);

  let content = null;

  if (appointmentsQuery.isLoading) {
    content = <ListSkeleton items={2} />;
  } else if (appointmentsQuery.error) {
    content = (
      <EmptyState
        compact
        tone="error"
        title={t('states.errorTitle')}
        description={getAppointmentApiMessage(appointmentsQuery.error, t('errors.today'))}
        action={
          <Button size="sm" variant="outline" onClick={() => appointmentsQuery.refetch()}>
            {t('actions.retry')}
          </Button>
        }
      />
    );
  } else if (!appointments.length) {
    content = (
      <EmptyState compact title={t('widget.emptyTitle')} description={t('widget.emptyDescription')} />
    );
  } else {
    content = (
      <div className="space-y-3">
        <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('widget.countLabel')}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{appointments.length}</p>
        </div>

        {items.map((appointment) => (
          <div
            key={appointment.id}
            className="rounded-2xl border border-border/70 bg-background/45 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {getAppointmentPatientName(appointment.patient)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {getAppointmentDoctorName(appointment.doctor)} · {appointment.appointmentTime}
                </p>
              </div>
              <Badge variant={getAppointmentStatusVariant(appointment.status)}>
                {t(`statuses.${appointment.status}`)}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {formatAppointmentDate(appointment.appointmentDate, i18n.language)}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card
      title={t('widget.title')}
      description={t('widget.description')}
      footer={
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/app/appointments?date=${encodeURIComponent(getTodayDateValue())}`)}
        >
          {t('actions.viewToday')}
        </Button>
      }
    >
      {content}
    </Card>
  );
}
