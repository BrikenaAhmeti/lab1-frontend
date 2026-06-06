import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDepartments } from '@/domain/departments/departments.hooks';
import { useDeleteNurse, useNurses } from '@/domain/nurses/nurses.hooks';
import {
  getNurseApiMessage,
  getNurseApiStatus,
  getNurseFullName,
  getNurseShiftBadgeVariant,
  isKnownNurseShift,
  normalizeNurseShift,
} from '@/domain/nurses/nurses.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import NurseStateCard from './state-card';

type FilterParams = Partial<{
  search: string | null;
  departmentId: string | null;
  shift: string | null;
}>;

function getDepartmentLabel(name: string, location: string) {
  return location.trim() ? `${name} (${location})` : name;
}

export default function NursesListPage() {
  const { t } = useTranslation('nurses');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search')?.trim() ?? '';
  const departmentId = searchParams.get('departmentId')?.trim() ?? '';
  const shift = normalizeNurseShift(searchParams.get('shift'));
  const nursesQuery = useNurses({ departmentId, search, shift });
  const departmentsQuery = useDepartments();
  const deleteNurse = useDeleteNurse();
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [searchValue, setSearchValue] = useState(search);
  const status = getNurseApiStatus(nursesQuery.error);
  const displayedNurses = nursesQuery.data ?? [];
  const hasFilters = !!search || !!departmentId || !!shift;

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

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({
      search: searchValue.trim() || null,
      departmentId: departmentId || null,
      shift: shift || null,
    });
  };

  const handleClearFilters = () => {
    setSearchValue('');
    updateParams({ search: null, departmentId: null, shift: null });
  };

  const getShiftLabel = (value: string) => {
    const normalized = normalizeNurseShift(value);

    if (isKnownNurseShift(normalized)) {
      return t(`shifts.${normalized}`);
    }

    return value || t('labels.notAvailable');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('details.deleteConfirm'))) {
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      await deleteNurse.mutateAsync(id);
      setActionSuccess(t('messages.deleted'));
    } catch (error: unknown) {
      setActionError(getNurseApiMessage(error, t('errors.delete')));
    }
  };

  let content = null;

  if (nursesQuery.isLoading) {
    content = (
      <NurseStateCard
        title={t('states.loadingTitle')}
        description={t('states.loadingDescription')}
      />
    );
  } else if (status === 401) {
    content = (
      <NurseStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  } else if (status === 403) {
    content = (
      <NurseStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  } else if (nursesQuery.error) {
    content = (
      <NurseStateCard
        title={t('states.errorTitle')}
        description={getNurseApiMessage(nursesQuery.error, t('errors.list'))}
      >
        <Button variant="outline" onClick={() => nursesQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </NurseStateCard>
    );
  } else if (!displayedNurses.length) {
    content = (
      <NurseStateCard
        title={hasFilters ? t('states.emptyFilteredTitle') : t('states.emptyTitle')}
        description={hasFilters ? t('states.emptyFilteredDescription') : t('states.emptyDescription')}
      >
        {hasFilters ? (
          <Button type="button" variant="outline" onClick={handleClearFilters}>
            {t('actions.clear')}
          </Button>
        ) : (
          <Button onClick={() => navigate('/app/nurses/new')}>{t('actions.create')}</Button>
        )}
      </NurseStateCard>
    );
  } else {
    content = (
      <div className="grid gap-4 xl:grid-cols-2">
        {displayedNurses.map((nurse) => (
          <div
            key={nurse.id}
            className="rounded-2xl border border-border/70 bg-background/50 p-5 transition-shadow duration-200 hover:shadow-soft"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-foreground">
                  {getNurseFullName(nurse)}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {nurse.department?.name || t('labels.noDepartment')}
                </p>
              </div>
              <Badge variant={getNurseShiftBadgeVariant(nurse.shift)}>
                {getShiftLabel(nurse.shift)}
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fields.firstName')}
                </p>
                <p className="mt-1 break-words text-foreground">{nurse.firstName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fields.lastName')}
                </p>
                <p className="mt-1 break-words text-foreground">{nurse.lastName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fields.department')}
                </p>
                <p className="mt-1 break-words text-foreground">
                  {nurse.department?.name || t('labels.noDepartment')}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate(`/app/nurses/${nurse.id}`)}>
                {t('actions.view')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/app/nurses/${nurse.id}/edit`)}
              >
                {t('actions.edit')}
              </Button>
              <Button
                size="sm"
                variant="danger"
                loading={deleteNurse.isPending && deleteNurse.variables === nurse.id}
                onClick={() => handleDelete(nurse.id)}
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
        <Button onClick={() => navigate('/app/nurses/new')}>{t('actions.create')}</Button>
      </div>

      <Card title={t('filters.title')} description={t('filters.description')}>
        <div className="space-y-4">
          {departmentsQuery.error ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              <div>{getNurseApiMessage(departmentsQuery.error, t('errors.departments'))}</div>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => departmentsQuery.refetch()}>
                {t('actions.retry')}
              </Button>
            </div>
          ) : null}

          <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr),minmax(0,1fr),220px,auto,auto]" onSubmit={handleSearch}>
            <Input
              name="search"
              label={t('fields.search')}
              value={searchValue}
              placeholder={t('filters.searchPlaceholder')}
              onChange={(event) => setSearchValue(event.target.value)}
            />

            <Select
              name="departmentId"
              label={t('fields.department')}
              value={departmentId}
              disabled={departmentsQuery.isLoading || !!departmentsQuery.error}
              onChange={(event) =>
                updateParams({
                  search: search || null,
                  departmentId: event.target.value || null,
                  shift: shift || null,
                })
              }
            >
              <option value="">
                {departmentsQuery.isLoading ? t('labels.loadingDepartments') : t('filters.allDepartments')}
              </option>
              {(departmentsQuery.data ?? []).map((department) => (
                <option key={department.id} value={department.id}>
                  {getDepartmentLabel(department.name, department.location)}
                </option>
              ))}
            </Select>

            <Select
              name="shift"
              label={t('fields.shift')}
              value={shift}
              onChange={(event) =>
                updateParams({
                  search: search || null,
                  departmentId: departmentId || null,
                  shift: event.target.value || null,
                })
              }
            >
              <option value="">{t('filters.allShifts')}</option>
              <option value="Morning">{t('shifts.Morning')}</option>
              <option value="Evening">{t('shifts.Evening')}</option>
              <option value="Night">{t('shifts.Night')}</option>
            </Select>

            <Button
              type="submit"
              className="lg:self-end"
            >
              {t('actions.search')}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="lg:self-end"
              onClick={handleClearFilters}
            >
              {t('actions.clear')}
            </Button>
          </form>
        </div>
      </Card>

      <Card
        title={t('list.resultsTitle')}
        description={
          nursesQuery.data
            ? t('list.results', { count: displayedNurses.length })
            : t('list.resultsDescription')
        }
      >
        <div className="space-y-4">
          {nursesQuery.isFetching && !nursesQuery.isLoading ? (
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
