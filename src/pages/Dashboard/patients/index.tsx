import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { useDeletePatient, usePatients } from '@/domain/patients/patients.hooks';
import {
  formatPatientDate,
  getPatientApiMessage,
  getPatientApiStatus,
  patientPageSizes,
} from '@/domain/patients/patients.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import PatientStateCard from './state-card';

function getPositiveNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getLimitNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  return patientPageSizes.includes(parsed) ? parsed : fallback;
}

function getIsAdmin(roles: string[]) {
  const storedRole = localStorage.getItem('role');
  const allRoles = [...roles, ...(storedRole ? [storedRole] : [])].map((role) => role.toUpperCase());
  return allRoles.includes('ADMIN') || allRoles.includes('ADMINS');
}

export default function PatientsListPage() {
  const { t, i18n } = useTranslation('patients');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
  const isAdmin = getIsAdmin(roles);
  const page = getPositiveNumber(searchParams.get('page'), 1);
  const limit = getLimitNumber(searchParams.get('limit'), 10);
  const search = searchParams.get('search')?.trim() ?? '';
  const [searchValue, setSearchValue] = useState(search);
  const [actionError, setActionError] = useState('');
  const patientsQuery = usePatients({ page, limit, search });
  const deletePatient = useDeletePatient();

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  useEffect(() => {
    if (!patientsQuery.data) {
      return;
    }

    if (patientsQuery.data.totalPages > 0 && page > patientsQuery.data.totalPages) {
      const next = new URLSearchParams(searchParams);
      next.set('page', String(patientsQuery.data.totalPages));
      setSearchParams(next);
    }
  }, [page, patientsQuery.data, searchParams, setSearchParams]);

  const status = getPatientApiStatus(patientsQuery.error);

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
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({
      search: searchValue.trim() || null,
      page: '1',
      limit: String(limit),
    });
  };

  const handleClear = () => {
    setSearchValue('');
    updateParams({
      search: null,
      page: '1',
      limit: String(limit),
    });
  };

  const handleLimitChange = (value: string) => {
    updateParams({
      search: search || null,
      page: '1',
      limit: value,
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('details.deleteConfirm'))) {
      return;
    }

    setActionError('');

    try {
      const shouldGoBack = patientsQuery.data?.items.length === 1 && page > 1;
      await deletePatient.mutateAsync(id);

      if (shouldGoBack) {
        updateParams({
          search: search || null,
          page: String(page - 1),
          limit: String(limit),
        });
      }
    } catch (error: unknown) {
      setActionError(getPatientApiMessage(error, t('errors.delete')));
    }
  };

  let content = null;

  if (patientsQuery.isLoading) {
    content = (
      <PatientStateCard
        title={t('states.loadingTitle')}
        description={t('states.loadingDescription')}
      />
    );
  } else if (status === 401) {
    content = (
      <PatientStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  } else if (status === 403) {
    content = (
      <PatientStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  } else if (patientsQuery.error) {
    content = (
      <PatientStateCard
        title={t('states.errorTitle')}
        description={getPatientApiMessage(patientsQuery.error, t('errors.list'))}
      >
        <Button variant="outline" onClick={() => patientsQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </PatientStateCard>
    );
  } else if (!patientsQuery.data?.items.length) {
    content = (
      <PatientStateCard
        title={t('states.emptyTitle')}
        description={t('states.emptyDescription')}
      />
    );
  } else {
    content = (
      <div className="space-y-3">
        {patientsQuery.data.items.map((patient) => (
          <div
            key={patient.id}
            className="rounded-2xl border border-border/70 bg-background/50 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-foreground">
                  {patient.firstName} {patient.lastName}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatPatientDate(patient.dateOfBirth, i18n.language)} · {t(`genders.${patient.gender}`)}
                </p>
              </div>
              <Badge>{patient.bloodType}</Badge>
            </div>

            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fields.phoneNumber')}
                </p>
                <p className="mt-1 break-words text-foreground">{patient.phoneNumber}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fields.address')}
                </p>
                <p className="mt-1 break-words text-foreground">{patient.address}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/app/patients/${patient.id}`)}
              >
                {t('actions.view')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/app/patients/${patient.id}/edit`)}
              >
                {t('actions.edit')}
              </Button>
              {isAdmin ? (
                <Button
                  size="sm"
                  variant="danger"
                  loading={deletePatient.isPending && deletePatient.variables === patient.id}
                  onClick={() => handleDelete(patient.id)}
                >
                  {t('actions.delete')}
                </Button>
              ) : null}
            </div>
          </div>
        ))}
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
        <Button onClick={() => navigate('/app/patients/new')}>{t('actions.create')}</Button>
      </div>

      <Card title={t('list.filtersTitle')} description={t('list.filtersDescription')}>
        <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr),180px,auto,auto]" onSubmit={handleSearch}>
          <Input
            label={t('fields.search')}
            name="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={t('list.searchPlaceholder')}
          />
          <Select
            label={t('labels.limit')}
            name="limit"
            value={String(limit)}
            onChange={(event) => handleLimitChange(event.target.value)}
          >
            {patientPageSizes.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
          <Button type="submit" className="lg:self-end">
            {t('actions.search')}
          </Button>
          <Button type="button" variant="outline" className="lg:self-end" onClick={handleClear}>
            {t('actions.clear')}
          </Button>
        </form>
      </Card>

      <Card
        title={t('list.resultsTitle')}
        description={
          patientsQuery.data
            ? t('list.results', {
                count: patientsQuery.data.items.length,
                total: patientsQuery.data.total,
              })
            : t('list.resultsDescription')
        }
        footer={
          patientsQuery.data ? (
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                {t('list.page', {
                  page: patientsQuery.data.page,
                  totalPages: Math.max(patientsQuery.data.totalPages, 1),
                })}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1 || patientsQuery.isFetching}
                  onClick={() =>
                    updateParams({
                      search: search || null,
                      page: String(page - 1),
                      limit: String(limit),
                    })
                  }
                >
                  {t('actions.previous')}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    patientsQuery.data.totalPages === 0 ||
                    page >= patientsQuery.data.totalPages ||
                    patientsQuery.isFetching
                  }
                  onClick={() =>
                    updateParams({
                      search: search || null,
                      page: String(page + 1),
                      limit: String(limit),
                    })
                  }
                >
                  {t('actions.next')}
                </Button>
              </div>
            </div>
          ) : null
        }
      >
        <div className="space-y-4">
          {patientsQuery.isFetching && !patientsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t('list.refreshing')}</p>
          ) : null}
          {actionError ? <p className="text-sm text-danger">{actionError}</p> : null}
          {content}
        </div>
      </Card>
    </section>
  );
}
