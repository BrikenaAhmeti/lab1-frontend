import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppointments, useCancelAppointment } from '@/domain/appointments/appointments.hooks';
import type { AppointmentStatus } from '@/domain/appointments/appointments.types';
import {
  formatAppointmentDate,
  getAppointmentApiMessage,
  getAppointmentApiStatus,
  getAppointmentDoctorName,
  getAppointmentPatientName,
  getAppointmentStatusVariant,
} from '@/domain/appointments/appointments.utils';
import type { Doctor } from '@/domain/doctors/doctors.types';
import { useDoctors } from '@/domain/doctors/doctors.hooks';
import type { Patient } from '@/domain/patients/patients.types';
import { usePatient, usePatients } from '@/domain/patients/patients.hooks';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import AppointmentStateCard from './state-card';

type FilterParams = {
  date: string | null;
  doctorId: string | null;
  patientId: string | null;
  status: string | null;
};

function getDoctorLabel(doctor: Doctor) {
  const fullName = [doctor.firstName, doctor.lastName].filter(Boolean).join(' ').trim();
  const departmentName = doctor.department?.name ? ` · ${doctor.department.name}` : '';

  return `${fullName} · ${doctor.specialization}${departmentName}`;
}

function getPatientLabel(patient: Patient) {
  const fullName = [patient.firstName, patient.lastName].filter(Boolean).join(' ').trim();
  return patient.phoneNumber ? `${fullName} (${patient.phoneNumber})` : fullName;
}

function withFallbackOption(
  options: Array<{ value: string; label: string }>,
  value: string,
  label: string
) {
  if (!value || options.some((option) => option.value === value)) {
    return options;
  }

  return [{ value, label }, ...options];
}

export default function AppointmentsListPage() {
  const { t, i18n } = useTranslation('appointments');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const date = searchParams.get('date')?.trim() ?? '';
  const doctorId = searchParams.get('doctorId')?.trim() ?? '';
  const patientId = searchParams.get('patientId')?.trim() ?? '';
  const status = searchParams.get('status')?.trim() ?? '';
  const [patientSearch, setPatientSearch] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const appointmentsQuery = useAppointments({
    date,
    doctorId,
    patientId,
    status: status as AppointmentStatus | '',
  });
  const doctorsQuery = useDoctors();
  const patientsQuery = usePatients({ page: 1, limit: 50, search: patientSearch });
  const selectedPatientQuery = usePatient(patientId);
  const cancelAppointment = useCancelAppointment();
  const appointmentsStatus = getAppointmentApiStatus(appointmentsQuery.error);

  useEffect(() => {
    const successMessage = (location.state as { success?: string } | null)?.success;

    if (typeof successMessage !== 'string' || !successMessage.trim()) {
      return;
    }

    setActionSuccess(successMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const updateParams = (values: FilterParams) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(values).forEach(([key, value]) => {
      if (value && value.trim()) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });

    setSearchParams(next);
  };

  const doctorMap = useMemo(
    () => new Map((doctorsQuery.data ?? []).map((doctor) => [doctor.id, doctor])),
    [doctorsQuery.data]
  );

  const patientOptions = (patientsQuery.data?.items ?? []).map((patient) => ({
    value: patient.id,
    label: getPatientLabel(patient),
  }));
  const patientLabel = patientId
    ? patientOptions.find((option) => option.value === patientId)?.label
      ?? (selectedPatientQuery.data ? getPatientLabel(selectedPatientQuery.data) : patientId)
    : '';
  const patientSelectOptions = withFallbackOption(patientOptions, patientId, patientLabel);

  const handleCancel = async (id: string) => {
    if (!window.confirm(t('details.cancelConfirm'))) {
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      await cancelAppointment.mutateAsync(id);
      setActionSuccess(t('messages.cancelled'));
    } catch (error: unknown) {
      setActionError(getAppointmentApiMessage(error, t('errors.cancel')));
    }
  };

  let content = null;

  if (appointmentsQuery.isLoading) {
    content = (
      <AppointmentStateCard
        title={t('states.loadingTitle')}
        description={t('states.loadingDescription')}
      />
    );
  } else if (appointmentsStatus === 401) {
    content = (
      <AppointmentStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  } else if (appointmentsStatus === 403) {
    content = (
      <AppointmentStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  } else if (appointmentsQuery.error) {
    content = (
      <AppointmentStateCard
        title={t('states.errorTitle')}
        description={getAppointmentApiMessage(
          appointmentsQuery.error,
          t('errors.list'),
          t('errors.conflict')
        )}
      >
        <Button variant="outline" onClick={() => appointmentsQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </AppointmentStateCard>
    );
  } else if (!appointmentsQuery.data?.length) {
    content = (
      <AppointmentStateCard
        title={t('states.emptyTitle')}
        description={t('states.emptyDescription')}
      >
        <Button onClick={() => navigate('/app/appointments/new')}>{t('actions.create')}</Button>
      </AppointmentStateCard>
    );
  } else {
    content = (
      <div className="grid gap-4 xl:grid-cols-2">
        {appointmentsQuery.data.map((appointment) => {
          const doctor = doctorMap.get(appointment.doctorId);
          const departmentLabel = doctor?.department?.name || t('labels.notAvailable');
          const isLocked = appointment.status !== 'Scheduled';

          return (
            <div
              key={appointment.id}
              className="rounded-2xl border border-border/70 bg-background/50 p-5 transition-shadow duration-200 hover:shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-foreground">
                    {getAppointmentPatientName(appointment.patient)}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getAppointmentDoctorName(appointment.doctor)} · {appointment.doctor.specialization}
                  </p>
                </div>
                <Badge variant={getAppointmentStatusVariant(appointment.status)}>
                  {t(`statuses.${appointment.status}`)}
                </Badge>
              </div>

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('fields.date')}
                  </p>
                  <p className="mt-1 break-words text-foreground">
                    {formatAppointmentDate(appointment.appointmentDate, i18n.language)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('fields.time')}
                  </p>
                  <p className="mt-1 break-words text-foreground">{appointment.appointmentTime}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('fields.department')}
                  </p>
                  <p className="mt-1 break-words text-foreground">{departmentLabel}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('fields.notes')}
                  </p>
                  <p className="mt-1 break-words text-foreground">
                    {appointment.notes?.trim() || t('labels.noNotes')}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/app/appointments/${appointment.id}`)}
                >
                  {t('actions.view')}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/app/appointments/${appointment.id}/edit`)}
                >
                  {t('actions.edit')}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={isLocked}
                  loading={cancelAppointment.isPending && cancelAppointment.variables === appointment.id}
                  onClick={() => handleCancel(appointment.id)}
                >
                  {t('actions.cancelAppointment')}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{t('list.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('list.description')}</p>
        </div>
        <Button onClick={() => navigate('/app/appointments/new')}>{t('actions.create')}</Button>
      </div>

      <Card title={t('filters.title')} description={t('filters.description')}>
        <div className="grid gap-3 lg:grid-cols-5">
          <Input
            type="date"
            name="date"
            label={t('fields.date')}
            value={date}
            onChange={(event) =>
              updateParams({
                date: event.target.value || null,
                doctorId: doctorId || null,
                patientId: patientId || null,
                status: status || null,
              })
            }
          />

          <Select
            name="doctorId"
            label={t('fields.doctor')}
            value={doctorId}
            disabled={doctorsQuery.isLoading || !!doctorsQuery.error}
            onChange={(event) =>
              updateParams({
                date: date || null,
                doctorId: event.target.value || null,
                patientId: patientId || null,
                status: status || null,
              })
            }
          >
            <option value="">
              {doctorsQuery.isLoading ? t('labels.loadingDoctors') : t('filters.allDoctors')}
            </option>
            {(doctorsQuery.data ?? []).map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {getDoctorLabel(doctor)}
              </option>
            ))}
          </Select>

          <div className="space-y-3">
            <Input
              name="patientSearch"
              label={t('fields.patientSearch')}
              value={patientSearch}
              placeholder={t('filters.patientSearchPlaceholder')}
              onChange={(event) => setPatientSearch(event.target.value)}
            />
            <Select
              name="patientId"
              label={t('fields.patient')}
              value={patientId}
              disabled={patientsQuery.isLoading || !!patientsQuery.error}
              onChange={(event) =>
                updateParams({
                  date: date || null,
                  doctorId: doctorId || null,
                  patientId: event.target.value || null,
                  status: status || null,
                })
              }
            >
              <option value="">
                {patientsQuery.isLoading ? t('labels.loadingPatients') : t('filters.allPatients')}
              </option>
              {patientSelectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <Select
            name="status"
            label={t('fields.status')}
            value={status}
            onChange={(event) =>
              updateParams({
                date: date || null,
                doctorId: doctorId || null,
                patientId: patientId || null,
                status: event.target.value || null,
              })
            }
          >
            <option value="">{t('filters.allStatuses')}</option>
            <option value="Scheduled">{t('statuses.Scheduled')}</option>
            <option value="Completed">{t('statuses.Completed')}</option>
            <option value="Cancelled">{t('statuses.Cancelled')}</option>
          </Select>

          <Button
            type="button"
            variant="outline"
            className="lg:self-end"
            onClick={() => {
              setPatientSearch('');
              updateParams({
                date: null,
                doctorId: null,
                patientId: null,
                status: null,
              });
            }}
          >
            {t('actions.clear')}
          </Button>
        </div>
      </Card>

      <Card
        title={t('list.resultsTitle')}
        description={
          appointmentsQuery.data
            ? t('list.results', { count: appointmentsQuery.data.length })
            : t('list.resultsDescription')
        }
      >
        <div className="space-y-4">
          {appointmentsQuery.isFetching && !appointmentsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t('list.refreshing')}</p>
          ) : null}

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

          {content}
        </div>
      </Card>
    </section>
  );
}
