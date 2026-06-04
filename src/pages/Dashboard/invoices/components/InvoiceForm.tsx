import { useTranslation } from 'react-i18next';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import Textarea from '@/ui/atoms/Textarea';

export type InvoiceFormValues = {
  patientId: string;
  appointmentId: string;
  admissionId: string;
  amount: string;
  invoiceDate: string;
  description: string;
};

type InvoiceFormProps = {
  form: InvoiceFormValues;
  errors: Record<string, string>;
  saving: boolean;
  patients: Array<{ value: string; label: string }>;
  loadingPatients: boolean;
  patientsError?: string;
  submitError?: string;
  onRetryPatients: () => void;
  onChange: (name: keyof InvoiceFormValues, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function InvoiceForm({
  form,
  errors,
  saving,
  patients,
  loadingPatients,
  patientsError,
  submitError,
  onRetryPatients,
  onChange,
  onSubmit,
}: InvoiceFormProps) {
  const { t } = useTranslation('invoices');

  return (
    <Card title={t('form.title')} description={t('form.description')}>
      {patientsError ? (
        <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          <div>{patientsError}</div>
          <Button size="sm" variant="outline" className="mt-3" onClick={onRetryPatients}>
            {t('actions.retry')}
          </Button>
        </div>
      ) : (
        <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <Select
            label={t('fields.patient')}
            name="patientId"
            value={form.patientId}
            error={errors.patientId}
            disabled={saving || loadingPatients}
            onChange={(event) => onChange('patientId', event.target.value)}
          >
            <option value="">
              {loadingPatients ? t('labels.loadingPatients') : t('form.selectPatient')}
            </option>
            {patients.map((patient) => (
              <option key={patient.value} value={patient.value}>
                {patient.label}
              </option>
            ))}
          </Select>

          <Input
            label={t('fields.appointmentId')}
            name="appointmentId"
            value={form.appointmentId}
            error={errors.appointmentId}
            onChange={(event) => onChange('appointmentId', event.target.value)}
          />

          <Input
            label={t('fields.admissionId')}
            name="admissionId"
            value={form.admissionId}
            error={errors.admissionId}
            onChange={(event) => onChange('admissionId', event.target.value)}
          />

          <Input
            label={t('fields.amount')}
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            error={errors.amount}
            onChange={(event) => onChange('amount', event.target.value)}
          />

          <Input
            label={t('fields.date')}
            name="invoiceDate"
            type="date"
            value={form.invoiceDate}
            error={errors.invoiceDate}
            onChange={(event) => onChange('invoiceDate', event.target.value)}
          />

          <div className="hidden md:block" />

          <div className="md:col-span-2">
            <Textarea
              label={t('fields.description')}
              name="description"
              value={form.description}
              error={errors.description}
              onChange={(event) => onChange('description', event.target.value)}
            />
          </div>

          {submitError ? (
            <div className="md:col-span-2 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              {submitError}
            </div>
          ) : null}

          <div className="md:col-span-2">
            <Button type="submit" loading={saving}>
              {t('form.submit')}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
