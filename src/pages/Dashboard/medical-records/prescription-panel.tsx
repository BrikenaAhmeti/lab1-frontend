import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCreatePrescription,
  useDeletePrescription,
  useMedicalRecordPrescriptions,
  useUpdatePrescription,
} from '@/domain/medical-records/medical-records.hooks';
import { downloadPrescriptionPdf } from '@/domain/medical-records/prescriptions.pdf';
import type { MedicalRecord, Prescription } from '@/domain/medical-records/medical-records.types';
import { getMedicalRecordApiMessage } from '@/domain/medical-records/medical-records.utils';
import Button from '@/ui/atoms/Button';
import Input from '@/ui/atoms/Input';
import EmptyState from '@/ui/molecules/EmptyState';
import ListSkeleton from '@/ui/molecules/ListSkeleton';
import Textarea from '@/ui/atoms/Textarea';

type PrescriptionPanelProps = {
  medicalRecordId: string;
  medicalRecord?: MedicalRecord;
  canManage?: boolean;
};

type PrescriptionFormValues = {
  medicine: string;
  dosage: string;
  duration: string;
  instructions: string;
};

const emptyForm: PrescriptionFormValues = {
  medicine: '',
  dosage: '',
  duration: '',
  instructions: '',
};

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

export default function PrescriptionPanel({
  medicalRecordId,
  medicalRecord,
  canManage = false,
}: PrescriptionPanelProps) {
  const { t, i18n } = useTranslation('medicalRecords');
  const prescriptionsQuery = useMedicalRecordPrescriptions(medicalRecordId);
  const createPrescription = useCreatePrescription();
  const updatePrescription = useUpdatePrescription();
  const deletePrescription = useDeletePrescription();
  const prescriptions = prescriptionsQuery.data ?? [];
  const [form, setForm] = useState<PrescriptionFormValues>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [editingId, setEditingId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const saving = createPrescription.isPending || updatePrescription.isPending;

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
    setFormError('');
    setEditingId('');
    setShowForm(false);
  };

  const handleChange = (name: keyof PrescriptionFormValues, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
    setFormSuccess('');
  };

  const handleCreateClick = () => {
    setForm(emptyForm);
    setErrors({});
    setFormError('');
    setFormSuccess('');
    setEditingId('');
    setShowForm(true);
  };

  const handleEditClick = (prescription: Prescription) => {
    setForm(getFormValues(prescription));
    setErrors({});
    setFormError('');
    setFormSuccess('');
    setEditingId(prescription.id);
    setShowForm(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(form, t);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    const payload = {
      medicine: form.medicine.trim(),
      dosage: form.dosage.trim(),
      duration: form.duration.trim(),
      instructions: form.instructions.trim() || null,
    };

    try {
      setFormError('');
      setFormSuccess('');

      if (editingId) {
        await updatePrescription.mutateAsync({
          id: editingId,
          payload,
        });
      } else {
        await createPrescription.mutateAsync({
          medicalRecordId,
          ...payload,
        });
      }

      resetForm();
      setFormSuccess(editingId ? t('messages.prescriptionUpdated') : t('messages.prescriptionCreated'));
    } catch (error: unknown) {
      setFormError(
        getMedicalRecordApiMessage(error, t('errors.prescriptionSave'), {
          400: t('errors.invalidPrescriptionData'),
          403: t('errors.writeForbidden'),
          404: t('errors.notFound'),
        })
      );
    }
  };

  const handleDelete = async (prescription: Prescription) => {
    if (!window.confirm(t('prescriptions.deleteConfirm'))) {
      return;
    }

    try {
      setFormError('');
      setFormSuccess('');
      await deletePrescription.mutateAsync({
        id: prescription.id,
        medicalRecordId: prescription.medicalRecordId,
      });
      if (editingId === prescription.id) {
        resetForm();
      }
      setFormSuccess(t('messages.prescriptionDeleted'));
    } catch (error: unknown) {
      setFormError(
        getMedicalRecordApiMessage(error, t('errors.prescriptionDelete'), {
          403: t('errors.writeForbidden'),
          404: t('errors.notFound'),
        })
      );
    }
  };

  const handleDownloadPdf = async () => {
    setFormError('');
    setFormSuccess('');
    setDownloadingPdf(true);

    try {
      await downloadPrescriptionPdf({
        prescriptions,
        medicalRecord,
        medicalRecordId,
        patient: medicalRecord?.patient ?? null,
      }, {
        language: i18n.language,
      });
    } catch {
      setFormError(t('errors.prescriptionPdf'));
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-border/70 bg-background/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t('prescriptions.title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t('prescriptions.description')}</p>
        </div>

        <div className="flex flex-wrap gap-2 print:hidden">
          <Button
            size="sm"
            variant="outline"
            loading={downloadingPdf}
            onClick={() => {
              void handleDownloadPdf();
            }}
          >
            {t('actions.print')}
          </Button>
          {canManage ? (
            <Button size="sm" variant="secondary" onClick={handleCreateClick}>
              {t('actions.addPrescription')}
            </Button>
          ) : null}
        </div>
      </div>

      {formSuccess ? (
        <div className="mt-4 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
          {formSuccess}
        </div>
      ) : null}

      {formError ? (
        <div className="mt-4 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {formError}
        </div>
      ) : null}

      {showForm && canManage ? (
        <form className="mt-4 space-y-4 rounded-2xl border border-border/70 bg-background/70 p-4 print:hidden" onSubmit={handleSubmit}>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              {editingId ? t('prescriptions.editTitle') : t('prescriptions.createTitle')}
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">{t('prescriptions.formDescription')}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              required
              name="medicine"
              label={t('fields.medicine')}
              value={form.medicine}
              error={errors.medicine}
              onChange={(event) => handleChange('medicine', event.target.value)}
            />
            <Input
              required
              name="dosage"
              label={t('fields.dosage')}
              value={form.dosage}
              error={errors.dosage}
              onChange={(event) => handleChange('dosage', event.target.value)}
            />
            <Input
              required
              name="duration"
              label={t('fields.duration')}
              value={form.duration}
              error={errors.duration}
              onChange={(event) => handleChange('duration', event.target.value)}
            />
          </div>

          <Textarea
            name="instructions"
            label={t('fields.instructions')}
            value={form.instructions}
            placeholder={t('prescriptions.instructionsPlaceholder')}
            onChange={(event) => handleChange('instructions', event.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={saving}>
              {editingId ? t('actions.updatePrescription') : t('actions.savePrescription')}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              {t('actions.cancel')}
            </Button>
          </div>
        </form>
      ) : null}

      {prescriptionsQuery.isLoading ? (
        <ListSkeleton items={2} className="mt-4" />
      ) : prescriptionsQuery.error ? (
        <div className="mt-4">
          <EmptyState
            compact
            tone="error"
            title={t('states.errorTitle')}
            description={getMedicalRecordApiMessage(prescriptionsQuery.error, t('errors.prescriptions'))}
            action={
              <Button
                size="sm"
                variant="outline"
                className="print:hidden"
                onClick={() => prescriptionsQuery.refetch()}
              >
                {t('actions.retry')}
              </Button>
            }
          />
        </div>
      ) : !prescriptions.length ? (
        <div className="mt-4">
          <EmptyState
            compact
            title={t('prescriptions.emptyTitle')}
            description={t('prescriptions.empty')}
            action={
              canManage ? (
                <Button size="sm" className="print:hidden" onClick={handleCreateClick}>
                  {t('actions.addPrescription')}
                </Button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {prescriptions.map((prescription) => {
            const deleting =
              deletePrescription.isPending && deletePrescription.variables?.id === prescription.id;

            return (
              <div
                key={prescription.id}
                className="rounded-2xl border border-border/70 bg-background/70 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{prescription.medicine}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {prescription.dosage} · {prescription.duration}
                    </p>
                  </div>

                  {canManage ? (
                    <div className="flex flex-wrap gap-2 print:hidden">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditClick(prescription)}
                      >
                        {t('actions.edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        loading={deleting}
                        onClick={() => handleDelete(prescription)}
                      >
                        {t('actions.delete')}
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('fields.medicine')}
                    </p>
                    <p className="mt-1 break-words text-sm text-foreground">
                      {prescription.medicine}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('fields.dosage')}
                    </p>
                    <p className="mt-1 break-words text-sm text-foreground">
                      {prescription.dosage}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('fields.duration')}
                    </p>
                    <p className="mt-1 break-words text-sm text-foreground">
                      {prescription.duration}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('fields.instructions')}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">
                      {prescription.instructions?.trim() || t('labels.noInstructions')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
