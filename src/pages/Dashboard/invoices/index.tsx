import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { hasAnyRole } from '@/domain/auth/role.utils';
import {
  useCancelInvoice,
  useCreateInvoice,
  useInvoiceStats,
  useInvoices,
  usePayInvoice,
} from '@/domain/invoices/invoices.hooks';
import { invoiceStatusValues, type Invoice } from '@/domain/invoices/invoices.types';
import {
  getInvoiceApiMessage,
  getInvoiceApiStatus,
  getTodayInvoiceDateValue,
  invoiceDatePattern,
  normalizeInvoiceStatus,
} from '@/domain/invoices/invoices.utils';
import { usePatients } from '@/domain/patients/patients.hooks';
import { getPatientApiMessage, getPatientApiStatus } from '@/domain/patients/patients.utils';
import { formatCurrency } from '@/utils/formatters/currency';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Select from '@/ui/atoms/Select';
import ListSkeleton from '@/ui/molecules/ListSkeleton';
import InvoiceForm, { type InvoiceFormValues } from './components/InvoiceForm';
import InvoiceTable from './components/InvoiceTable';
import InvoiceStateCard from './state-card';

const createEmptyForm = (): InvoiceFormValues => ({
  patientId: '',
  appointmentId: '',
  admissionId: '',
  amount: '',
  invoiceDate: getTodayInvoiceDateValue(),
  description: '',
});

function getPatientLabel(patient: {
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
}) {
  const fullName = [patient.firstName, patient.lastName].filter(Boolean).join(' ').trim();
  return patient.phoneNumber ? `${fullName} (${patient.phoneNumber})` : fullName;
}

function validateForm(values: InvoiceFormValues, t: (key: string) => string) {
  const errors: Record<string, string> = {};
  const amount = Number(values.amount);

  if (!values.patientId.trim()) {
    errors.patientId = t('validation.required');
  }

  if (values.appointmentId.trim() && values.admissionId.trim()) {
    errors.appointmentId = t('validation.singleCareEvent');
    errors.admissionId = t('validation.singleCareEvent');
  }

  if (!values.amount.trim()) {
    errors.amount = t('validation.required');
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = t('validation.amount');
  }

  if (!values.invoiceDate.trim()) {
    errors.invoiceDate = t('validation.required');
  } else if (!invoiceDatePattern.test(values.invoiceDate)) {
    errors.invoiceDate = t('validation.date');
  }

  return errors;
}

export default function InvoicesPage() {
  const { t, i18n } = useTranslation('invoices');
  const [searchParams, setSearchParams] = useSearchParams();
  const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
  const canManageInvoices = hasAnyRole(roles, ['ADMIN', 'ADMINS', 'RECEPTIONIST', 'RECEPTIONISTS']);
  const status = normalizeInvoiceStatus(searchParams.get('status'));
  const invoicesQuery = useInvoices({ status });
  const statsQuery = useInvoiceStats();
  const patientsQuery = usePatients({ page: 1, limit: 100, search: '' });
  const createInvoice = useCreateInvoice();
  const payInvoice = usePayInvoice();
  const cancelInvoice = useCancelInvoice();
  const [form, setForm] = useState<InvoiceFormValues>(createEmptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const invoicesStatus = getInvoiceApiStatus(invoicesQuery.error);
  const statsStatus = getInvoiceApiStatus(statsQuery.error);
  const patientsStatus = getPatientApiStatus(patientsQuery.error);
  const statuses = [invoicesStatus, statsStatus, canManageInvoices ? patientsStatus : undefined];
  const locale = i18n.language === 'de' ? 'de-DE' : 'en-US';
  const hasStatusFilter = !!status;
  const saving = createInvoice.isPending;

  const patientOptions = (patientsQuery.data?.items ?? []).map((patient) => ({
    value: patient.id,
    label: getPatientLabel(patient),
  }));
  const patientsError = canManageInvoices && patientsQuery.error
    ? getPatientApiMessage(patientsQuery.error, t('errors.patients'))
    : '';

  const resetFeedback = () => {
    setActionError('');
    setActionSuccess('');
  };

  const updateStatusFilter = (nextStatus: string | null) => {
    const next = new URLSearchParams(searchParams);

    if (nextStatus && nextStatus.trim()) {
      next.set('status', nextStatus);
    } else {
      next.delete('status');
    }

    setSearchParams(next);
  };

  const handleFormChange = (name: keyof InvoiceFormValues, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  };

  const handleCreateInvoice = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(form, t);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    resetFeedback();

    try {
      await createInvoice.mutateAsync({
        patientId: form.patientId.trim(),
        appointmentId: form.appointmentId.trim() || null,
        admissionId: form.admissionId.trim() || null,
        amount: Number(form.amount),
        invoiceDate: form.invoiceDate,
        description: form.description.trim() || undefined,
      });

      setForm(createEmptyForm());
      setFormError('');
      setActionSuccess(t('messages.created'));
    } catch (error: unknown) {
      setFormError(getInvoiceApiMessage(error, t('errors.save')));
    }
  };

  const handlePayInvoice = async (invoice: Invoice) => {
    if (!window.confirm(t('details.payConfirm'))) {
      return;
    }

    resetFeedback();

    try {
      await payInvoice.mutateAsync(invoice.id);
      setActionSuccess(t('messages.paid'));
    } catch (error: unknown) {
      setActionError(getInvoiceApiMessage(error, t('errors.pay')));
    }
  };

  const handleCancelInvoice = async (invoice: Invoice) => {
    if (!window.confirm(t('details.cancelConfirm'))) {
      return;
    }

    resetFeedback();

    try {
      await cancelInvoice.mutateAsync(invoice.id);
      setActionSuccess(t('messages.cancelled'));
    } catch (error: unknown) {
      setActionError(getInvoiceApiMessage(error, t('errors.cancel')));
    }
  };

  if (statuses.includes(401)) {
    return (
      <InvoiceStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  }

  if (statuses.includes(403)) {
    return (
      <InvoiceStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  }

  let listContent = null;

  if (invoicesQuery.isLoading) {
    listContent = (
      <InvoiceStateCard
        title={t('states.loadingTitle')}
        description={t('states.loadingDescription')}
      />
    );
  } else if (invoicesQuery.error) {
    listContent = (
      <InvoiceStateCard
        title={t('states.errorTitle')}
        description={getInvoiceApiMessage(invoicesQuery.error, t('errors.list'))}
      >
        <Button variant="outline" onClick={() => invoicesQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </InvoiceStateCard>
    );
  } else if (!invoicesQuery.data?.length) {
    listContent = (
      <InvoiceStateCard
        title={hasStatusFilter ? t('states.emptyFilteredTitle') : t('states.emptyTitle')}
        description={
          hasStatusFilter
            ? t('states.emptyFilteredDescription')
            : t('states.emptyDescription')
        }
      >
        {hasStatusFilter ? (
          <Button type="button" variant="outline" onClick={() => updateStatusFilter(null)}>
            {t('actions.clear')}
          </Button>
        ) : null}
      </InvoiceStateCard>
    );
  } else {
    listContent = (
      <InvoiceTable
        invoices={invoicesQuery.data}
        canManage={canManageInvoices}
        payingId={payInvoice.variables}
        cancellingId={cancelInvoice.variables}
        onPay={handlePayInvoice}
        onCancel={handleCancelInvoice}
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{t('list.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('list.description')}</p>
        </div>
      </div>

      <div className={canManageInvoices ? 'grid gap-6 xl:grid-cols-[320px,minmax(0,1fr)]' : 'grid gap-6'}>
        <Card title={t('summary.title')} description={t('summary.description')}>
          {statsQuery.error ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              <div>{getInvoiceApiMessage(statsQuery.error, t('errors.stats'))}</div>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => statsQuery.refetch()}>
                {t('actions.retry')}
              </Button>
            </div>
          ) : statsQuery.isLoading ? (
            <ListSkeleton items={1} />
          ) : (
            <p className="text-3xl font-bold text-foreground">
              {formatCurrency(statsQuery.data?.totalRevenue ?? 0, 'EUR', locale)}
            </p>
          )}
        </Card>

        {canManageInvoices ? (
          <InvoiceForm
            form={form}
            errors={errors}
            saving={saving}
            patients={patientOptions}
            loadingPatients={patientsQuery.isLoading}
            patientsError={patientsError}
            submitError={formError}
            onRetryPatients={() => patientsQuery.refetch()}
            onChange={handleFormChange}
            onSubmit={handleCreateInvoice}
          />
        ) : null}
      </div>

      <Card title={t('filters.title')} description={t('filters.description')}>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,240px),auto] sm:items-end">
          <Select
            label={t('filters.statusLabel')}
            name="status"
            value={status}
            onChange={(event) => updateStatusFilter(event.target.value || null)}
          >
            <option value="">{t('filters.allStatuses')}</option>
            {invoiceStatusValues.map((invoiceStatus) => (
              <option key={invoiceStatus} value={invoiceStatus}>
                {t(`statuses.${invoiceStatus}`)}
              </option>
            ))}
          </Select>

          <div>
            <Button
              type="button"
              variant="outline"
              disabled={!hasStatusFilter}
              onClick={() => updateStatusFilter(null)}
            >
              {t('actions.clear')}
            </Button>
          </div>
        </div>
      </Card>

      <Card title={t('list.resultsTitle')} description={t('list.resultsDescription')}>
        <div className="space-y-4">
          {invoicesQuery.isFetching && !invoicesQuery.isLoading ? (
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
