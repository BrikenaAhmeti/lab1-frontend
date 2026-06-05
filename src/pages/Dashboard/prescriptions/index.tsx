import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isDoctorOrAdminUser } from '@/domain/auth/role.utils';
import {
  useCreatePrescription,
  useDeletePrescription,
  useMedicalRecordPrescriptions,
  useMedicalRecords,
  useUpdatePrescription,
} from '@/domain/medical-records/medical-records.hooks';
import type {
  MedicalRecord,
  Prescription,
} from '@/domain/medical-records/medical-records.types';
import {
  formatMedicalRecordDate,
  formatMedicalRecordDateTime,
  getMedicalRecordApiMessage,
  getMedicalRecordApiStatus,
  getMedicalRecordPatientOptionLabel,
  withFallbackOption,
} from '@/domain/medical-records/medical-records.utils';
import { usePatient, usePatients } from '@/domain/patients/patients.hooks';
import { getPatientApiMessage, getPatientApiStatus } from '@/domain/patients/patients.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import Textarea from '@/ui/atoms/Textarea';
import EmptyState from '@/ui/molecules/EmptyState';

type PrescriptionFormValues = {
  medicine: string;
  dosage: string;
  duration: string;
  instructions: string;
};

type PrescriptionsStateCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

const emptyForm: PrescriptionFormValues = {
  medicine: '',
  dosage: '',
  duration: '',
  instructions: '',
};

function PrescriptionsStateCard({
  title,
  description,
  children,
}: PrescriptionsStateCardProps) {
  return (
    <EmptyState compact title={title} description={description} action={children} />
  );
}

function validateForm(values: PrescriptionFormValues, t: (key: string) => string) {
  const errors: Record<string, string> = {};

  if (!values.medicine.trim()) {
    errors.medicine = t('validation.required');
  }

  if (!values.dosage.trim()) {
    errors.dosage = t('validation.required');
  }

  if (!values.duration.trim()) {
    errors.duration = t('validation.required');
  }

  return errors;
}

function getRecordLabel(record: MedicalRecord, language: string, fallback: string) {
  const diagnosis = record.diagnosis.trim() || fallback;
  const recordDate = formatMedicalRecordDate(record.recordDate, language);
  return `${diagnosis} · ${recordDate || fallback}`;
}

function getFormValues(prescription?: Prescription | null): PrescriptionFormValues {
  if (!prescription) {
    return emptyForm;
  }

  return {
    medicine: prescription.medicine,
    dosage: prescription.dosage,
    duration: prescription.duration,
    instructions: prescription.instructions ?? '',
  };
}

export default function PrescriptionsPage() {
  const { t, i18n } = useTranslation('prescriptions');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
  const canManage = isDoctorOrAdminUser(roles);
  const patientId = searchParams.get('patientId')?.trim() ?? '';
  const recordId = searchParams.get('recordId')?.trim() ?? '';
  const [form, setForm] = useState<PrescriptionFormValues>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [editingId, setEditingId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const patientsQuery = usePatients({ page: 1, limit: 100, search: '' });
  const selectedPatientQuery = usePatient(patientId);
  const recordsQuery = useMedicalRecords(patientId);
  const prescriptionsQuery = useMedicalRecordPrescriptions(recordId);
  const createPrescription = useCreatePrescription();
  const updatePrescription = useUpdatePrescription();
  const deletePrescription = useDeletePrescription();
  const recordsStatus = getMedicalRecordApiStatus(recordsQuery.error);
  const prescriptionsStatus = getMedicalRecordApiStatus(prescriptionsQuery.error);
  const patientsStatus = getPatientApiStatus(patientsQuery.error);
  const saving = createPrescription.isPending || updatePrescription.isPending;

  useEffect(() => {
    setForm(emptyForm);
    setErrors({});
    setFormError('');
    setEditingId('');
    setShowForm(false);
  }, [recordId]);

  useEffect(() => {
    if (!recordId || recordsQuery.isLoading || recordsQuery.error || !recordsQuery.data) {
      return;
    }

    if (recordsQuery.data.some((record) => record.id === recordId)) {
      return;
    }

    const next = new URLSearchParams(searchParams);
    next.delete('recordId');
    setSearchParams(next);
  }, [
    recordId,
    recordsQuery.data,
    recordsQuery.error,
    recordsQuery.isLoading,
    searchParams,
    setSearchParams,
  ]);

  const updateParams = (values: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(values).forEach(([key, value]) => {
      if (value && value.trim()) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });

    setSearchParams(next);
    setActionError('');
    setActionSuccess('');
  };

  const patientOptions = (patientsQuery.data?.items ?? []).map((patient) => ({
    value: patient.id,
    label: getMedicalRecordPatientOptionLabel(patient),
  }));
  const selectedPatientLabel = patientId
    ? patientOptions.find((option) => option.value === patientId)?.label
      ?? (selectedPatientQuery.data
        ? getMedicalRecordPatientOptionLabel(selectedPatientQuery.data)
        : patientId)
    : '';
  const patientSelectOptions = withFallbackOption(
    patientOptions,
    patientId,
    selectedPatientLabel
  );

  const recordOptions = (recordsQuery.data ?? []).map((record) => ({
    value: record.id,
    label: getRecordLabel(record, i18n.language, t('labels.notAvailable')),
  }));
  const selectedRecordLabel = recordId
    ? recordOptions.find((option) => option.value === recordId)?.label ?? recordId
    : '';
  const recordSelectOptions = withFallbackOption(recordOptions, recordId, selectedRecordLabel);

  const handleFormChange = (name: keyof PrescriptionFormValues, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  };

  const handleCreateClick = () => {
    setForm(emptyForm);
    setErrors({});
    setFormError('');
    setActionError('');
    setActionSuccess('');
    setEditingId('');
    setShowForm(true);
  };

  const handleEditClick = (prescription: Prescription) => {
    setForm(getFormValues(prescription));
    setErrors({});
    setFormError('');
    setActionError('');
    setActionSuccess('');
    setEditingId(prescription.id);
    setShowForm(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(form, t);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length || !recordId) {
      return;
    }

    const payload = {
      medicalRecordId: recordId,
      medicine: form.medicine.trim(),
      dosage: form.dosage.trim(),
      duration: form.duration.trim(),
      instructions: form.instructions.trim() || null,
    };

    try {
      setFormError('');
      setActionError('');
      setActionSuccess('');

      if (editingId) {
        await updatePrescription.mutateAsync({
          id: editingId,
          payload,
        });
      } else {
        await createPrescription.mutateAsync(payload);
      }

      setForm(emptyForm);
      setErrors({});
      setEditingId('');
      setShowForm(false);
      setActionSuccess(editingId ? t('messages.updated') : t('messages.created'));
    } catch (error: unknown) {
      setFormError(
        getMedicalRecordApiMessage(error, t('errors.save'), {
          400: t('errors.invalidData'),
          403: t('errors.writeForbidden'),
          404: t('errors.notFound'),
        })
      );
    }
  };

  const handleDelete = async (prescription: Prescription) => {
    if (!window.confirm(t('details.deleteConfirm'))) {
      return;
    }

    try {
      setFormError('');
      setActionError('');
      setActionSuccess('');
      await deletePrescription.mutateAsync({
        id: prescription.id,
        medicalRecordId: prescription.medicalRecordId,
      });

      if (editingId === prescription.id) {
        setForm(emptyForm);
        setErrors({});
        setEditingId('');
        setShowForm(false);
      }

      setActionSuccess(t('messages.deleted'));
    } catch (error: unknown) {
      setActionError(
        getMedicalRecordApiMessage(error, t('errors.delete'), {
          403: t('errors.writeForbidden'),
          404: t('errors.notFound'),
        })
      );
    }
  };

  let listContent = null;

  if (!patientId) {
    listContent = (
      <PrescriptionsStateCard
        title={t('states.selectPatientTitle')}
        description={t('states.selectPatientDescription')}
      />
    );
  } else if (recordsStatus === 401 || patientsStatus === 401 || prescriptionsStatus === 401) {
    listContent = (
      <PrescriptionsStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  } else if (recordsStatus === 403 || patientsStatus === 403 || prescriptionsStatus === 403) {
    listContent = (
      <PrescriptionsStateCard
        title={canManage ? t('states.forbiddenTitle') : t('states.writeForbiddenTitle')}
        description={
          canManage ? t('states.forbiddenDescription') : t('states.writeForbiddenDescription')
        }
      />
    );
  } else if (recordsQuery.isLoading) {
    listContent = (
      <PrescriptionsStateCard
        title={t('states.loadingTitle')}
        description={t('states.loadingDescription')}
      />
    );
  } else if (recordsQuery.error) {
    listContent = (
      <PrescriptionsStateCard
        title={t('states.errorTitle')}
        description={getMedicalRecordApiMessage(recordsQuery.error, t('errors.records'), {
          404: t('errors.notFound'),
        })}
      >
        <Button variant="outline" onClick={() => recordsQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </PrescriptionsStateCard>
    );
  } else if (!recordsQuery.data?.length) {
    listContent = (
      <PrescriptionsStateCard
        title={t('states.emptyRecordsTitle')}
        description={t('states.emptyRecordsDescription')}
      >
        <Button
          variant="outline"
          onClick={() =>
            navigate(
              patientId
                ? `/medical-records?patientId=${encodeURIComponent(patientId)}`
                : '/medical-records'
            )
          }
        >
          {t('actions.viewRecords')}
        </Button>
      </PrescriptionsStateCard>
    );
  } else if (!recordId) {
    listContent = (
      <PrescriptionsStateCard
        title={t('states.selectRecordTitle')}
        description={t('states.selectRecordDescription')}
      />
    );
  } else if (prescriptionsQuery.isLoading) {
    listContent = (
      <PrescriptionsStateCard
        title={t('states.loadingTitle')}
        description={t('states.loadingDescription')}
      />
    );
  } else if (prescriptionsQuery.error) {
    listContent = (
      <PrescriptionsStateCard
        title={t('states.errorTitle')}
        description={getMedicalRecordApiMessage(prescriptionsQuery.error, t('errors.list'), {
          404: t('errors.notFound'),
        })}
      >
        <Button variant="outline" onClick={() => prescriptionsQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </PrescriptionsStateCard>
    );
  } else if (!prescriptionsQuery.data?.length) {
    listContent = (
      <PrescriptionsStateCard
        title={t('states.emptyTitle')}
        description={t('states.emptyDescription')}
      >
        {canManage ? (
          <Button onClick={handleCreateClick}>{t('actions.create')}</Button>
        ) : null}
      </PrescriptionsStateCard>
    );
  } else {
    listContent = (
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/70 text-muted-foreground">
              <th className="px-3 py-3 font-medium">{t('fields.medicine')}</th>
              <th className="px-3 py-3 font-medium">{t('fields.dosage')}</th>
              <th className="px-3 py-3 font-medium">{t('fields.duration')}</th>
              <th className="px-3 py-3 font-medium">{t('fields.instructions')}</th>
              <th className="px-3 py-3 font-medium">{t('fields.updatedAt')}</th>
              {canManage ? <th className="px-3 py-3 font-medium">{t('actions.edit')}</th> : null}
            </tr>
          </thead>
          <tbody>
            {prescriptionsQuery.data.map((prescription) => (
              <tr key={prescription.id} className="border-b border-border/50 last:border-b-0">
                <td className="px-3 py-3 font-medium text-foreground">{prescription.medicine}</td>
                <td className="px-3 py-3 text-foreground">{prescription.dosage}</td>
                <td className="px-3 py-3 text-foreground">{prescription.duration}</td>
                <td className="px-3 py-3 text-foreground">
                  {prescription.instructions?.trim() || t('labels.noInstructions')}
                </td>
                <td className="px-3 py-3 text-foreground">
                  {formatMedicalRecordDateTime(
                    prescription.updatedAt || prescription.createdAt,
                    i18n.language
                  ) || t('labels.notAvailable')}
                </td>
                {canManage ? (
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditClick(prescription)}
                      >
                        {t('actions.edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={
                          deletePrescription.isPending
                          && deletePrescription.variables?.id === prescription.id
                        }
                        onClick={() => handleDelete(prescription)}
                      >
                        {t('actions.delete')}
                      </Button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
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

        <div className="flex flex-wrap items-center gap-2">
          {selectedPatientQuery.data ? (
            <Button
              variant="ghost"
              onClick={() => navigate('/patients')}
            >
              {t('actions.viewPatient')}
            </Button>
          ) : null}
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                patientId
                  ? `/medical-records?patientId=${encodeURIComponent(patientId)}`
                  : '/medical-records'
              )
            }
          >
            {t('actions.viewRecords')}
          </Button>
          {canManage ? (
            <Button disabled={!recordId} onClick={handleCreateClick}>
              {t('actions.create')}
            </Button>
          ) : (
            <Badge variant="secondary">{t('labels.viewOnly')}</Badge>
          )}
        </div>
      </div>

      <Card
        title={t('filters.title')}
        description={t('filters.description')}
        className="relative z-20"
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <Select
            name="patientId"
            label={t('fields.patient')}
            value={patientId}
            searchPlaceholder={t('filters.patientSearchPlaceholder')}
            hint={patientsQuery.isLoading ? t('labels.loadingPatients') : undefined}
            error={patientsQuery.error ? getPatientApiMessage(patientsQuery.error, t('errors.patients')) : ''}
            onChange={(event) =>
              updateParams({
                patientId: event.target.value || null,
                recordId: null,
              })
            }
          >
            <option value="">{t('filters.patientPlaceholder')}</option>
            {patientSelectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            name="recordId"
            label={t('fields.record')}
            value={recordId}
            disabled={!patientId || recordsQuery.isLoading}
            hint={!patientId ? undefined : recordsQuery.isLoading ? t('labels.loadingRecords') : undefined}
            error={recordsQuery.error ? getMedicalRecordApiMessage(recordsQuery.error, t('errors.records')) : ''}
            onChange={(event) =>
              updateParams({
                patientId: patientId || null,
                recordId: event.target.value || null,
              })
            }
          >
            <option value="">{t('filters.recordPlaceholder')}</option>
            {recordSelectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {showForm && canManage && recordId ? (
        <Card
          title={editingId ? t('form.editTitle') : t('form.createTitle')}
          description={t('form.description')}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                required
                name="medicine"
                label={t('fields.medicine')}
                value={form.medicine}
                error={errors.medicine}
                onChange={(event) => handleFormChange('medicine', event.target.value)}
              />
              <Input
                required
                name="dosage"
                label={t('fields.dosage')}
                value={form.dosage}
                error={errors.dosage}
                onChange={(event) => handleFormChange('dosage', event.target.value)}
              />
              <Input
                required
                name="duration"
                label={t('fields.duration')}
                value={form.duration}
                error={errors.duration}
                onChange={(event) => handleFormChange('duration', event.target.value)}
              />
              <Input
                name="record"
                label={t('fields.record')}
                value={selectedRecordLabel}
                readOnly
              />
            </div>

            <Textarea
              name="instructions"
              label={t('fields.instructions')}
              value={form.instructions}
              placeholder={t('form.instructionsPlaceholder')}
              onChange={(event) => handleFormChange('instructions', event.target.value)}
            />

            {formError ? <p className="text-sm text-danger">{formError}</p> : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" loading={saving}>
                {editingId ? t('actions.update') : t('actions.save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForm(emptyForm);
                  setErrors({});
                  setFormError('');
                  setEditingId('');
                  setShowForm(false);
                }}
              >
                {t('actions.cancel')}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <Card
        title={t('list.resultsTitle')}
        description={t('list.resultsDescription')}
        className="relative z-0"
      >
        <div className="space-y-4">
          {prescriptionsQuery.isFetching && !prescriptionsQuery.isLoading ? (
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

          {listContent}
        </div>
      </Card>
    </section>
  );
}
