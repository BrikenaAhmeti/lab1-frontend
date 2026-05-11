import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  useAppointment,
  useCreateAppointment,
  useUpdateAppointment,
} from '@/domain/appointments/appointments.hooks';
import type { UpdateAppointmentDTO } from '@/domain/appointments/appointments.types';
import type { Doctor } from '@/domain/doctors/doctors.types';
import { useDoctors } from '@/domain/doctors/doctors.hooks';
import { isDoctorInactiveApiError } from '@/domain/doctors/doctors.utils';
import { usePatient, usePatients } from '@/domain/patients/patients.hooks';
import type { Patient } from '@/domain/patients/patients.types';
import {
  appointmentDatePattern,
  appointmentTimePattern,
  getAppointmentApiMessage,
  getAppointmentApiStatus,
  getAppointmentDateValue,
  isAppointmentLocked,
  isPastAppointmentSlot,
} from '@/domain/appointments/appointments.utils';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import Textarea from '@/ui/atoms/Textarea';
import AppointmentStateCard from './state-card';

type AppointmentFormValues = {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: string;
  notes: string;
};

type LocationState = {
  patientId?: string;
  doctorId?: string;
  date?: string;
};

const emptyForm: AppointmentFormValues = {
  patientId: '',
  doctorId: '',
  date: '',
  time: '',
  status: 'Scheduled',
  notes: '',
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

function validateForm(
  values: AppointmentFormValues,
  canEditSchedule: boolean,
  activeDoctorIds: Set<string>,
  t: (key: string) => string
) {
  const errors: Record<string, string> = {};

  if (!values.patientId.trim()) errors.patientId = t('validation.required');
  if (!values.doctorId.trim()) errors.doctorId = t('validation.required');
  if (!values.date.trim()) errors.date = t('validation.required');
  if (!values.time.trim()) errors.time = t('validation.required');

  if (values.date && !appointmentDatePattern.test(values.date)) {
    errors.date = t('validation.date');
  }

  if (values.time && !appointmentTimePattern.test(values.time)) {
    errors.time = t('validation.time');
  }

  if (values.doctorId && !activeDoctorIds.has(values.doctorId.trim())) {
    errors.doctorId = t('validation.activeDoctor');
  }

  if (canEditSchedule && values.date && values.time && isPastAppointmentSlot(values.date, values.time)) {
    errors.date = t('validation.future');
  }

  return errors;
}

export default function AppointmentFormPage() {
  const { t } = useTranslation('appointments');
  const navigate = useNavigate();
  const location = useLocation();
  const { id = '' } = useParams();
  const isEdit = !!id;
  const locationState = (location.state as LocationState | null) ?? null;
  const appointmentQuery = useAppointment(id);
  const doctorsQuery = useDoctors();
  const [form, setForm] = useState<AppointmentFormValues>({
    ...emptyForm,
    patientId: locationState?.patientId ?? '',
    doctorId: locationState?.doctorId ?? '',
    date: locationState?.date ?? '',
  });
  const [patientSearch, setPatientSearch] = useState('');
  const patientsQuery = usePatients({ page: 1, limit: 50, search: patientSearch });
  const selectedPatientQuery = usePatient(form.patientId);
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const status = getAppointmentApiStatus(appointmentQuery.error);
  const saving = createAppointment.isPending || updateAppointment.isPending;

  useEffect(() => {
    if (!isEdit || !appointmentQuery.data) {
      return;
    }

    setForm({
      patientId: appointmentQuery.data.patientId,
      doctorId: appointmentQuery.data.doctorId,
      date: getAppointmentDateValue(appointmentQuery.data.appointmentDate),
      time: appointmentQuery.data.appointmentTime,
      status: appointmentQuery.data.status,
      notes: appointmentQuery.data.notes ?? '',
    });
  }, [appointmentQuery.data, isEdit]);

  const locked = isEdit && appointmentQuery.data ? isAppointmentLocked(appointmentQuery.data.status) : false;
  const canEditSchedule = !isEdit || form.status === 'Scheduled';

  const patientOptions = useMemo(
    () =>
      (patientsQuery.data?.items ?? []).map((patient) => ({
        value: patient.id,
        label: getPatientLabel(patient),
      })),
    [patientsQuery.data]
  );

  const selectedPatientLabel =
    patientOptions.find((option) => option.value === form.patientId)?.label
    ?? (selectedPatientQuery.data ? getPatientLabel(selectedPatientQuery.data) : form.patientId);
  const patientSelectOptions = withFallbackOption(
    patientOptions,
    form.patientId,
    selectedPatientLabel
  );

  const doctorOptions = (doctorsQuery.data ?? []).map((doctor) => ({
    value: doctor.id,
    label: getDoctorLabel(doctor),
  }));
  const activeDoctorIds = new Set(doctorOptions.map((option) => option.value));
  const selectedDoctorLabel =
    doctorOptions.find((option) => option.value === form.doctorId)?.label
    ?? (appointmentQuery.data?.doctor
      ? `${getDoctorLabel(appointmentQuery.data.doctor as Doctor)} ${t('labels.inactiveDoctorSuffix')}`
      : form.doctorId);
  const doctorSelectOptions = withFallbackOption(doctorOptions, form.doctorId, selectedDoctorLabel);
  const selectedDoctorInactive = !!form.doctorId && !activeDoctorIds.has(form.doctorId);

  const handleChange = (name: keyof AppointmentFormValues, value: string) => {
    if (name === 'status' && value !== 'Scheduled' && appointmentQuery.data) {
      setForm((current) => ({
        ...current,
        patientId: appointmentQuery.data?.patientId ?? current.patientId,
        doctorId: appointmentQuery.data?.doctorId ?? current.doctorId,
        date: appointmentQuery.data ? getAppointmentDateValue(appointmentQuery.data.appointmentDate) : current.date,
        time: appointmentQuery.data?.appointmentTime ?? current.time,
        status: value,
      }));
      setErrors((current) => ({ ...current, status: '' }));
      setFormError('');
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(form, canEditSchedule, activeDoctorIds, t);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    try {
      if (isEdit && appointmentQuery.data) {
        const payload: UpdateAppointmentDTO = {};

        if (appointmentQuery.data.status !== form.status) {
          payload.status = form.status as UpdateAppointmentDTO['status'];
        }

        if (!locked && form.status === 'Scheduled') {
          if (appointmentQuery.data.patientId !== form.patientId.trim()) {
            payload.patientId = form.patientId.trim();
          }

          if (appointmentQuery.data.doctorId !== form.doctorId.trim()) {
            payload.doctorId = form.doctorId.trim();
          }

          if (getAppointmentDateValue(appointmentQuery.data.appointmentDate) !== form.date) {
            payload.date = form.date;
          }

          if (appointmentQuery.data.appointmentTime !== form.time) {
            payload.time = form.time;
          }
        }

        const nextNotes = form.notes.trim();
        const currentNotes = appointmentQuery.data.notes ?? '';

        if (currentNotes !== nextNotes) {
          payload.notes = nextNotes || null;
        }

        if (!Object.keys(payload).length) {
          setFormError(t('validation.noChanges'));
          return;
        }

        const appointment = await updateAppointment.mutateAsync({ id, payload });

        navigate(`/app/appointments/${appointment.id}`, {
          replace: true,
          state: { success: t('messages.updated') },
        });
        return;
      }

      const appointment = await createAppointment.mutateAsync({
        patientId: form.patientId.trim(),
        doctorId: form.doctorId.trim(),
        date: form.date,
        time: form.time,
        notes: form.notes.trim() || undefined,
      });

      navigate(`/app/appointments/${appointment.id}`, {
        replace: true,
        state: { success: t('messages.created') },
      });
    } catch (error: unknown) {
      if (isDoctorInactiveApiError(error)) {
        setErrors((current) => ({ ...current, doctorId: t('validation.activeDoctor') }));
        setFormError(t('errors.inactiveDoctor'));
        doctorsQuery.refetch();
        return;
      }

      setFormError(getAppointmentApiMessage(error, t('errors.save'), t('errors.conflict')));
    }
  };

  if (isEdit && appointmentQuery.isLoading) {
    return (
      <AppointmentStateCard
        title={t('states.loadingAppointmentTitle')}
        description={t('states.loadingAppointmentDescription')}
      />
    );
  }

  if (isEdit && status === 404) {
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

  if (isEdit && status === 401) {
    return (
      <AppointmentStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  }

  if (isEdit && status === 403) {
    return (
      <AppointmentStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  }

  if (isEdit && appointmentQuery.error) {
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

  if (doctorsQuery.isLoading || patientsQuery.isLoading) {
    return (
      <AppointmentStateCard
        title={t('states.loadingOptionsTitle')}
        description={t('states.loadingOptionsDescription')}
      />
    );
  }

  if (doctorsQuery.error) {
    return (
      <AppointmentStateCard
        title={t('states.errorTitle')}
        description={getAppointmentApiMessage(doctorsQuery.error, t('errors.doctors'))}
      >
        <Button variant="outline" onClick={() => doctorsQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </AppointmentStateCard>
    );
  }

  if (patientsQuery.error) {
    return (
      <AppointmentStateCard
        title={t('states.errorTitle')}
        description={getAppointmentApiMessage(patientsQuery.error, t('errors.patients'))}
      >
        <Button variant="outline" onClick={() => patientsQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </AppointmentStateCard>
    );
  }

  if (!doctorOptions.length) {
    return (
      <AppointmentStateCard
        title={t('states.emptyDoctorsTitle')}
        description={t('states.emptyDoctorsDescription')}
      >
        <Button variant="outline" onClick={() => navigate('/app/doctors')}>
          {t('actions.viewDoctors')}
        </Button>
      </AppointmentStateCard>
    );
  }

  if (!patientSelectOptions.length && !form.patientId) {
    return (
      <AppointmentStateCard
        title={t('states.emptyPatientsTitle')}
        description={t('states.emptyPatientsDescription')}
      >
        <Button variant="outline" onClick={() => navigate('/app/patients')}>
          {t('actions.viewPatients')}
        </Button>
      </AppointmentStateCard>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {isEdit ? t('form.editTitle') : t('form.createTitle')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEdit ? t('form.editDescription') : t('form.createDescription')}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate(isEdit ? `/app/appointments/${id}` : '/app/appointments')}
        >
          {t('actions.cancel')}
        </Button>
      </div>

      <Card title={t('form.formTitle')} description={t('form.formDescription')}>
        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          {locked ? (
            <div className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-attention">
              {t('form.lockedNotice')}
            </div>
          ) : null}

          {formError ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              {formError}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              name="patientSearch"
              label={t('fields.patientSearch')}
              value={patientSearch}
              placeholder={t('form.patientSearchPlaceholder')}
              onChange={(event) => setPatientSearch(event.target.value)}
            />

            <Select
              required
              name="patientId"
              label={t('fields.patient')}
              value={form.patientId}
              error={errors.patientId}
              disabled={!canEditSchedule}
              onChange={(event) => handleChange('patientId', event.target.value)}
            >
              <option value="">{t('form.patientPlaceholder')}</option>
              {patientSelectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Select
              required
              name="doctorId"
              label={t('fields.doctor')}
              value={form.doctorId}
              error={errors.doctorId}
              hint={selectedDoctorInactive ? t('form.inactiveDoctorHint') : undefined}
              disabled={!canEditSchedule}
              onChange={(event) => handleChange('doctorId', event.target.value)}
            >
              <option value="">{t('form.doctorPlaceholder')}</option>
              {doctorSelectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            {isEdit ? (
              <Select
                name="status"
                label={t('fields.status')}
                value={form.status}
                disabled={locked}
                onChange={(event) => handleChange('status', event.target.value)}
              >
                <option value="Scheduled">{t('statuses.Scheduled')}</option>
                <option value="Completed">{t('statuses.Completed')}</option>
                <option value="Cancelled">{t('statuses.Cancelled')}</option>
              </Select>
            ) : (
              <Input
                disabled
                readOnly
                name="status"
                label={t('fields.status')}
                value={t('statuses.Scheduled')}
                hint={t('form.statusHint')}
              />
            )}

            <Input
              required
              type="date"
              name="date"
              label={t('fields.date')}
              value={form.date}
              error={errors.date}
              disabled={!canEditSchedule}
              onChange={(event) => handleChange('date', event.target.value)}
            />

            <Input
              required
              type="time"
              name="time"
              label={t('fields.time')}
              value={form.time}
              error={errors.time}
              disabled={!canEditSchedule}
              onChange={(event) => handleChange('time', event.target.value)}
            />
          </div>

          <Textarea
            name="notes"
            label={t('fields.notes')}
            value={form.notes}
            placeholder={t('form.notesPlaceholder')}
            onChange={(event) => handleChange('notes', event.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={saving}>
              {isEdit ? t('actions.update') : t('actions.save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(isEdit ? `/app/appointments/${id}` : '/app/appointments')}
            >
              {t('actions.cancel')}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
