import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppointment, useCancelAppointment } from '@/domain/appointments/appointments.hooks';
import {
  formatAppointmentCreatedAt,
  formatAppointmentDate,
  getAppointmentApiMessage,
  getAppointmentApiStatus,
  getAppointmentDoctorName,
  getAppointmentPatientName,
  getAppointmentStatusVariant,
  isAppointmentLocked,
} from '@/domain/appointments/appointments.utils';
import { useDoctors } from '@/domain/doctors/doctors.hooks';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import AppointmentStateCard from './state-card';

function getDoctorDepartmentLabel(name: string, location: string) {
  return location.trim() ? `${name} (${location})` : name;
}

export default function AppointmentDetailsPage() {
  const { t, i18n } = useTranslation('appointments');
  const navigate = useNavigate();
  const location = useLocation();
  const { id = '' } = useParams();
  const appointmentQuery = useAppointment(id);
  const doctorsQuery = useDoctors();
  const cancelAppointment = useCancelAppointment();
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const appointment = appointmentQuery.data;
  const status = getAppointmentApiStatus(appointmentQuery.error);

  useEffect(() => {
    const successMessage = (location.state as { success?: string } | null)?.success;

    if (typeof successMessage !== 'string' || !successMessage.trim()) {
      return;
    }

    setActionSuccess(successMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const doctorMap = useMemo(
    () => new Map((doctorsQuery.data ?? []).map((doctor) => [doctor.id, doctor])),
    [doctorsQuery.data]
  );

  const handleCancel = async () => {
    if (!appointment || isAppointmentLocked(appointment.status)) {
      return;
    }

    if (!window.confirm(t('details.cancelConfirm'))) {
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      await cancelAppointment.mutateAsync(id);
      setActionSuccess(t('messages.cancelled'));
      appointmentQuery.refetch();
    } catch (error: unknown) {
      setActionError(getAppointmentApiMessage(error, t('errors.cancel')));
    }
  };

  if (appointmentQuery.isLoading) {
    return (
      <AppointmentStateCard
        title={t('states.loadingAppointmentTitle')}
        description={t('states.loadingAppointmentDescription')}
      />
    );
  }

  if (status === 401) {
    return (
      <AppointmentStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  }

  if (status === 403) {
    return (
      <AppointmentStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  }

  if (!appointment && appointmentQuery.error) {
    if (status === 404) {
      return (
        <AppointmentStateCard
          title={t('details.notFoundTitle')}
          description={t('details.notFoundDescription')}
        >
          <Button variant="outline" onClick={() => navigate('/app/appointments')}>
            {t('actions.back')}
          </Button>
        </AppointmentStateCard>
      );
    }

    return (
      <AppointmentStateCard
        title={t('states.errorTitle')}
        description={getAppointmentApiMessage(appointmentQuery.error, t('errors.details'))}
      >
        <Button variant="outline" onClick={() => appointmentQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </AppointmentStateCard>
    );
  }

  if (!appointment) {
    return null;
  }

  const doctor = doctorMap.get(appointment.doctorId);
  const departmentLabel = doctor?.department
    ? getDoctorDepartmentLabel(doctor.department.name, doctor.department.location)
    : t('labels.notAvailable');
  const locked = isAppointmentLocked(appointment.status);
  const fields = [
    { label: t('fields.patient'), value: getAppointmentPatientName(appointment.patient) },
    { label: t('fields.doctor'), value: getAppointmentDoctorName(appointment.doctor) },
    { label: t('fields.specialization'), value: appointment.doctor.specialization },
    { label: t('fields.department'), value: departmentLabel },
    { label: t('fields.date'), value: formatAppointmentDate(appointment.appointmentDate, i18n.language) },
    { label: t('fields.time'), value: appointment.appointmentTime },
    { label: t('fields.notes'), value: appointment.notes?.trim() || t('labels.noNotes'), full: true },
    {
      label: t('fields.createdAt'),
      value: formatAppointmentCreatedAt(appointment.createdAt, i18n.language) || t('labels.notAvailable'),
    },
    {
      label: t('fields.updatedAt'),
      value: formatAppointmentCreatedAt(appointment.updatedAt, i18n.language) || t('labels.notAvailable'),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              {getAppointmentPatientName(appointment.patient)}
            </h1>
            <Badge variant={getAppointmentStatusVariant(appointment.status)}>
              {t(`statuses.${appointment.status}`)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t('details.description')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/app/appointments')}>
            {t('actions.back')}
          </Button>
          <Button variant="ghost" onClick={() => navigate(`/app/patients/${appointment.patientId}`)}>
            {t('actions.viewPatient')}
          </Button>
          <Button variant="ghost" onClick={() => navigate(`/app/doctors/${appointment.doctorId}`)}>
            {t('actions.viewDoctor')}
          </Button>
          <Button
            variant="secondary"
            disabled={locked}
            onClick={() => navigate(`/app/appointments/${appointment.id}/edit`)}
          >
            {t('actions.edit')}
          </Button>
          <Button
            variant="danger"
            disabled={locked}
            loading={cancelAppointment.isPending}
            onClick={handleCancel}
          >
            {t('actions.cancelAppointment')}
          </Button>
        </div>
      </div>

      <Card title={t('details.title')} description={t('details.description')}>
        <div className="space-y-4">
          {actionSuccess ? (
            <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
              {actionSuccess}
            </div>
          ) : null}

          {actionError ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              {actionError}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label} className={field.full ? 'md:col-span-2' : undefined}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {field.label}
                </p>
                <p className="mt-1 break-words text-sm text-foreground">{field.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
}
