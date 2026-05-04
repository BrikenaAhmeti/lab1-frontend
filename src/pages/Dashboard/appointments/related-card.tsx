import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '@/domain/appointments/appointments.hooks';
import {
  formatAppointmentDate,
  getAppointmentApiMessage,
  getAppointmentDoctorName,
  getAppointmentPatientName,
  getAppointmentStatusVariant,
  getTodayDateValue,
} from '@/domain/appointments/appointments.utils';
import { useDoctors } from '@/domain/doctors/doctors.hooks';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';

type RelatedAppointmentsCardProps = {
  patientId?: string;
  doctorId?: string;
};

function getDoctorDepartmentLabel(name: string, location: string) {
  return location.trim() ? `${name} (${location})` : name;
}

export default function RelatedAppointmentsCard({
  patientId,
  doctorId,
}: RelatedAppointmentsCardProps) {
  const { t, i18n } = useTranslation('appointments');
  const navigate = useNavigate();
  const appointmentsQuery = useAppointments({ patientId, doctorId });
  const doctorsQuery = useDoctors();
  const doctorMap = new Map((doctorsQuery.data ?? []).map((doctor) => [doctor.id, doctor]));
  const isDoctorView = !!doctorId;
  const results = appointmentsQuery.data ?? [];
  const upcoming = results.slice(0, 5);

  let content = null;

  if (appointmentsQuery.isLoading) {
    content = <p className="text-sm text-muted-foreground">{t('related.loading')}</p>;
  } else if (appointmentsQuery.error) {
    content = (
      <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
        <div>{getAppointmentApiMessage(appointmentsQuery.error, t('errors.list'))}</div>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => appointmentsQuery.refetch()}
        >
          {t('actions.retry')}
        </Button>
      </div>
    );
  } else if (!results.length) {
    content = (
      <div className="rounded-2xl border border-border/70 bg-background/45 px-4 py-5">
        <p className="text-sm font-semibold text-foreground">{t('related.emptyTitle')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('related.emptyDescription')}</p>
      </div>
    );
  } else {
    content = (
      <div className="space-y-3">
        {upcoming.map((appointment) => {
          const doctor = doctorMap.get(appointment.doctorId);
          const departmentLabel = doctor?.department
            ? getDoctorDepartmentLabel(doctor.department.name, doctor.department.location)
            : '';

          return (
            <div
              key={appointment.id}
              className="rounded-2xl border border-border/70 bg-background/45 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {isDoctorView
                      ? getAppointmentPatientName(appointment.patient)
                      : getAppointmentDoctorName(appointment.doctor)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatAppointmentDate(appointment.appointmentDate, i18n.language)} ·{' '}
                    {appointment.appointmentTime}
                  </p>
                </div>
                <Badge variant={getAppointmentStatusVariant(appointment.status)}>
                  {t(`statuses.${appointment.status}`)}
                </Badge>
              </div>

              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                {isDoctorView ? null : (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('fields.specialization')}
                    </p>
                    <p className="mt-1 text-foreground">{appointment.doctor.specialization}</p>
                  </div>
                )}
                {departmentLabel ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('fields.department')}
                    </p>
                    <p className="mt-1 text-foreground">{departmentLabel}</p>
                  </div>
                ) : null}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/app/appointments/${appointment.id}`)}
                >
                  {t('actions.view')}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card
      title={isDoctorView ? t('related.doctorTitle') : t('related.patientTitle')}
      description={t('related.count', { count: results.length })}
      footer={
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              navigate('/app/appointments/new', {
                state: {
                  patientId: patientId ?? '',
                  doctorId: doctorId ?? '',
                  date: getTodayDateValue(),
                },
              })
            }
          >
            {t('actions.create')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              navigate(
                `/app/appointments?${
                  patientId ? `patientId=${encodeURIComponent(patientId)}` : `doctorId=${encodeURIComponent(doctorId ?? '')}`
                }`
              )
            }
          >
            {t('actions.viewAll')}
          </Button>
        </div>
      }
    >
      {content}
    </Card>
  );
}
