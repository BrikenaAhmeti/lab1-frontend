import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDeleteDepartment, useDepartments } from '@/domain/departments/departments.hooks';
import {
  formatDepartmentDate,
  getDepartmentApiMessage,
  getDepartmentApiStatus,
} from '@/domain/departments/departments.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import DepartmentStateCard from './state-card';

export default function DepartmentsListPage() {
  const { t, i18n } = useTranslation('departments');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q')?.trim() ?? '';
  const departmentsQuery = useDepartments();
  const deleteDepartment = useDeleteDepartment();
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [searchValue, setSearchValue] = useState(search);
  const status = getDepartmentApiStatus(departmentsQuery.error);

  useEffect(() => {
    const successMessage = (location.state as { success?: string } | null)?.success;

    if (typeof successMessage !== 'string' || !successMessage.trim()) {
      return;
    }

    setActionSuccess(successMessage);
    navigate(
      { pathname: location.pathname, search: location.search },
      { replace: true, state: null }
    );
  }, [location.pathname, location.search, location.state, navigate]);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  const displayedDepartments = useMemo(() => {
    const departments = departmentsQuery.data ?? [];
    const normalizedSearch = search.toLowerCase();

    if (!normalizedSearch) {
      return departments;
    }

    return departments.filter((department) =>
      [department.name, department.location, department.description ?? ''].some((value) =>
        value.toLowerCase().includes(normalizedSearch)
      )
    );
  }, [departmentsQuery.data, search]);

  const updateSearch = (value: string | null) => {
    const next = new URLSearchParams(searchParams);
    const normalizedValue = value?.trim() ?? '';

    if (normalizedValue) {
      next.set('q', normalizedValue);
    } else {
      next.delete('q');
    }

    setSearchParams(next);
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateSearch(searchValue);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    updateSearch(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('details.deleteConfirm'))) {
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      await deleteDepartment.mutateAsync(id);
      setActionSuccess(t('messages.deleted'));
    } catch (error: unknown) {
      setActionError(getDepartmentApiMessage(error, t('errors.delete')));
    }
  };

  let content = null;

  if (departmentsQuery.isLoading) {
    content = (
      <DepartmentStateCard
        title={t('states.loadingTitle')}
        description={t('states.loadingDescription')}
      />
    );
  } else if (status === 401) {
    content = (
      <DepartmentStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  } else if (status === 403) {
    content = (
      <DepartmentStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  } else if (departmentsQuery.error) {
    content = (
      <DepartmentStateCard
        title={t('states.errorTitle')}
        description={getDepartmentApiMessage(departmentsQuery.error, t('errors.list'))}
      >
        <Button variant="outline" onClick={() => departmentsQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </DepartmentStateCard>
    );
  } else if (!departmentsQuery.data?.length) {
    content = (
      <DepartmentStateCard
        title={t('states.emptyTitle')}
        description={t('states.emptyDescription')}
      >
        <Button onClick={() => navigate('/app/departments/new')}>{t('actions.create')}</Button>
      </DepartmentStateCard>
    );
  } else if (!displayedDepartments.length) {
    content = (
      <DepartmentStateCard
        title={t('states.emptyFilteredTitle')}
        description={t('states.emptyFilteredDescription')}
      >
        <Button type="button" variant="outline" onClick={handleClearSearch}>
          {t('actions.clear')}
        </Button>
      </DepartmentStateCard>
    );
  } else {
    content = (
      <div className="grid gap-4 xl:grid-cols-2">
        {displayedDepartments.map((department) => (
          <div
            key={department.id}
            className="rounded-2xl border border-border/70 bg-background/50 p-5 transition-shadow duration-200 hover:shadow-soft"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-foreground">{department.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{department.location}</p>
              </div>
              <Badge variant={department.isActive === false ? 'warning' : 'success'}>
                {department.isActive === false ? t('labels.inactive') : t('labels.active')}
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <div className="md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fields.description')}
                </p>
                <p className="mt-1 break-words text-foreground">
                  {department.description?.trim() || t('labels.noDescription')}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fields.createdAt')}
                </p>
                <p className="mt-1 text-foreground">
                  {formatDepartmentDate(department.createdAt, i18n.language) || t('labels.notAvailable')}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fields.updatedAt')}
                </p>
                <p className="mt-1 text-foreground">
                  {formatDepartmentDate(department.updatedAt, i18n.language) || t('labels.notAvailable')}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/app/departments/${department.id}`)}
              >
                {t('actions.view')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/app/departments/${department.id}/edit`)}
              >
                {t('actions.edit')}
              </Button>
              <Button
                size="sm"
                variant="danger"
                loading={deleteDepartment.isPending && deleteDepartment.variables === department.id}
                onClick={() => handleDelete(department.id)}
              >
                {t('actions.delete')}
              </Button>
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
        <Button onClick={() => navigate('/app/departments/new')}>{t('actions.create')}</Button>
      </div>

      <Card title={t('filters.title')} description={t('filters.description')}>
        <form
          className="grid gap-3 md:grid-cols-[minmax(0,1fr),auto,auto]"
          onSubmit={handleSearch}
        >
          <Input
            label={t('fields.search')}
            name="q"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={t('filters.searchPlaceholder')}
          />

          <Button type="submit" className="md:self-end">
            {t('actions.search')}
          </Button>

          <Button type="button" variant="outline" className="md:self-end" onClick={handleClearSearch}>
            {t('actions.clear')}
          </Button>
        </form>
      </Card>

      <Card
        title={t('list.resultsTitle')}
        description={
          departmentsQuery.data
            ? t('list.results', { count: displayedDepartments.length })
            : t('list.resultsDescription')
        }
      >
        <div className="space-y-4">
          {departmentsQuery.isFetching && !departmentsQuery.isLoading ? (
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
