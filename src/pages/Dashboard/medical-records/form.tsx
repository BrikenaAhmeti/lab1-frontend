import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isAdminUser, isDoctorOrAdminUser } from '@/domain/auth/role.utils';
import { useDoctors } from '@/domain/doctors/doctors.hooks';
import { isDoctorInactiveApiError } from '@/domain/doctors/doctors.utils';
import {
  useCreateMedicalRecord,
  useMedicalRecord,
  useUpdateMedicalRecord,
} from '@/domain/medical-records/medical-records.hooks';
import {
  getMedicalRecordApiMessage,
  getMedicalRecordApiStatus,
  getMedicalRecordDoctorOptionLabel,
  getMedicalRecordPatientOptionLabel,
  medicalRecordDatePattern,
  withFallbackOption,
} from '@/domain/medical-records/medical-records.utils';
import { usePatient, usePatients } from '@/domain/patients/patients.hooks';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import Textarea from '@/ui/atoms/Textarea';
import MedicalRecordStateCard from './state-card';

type MedicalRecordFormValues = {
  patientId: string;
  doctorId: string;
  diagnosis: string;
  treatment: string;
  prescriptionsText: string;
  date: string;
};

const emptyForm: MedicalRecordFormValues = {
  patientId: '',
  doctorId: '',
  diagnosis: '',
  treatment: '',
  prescriptionsText: '',
  date: '',
};

function validateFormWithDoctors(
  values: MedicalRecordFormValues,
  activeDoctorIds: Set<string>,
  t: (key: string) => string
) {
  const errors: Record<string, string> = {};

  if (!values.patientId.trim()) errors.patientId = t('validation.required');
  if (!values.doctorId.trim()) errors.doctorId = t('validation.required');
  if (!values.diagnosis.trim()) errors.diagnosis = t('validation.required');
  if (!values.treatment.trim()) errors.treatment = t('validation.required');
  if (!values.date.trim()) errors.date = t('validation.required');

  if (values.date && !medicalRecordDatePattern.test(values.date)) {
    errors.date = t('validation.date');
  }

  if (values.doctorId && !activeDoctorIds.has(values.doctorId.trim())) {
    errors.doctorId = t('validation.activeDoctor');
  }

  return errors;
}

function getBackPath(patientId: string) {
  return patientId.trim()
    ? `/medical-records?patientId=${encodeURIComponent(patientId.trim())}`
    : '/medical-records';
}

export default function MedicalRecordFormPage() {
  const { t } = useTranslation('medicalRecords');
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const [searchParams] = useSearchParams();
  const patientIdFromQuery = searchParams.get('patientId')?.trim() ?? '';
  const isEdit = !!id;
  const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
  const userId = useAppSelector((state) => state.auth.user?.id ?? '');
  const canManage = isDoctorOrAdminUser(roles);
  const isAdmin = isAdminUser(roles);
  const recordQuery = useMedicalRecord(id);
  const doctorsQuery = useDoctors();
  const [patientSearch, setPatientSearch] = useState('');
  const patientsQuery = usePatients({ page: 1, limit: 50, search: patientSearch });
  const [form, setForm] = useState<MedicalRecordFormValues>({
    ...emptyForm,
    patientId: patientIdFromQuery,
  });
  const selectedPatientQuery = usePatient(form.patientId);
  const createMedicalRecord = useCreateMedicalRecord();
  const updateMedicalRecord = useUpdateMedicalRecord();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const status = getMedicalRecordApiStatus(recordQuery.error);
  const saving = createMedicalRecord.isPending || updateMedicalRecord.isPending;
  const currentDoctor = (doctorsQuery.data ?? []).find(
    (doctor) => doctor.userId === userId && doctor.isActive
  );

  useEffect(() => {
    if (!isEdit && patientIdFromQuery && !form.patientId) {
      setForm((current) => ({ ...current, patientId: patientIdFromQuery }));
    }
  }, [form.patientId, isEdit, patientIdFromQuery]);

  useEffect(() => {
    if (!isEdit && !isAdmin && currentDoctor?.id && !form.doctorId) {
      setForm((current) => ({ ...current, doctorId: currentDoctor.id }));
    }
  }, [currentDoctor?.id, form.doctorId, isAdmin, isEdit]);

  useEffect(() => {
    if (!isEdit || !recordQuery.data) {
      return;
    }

    setForm({
      patientId: recordQuery.data.patientId,
      doctorId: recordQuery.data.doctorId,
      diagnosis: recordQuery.data.diagnosis,
      treatment: recordQuery.data.treatment,
      prescriptionsText: recordQuery.data.prescriptionsText ?? '',
      date: recordQuery.data.recordDate,
    });
  }, [isEdit, recordQuery.data]);

  const patientOptions = (patientsQuery.data?.items ?? []).map((patient) => ({
    value: patient.id,
    label: getMedicalRecordPatientOptionLabel(patient),
  }));
  const selectedPatientLabel =
    patientOptions.find((option) => option.value === form.patientId)?.label
    ?? (selectedPatientQuery.data
      ? getMedicalRecordPatientOptionLabel(selectedPatientQuery.data)
      : form.patientId);
  const patientSelectOptions = withFallbackOption(
    patientOptions,
    form.patientId,
    selectedPatientLabel
  );

  const doctorOptions = (doctorsQuery.data ?? [])
    .filter((doctor) => doctor.isActive)
    .map((doctor) => ({
      value: doctor.id,
      label: getMedicalRecordDoctorOptionLabel(doctor),
    }));
  const activeDoctorIds = new Set(doctorOptions.map((option) => option.value));
  const selectedDoctorLabel =
    doctorOptions.find((option) => option.value === form.doctorId)?.label
    ?? (recordQuery.data?.doctor
      ? `${getMedicalRecordDoctorOptionLabel(recordQuery.data.doctor)} ${t('labels.inactiveDoctorSuffix')}`
      : currentDoctor
        ? getMedicalRecordDoctorOptionLabel(currentDoctor)
        : form.doctorId);
  const doctorSelectOptions = withFallbackOption(
    doctorOptions,
    form.doctorId,
    selectedDoctorLabel
  );
  const selectedDoctorInactive = !!form.doctorId && !activeDoctorIds.has(form.doctorId);

  const handleChange = (name: keyof MedicalRecordFormValues, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canManage) {
      return;
    }

    const nextErrors = validateFormWithDoctors(form, activeDoctorIds, t);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    const payload = {
      patientId: form.patientId.trim(),
      doctorId: form.doctorId.trim(),
      diagnosis: form.diagnosis.trim(),
      treatment: form.treatment.trim(),
      prescriptionsText: form.prescriptionsText.trim() || null,
      date: form.date,
    };

    try {
      const record = isEdit
        ? await updateMedicalRecord.mutateAsync({ id, payload })
        : await createMedicalRecord.mutateAsync(payload);

      navigate(getBackPath(record.patientId), {
        replace: true,
        state: { success: isEdit ? t('messages.updated') : t('messages.created') },
      });
    } catch (error: unknown) {
      if (isDoctorInactiveApiError(error)) {
        setErrors((current) => ({ ...current, doctorId: t('validation.activeDoctor') }));
        setFormError(t('errors.inactiveDoctor'));
        doctorsQuery.refetch();
        return;
      }

      setFormError(
        getMedicalRecordApiMessage(error, t('errors.save'), {
          400: t('errors.invalidData'),
          403: t('errors.writeForbidden'),
          404: t('errors.notFound'),
        })
      );
    }
  };

  if (!canManage) {
    return (
      <MedicalRecordStateCard
        title={t('states.writeForbiddenTitle')}
        description={t('states.writeForbiddenDescription')}
      >
        <Button variant="outline" onClick={() => navigate(getBackPath(patientIdFromQuery))}>
          {t('actions.back')}
        </Button>
      </MedicalRecordStateCard>
    );
  }

  if (isEdit && recordQuery.isLoading) {
    return (
      <MedicalRecordStateCard
        title={t('states.loadingRecordTitle')}
        description={t('states.loadingRecordDescription')}
      />
    );
  }

  if (isEdit && status === 401) {
    return (
      <MedicalRecordStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  }

  if (isEdit && status === 403) {
    return (
      <MedicalRecordStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  }

  if (isEdit && status === 404) {
    return (
      <MedicalRecordStateCard
        title={t('details.notFoundTitle')}
        description={t('details.notFoundDescription')}
      >
        <Button variant="outline" onClick={() => navigate(getBackPath(patientIdFromQuery))}>
          {t('actions.back')}
        </Button>
      </MedicalRecordStateCard>
    );
  }

  if (isEdit && recordQuery.error) {
    return (
      <MedicalRecordStateCard
        title={t('states.errorTitle')}
        description={getMedicalRecordApiMessage(recordQuery.error, t('errors.details'))}
      >
        <Button variant="outline" onClick={() => recordQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </MedicalRecordStateCard>
    );
  }

  if (doctorsQuery.isLoading || patientsQuery.isLoading) {
    return (
      <MedicalRecordStateCard
        title={t('states.loadingOptionsTitle')}
        description={t('states.loadingOptionsDescription')}
      />
    );
  }

  if (doctorsQuery.error) {
    return (
      <MedicalRecordStateCard
        title={t('states.errorTitle')}
        description={getMedicalRecordApiMessage(doctorsQuery.error, t('errors.doctors'))}
      >
        <Button variant="outline" onClick={() => doctorsQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </MedicalRecordStateCard>
    );
  }

  if (!patientSelectOptions.length && !selectedPatientQuery.data) {
    return (
      <MedicalRecordStateCard
        title={t('states.emptyPatientsTitle')}
        description={t('states.emptyPatientsDescription')}
      >
        <Button variant="outline" onClick={() => navigate('/patients')}>
          {t('actions.viewPatients')}
        </Button>
      </MedicalRecordStateCard>
    );
  }

  if (!doctorSelectOptions.length) {
    return (
      <MedicalRecordStateCard
        title={t('states.emptyDoctorsTitle')}
        description={t('states.emptyDoctorsDescription')}
      >
        <Button variant="outline" onClick={() => navigate('/doctors')}>
          {t('actions.viewDoctors')}
        </Button>
      </MedicalRecordStateCard>
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
          onClick={() =>
            navigate(
              getBackPath(
                form.patientId
                || recordQuery.data?.patientId
                || patientIdFromQuery
              )
            )
          }
        >
          {t('actions.cancel')}
        </Button>
      </div>

      <Card title={t('form.formTitle')} description={t('form.formDescription')}>
        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
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
              hint={patientsQuery.isLoading ? t('labels.loadingPatients') : undefined}
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
              hint={
                selectedDoctorInactive
                  ? t('form.inactiveDoctorHint')
                  : doctorsQuery.isLoading
                    ? t('labels.loadingDoctors')
                    : undefined
              }
              onChange={(event) => handleChange('doctorId', event.target.value)}
            >
              <option value="">{t('form.doctorPlaceholder')}</option>
              {doctorSelectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Input
              required
              type="date"
              name="date"
              label={t('fields.recordDate')}
              value={form.date}
              error={errors.date}
              onChange={(event) => handleChange('date', event.target.value)}
            />
            <Input
              required
              name="diagnosis"
              label={t('fields.diagnosis')}
              value={form.diagnosis}
              error={errors.diagnosis}
              onChange={(event) => handleChange('diagnosis', event.target.value)}
            />
          </div>

          <Textarea
            required
            name="treatment"
            label={t('fields.treatment')}
            value={form.treatment}
            error={errors.treatment}
            onChange={(event) => handleChange('treatment', event.target.value)}
          />

          <Textarea
            name="prescriptionsText"
            label={t('fields.prescriptionsText')}
            value={form.prescriptionsText}
            onChange={(event) => handleChange('prescriptionsText', event.target.value)}
          />

          {formError ? <p className="text-sm text-danger">{formError}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={saving}>
              {isEdit ? t('actions.update') : t('actions.save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                navigate(
                  getBackPath(
                    form.patientId
                    || recordQuery.data?.patientId
                    || patientIdFromQuery
                  )
                )
              }
            >
              {t('actions.cancel')}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
