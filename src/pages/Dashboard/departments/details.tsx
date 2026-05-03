import type { UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useDeleteDepartment,
  useDepartment,
  useDepartmentDoctors,
  useDepartmentRooms,
} from '@/domain/departments/departments.hooks';
import type { DepartmentRelationItem } from '@/domain/departments/departments.types';
import {
  formatDepartmentDate,
  getDepartmentApiMessage,
  getDepartmentApiStatus,
} from '@/domain/departments/departments.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import DepartmentStateCard from './state-card';

function formatFieldLabel(value: string) {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function getItemTitle(item: DepartmentRelationItem, kind: 'doctor' | 'room', index: number) {
  const firstName = typeof item.firstName === 'string' ? item.firstName.trim() : '';
  const lastName = typeof item.lastName === 'string' ? item.lastName.trim() : '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');

  if (fullName) {
    return fullName;
  }

  const titleCandidates = kind === 'doctor'
    ? [item.name, item.fullName, item.email]
    : [item.name, item.roomNumber, item.number, item.code];

  const title = titleCandidates.find((value) => typeof value === 'string' && value.trim());

  if (typeof title === 'string') {
    return title;
  }

  return kind === 'doctor' ? `Doctor ${index + 1}` : `Room ${index + 1}`;
}

function getItemEntries(item: DepartmentRelationItem) {
  return Object.entries(item ?? {}).filter(([key, value]) => {
    if (['id', 'firstName', 'lastName', 'name', 'fullName', 'createdAt', 'updatedAt'].includes(key)) {
      return false;
    }

    if (value === null || value === undefined || value === '') {
      return false;
    }

    if (Array.isArray(value) || typeof value === 'object') {
      return false;
    }

    return true;
  });
}

function SectionState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/45 p-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

export default function DepartmentDetailsPage() {
  const { t, i18n } = useTranslation('departments');
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const departmentQuery = useDepartment(id);
  const doctorsQuery = useDepartmentDoctors(id);
  const roomsQuery = useDepartmentRooms(id);
  const deleteDepartment = useDeleteDepartment();
  const [actionError, setActionError] = useState('');
  const status = getDepartmentApiStatus(departmentQuery.error);
  const department = departmentQuery.data;

  const handleDelete = async () => {
    if (!window.confirm(t('details.deleteConfirm'))) {
      return;
    }

    setActionError('');

    try {
      await deleteDepartment.mutateAsync(id);
      navigate('/app/departments', {
        replace: true,
        state: { success: t('messages.deleted') },
      });
    } catch (error: unknown) {
      setActionError(getDepartmentApiMessage(error, t('errors.delete')));
    }
  };

  const renderRelatedItems = (
    query: UseQueryResult<DepartmentRelationItem[], unknown>,
    kind: 'doctor' | 'room',
    emptyTitle: string,
    emptyDescription: string,
    errorFallback: string
  ) => {
    if (query.isLoading) {
      return (
        <SectionState
          title={kind === 'doctor' ? t('details.loadingDoctorsTitle') : t('details.loadingRoomsTitle')}
          description={
            kind === 'doctor'
              ? t('details.loadingDoctorsDescription')
              : t('details.loadingRoomsDescription')
          }
        />
      );
    }

    if (query.error) {
      return (
        <SectionState
          title={t('states.errorTitle')}
          description={getDepartmentApiMessage(query.error, errorFallback)}
        >
          <Button size="sm" variant="outline" onClick={() => query.refetch()}>
            {t('actions.retry')}
          </Button>
        </SectionState>
      );
    }

    if (!query.data?.length) {
      return <SectionState title={emptyTitle} description={emptyDescription} />;
    }

    return (
      <div className="space-y-3">
        {query.data.map((item: DepartmentRelationItem, index: number) => {
          const entries = getItemEntries(item);
          const itemKey =
            typeof item.id === 'string' || typeof item.id === 'number'
              ? item.id
              : `${kind}-${index}`;

          return (
            <div
              key={itemKey}
              className="rounded-2xl border border-border/70 bg-background/45 p-4"
            >
              <h3 className="text-sm font-semibold text-foreground">{getItemTitle(item, kind, index)}</h3>
              {entries.length ? (
                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  {entries.map(([key, value]) => (
                    <div key={key}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {formatFieldLabel(key)}
                      </p>
                      <p className="mt-1 break-words text-foreground">{String(value)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">{t('labels.noData')}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (departmentQuery.isLoading) {
    return (
      <DepartmentStateCard
        title={t('states.loadingDepartmentTitle')}
        description={t('states.loadingDepartmentDescription')}
      />
    );
  }

  if (status === 401) {
    return (
      <DepartmentStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  }

  if (status === 403) {
    return (
      <DepartmentStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  }

  if (status === 404) {
    return (
      <DepartmentStateCard
        title={t('details.notFoundTitle')}
        description={t('details.notFoundDescription')}
      >
        <Button variant="outline" onClick={() => navigate('/app/departments')}>
          {t('actions.back')}
        </Button>
      </DepartmentStateCard>
    );
  }

  if (departmentQuery.error || !department) {
    return (
      <DepartmentStateCard
        title={t('states.errorTitle')}
        description={getDepartmentApiMessage(departmentQuery.error, t('errors.details'))}
      >
        <Button variant="outline" onClick={() => departmentQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </DepartmentStateCard>
    );
  }

  const fields = [
    { label: t('fields.location'), value: department.location },
    {
      label: t('fields.status'),
      value: department.isActive === false ? t('labels.inactive') : t('labels.active'),
    },
    {
      label: t('fields.createdAt'),
      value: formatDepartmentDate(department.createdAt, i18n.language) || t('labels.notAvailable'),
    },
    {
      label: t('fields.updatedAt'),
      value: formatDepartmentDate(department.updatedAt, i18n.language) || t('labels.notAvailable'),
    },
    {
      label: t('fields.description'),
      value: department.description?.trim() || t('labels.noDescription'),
      full: true,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">{department.name}</h1>
            <Badge variant={department.isActive === false ? 'warning' : 'success'}>
              {department.isActive === false ? t('labels.inactive') : t('labels.active')}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t('details.description')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/app/departments')}>
            {t('actions.back')}
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/app/departments/${department.id}/edit`)}>
            {t('actions.edit')}
          </Button>
          <Button variant="danger" loading={deleteDepartment.isPending} onClick={handleDelete}>
            {t('actions.delete')}
          </Button>
        </div>
      </div>

      <Card title={t('details.title')} description={t('details.description')}>
        {actionError ? (
          <div className="mb-4 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
            {actionError}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className={field.full ? 'md:col-span-2' : undefined}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {field.label}
              </p>
              <p className="mt-1 break-words text-sm text-foreground">{field.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card
          title={t('details.doctorsTitle')}
          description={t('details.relatedCount', { count: doctorsQuery.data?.length ?? 0 })}
          className="h-full"
        >
          {renderRelatedItems(
            doctorsQuery,
            'doctor',
            t('details.noDoctorsTitle'),
            t('details.noDoctorsDescription'),
            t('errors.doctors')
          )}
        </Card>

        <Card
          title={t('details.roomsTitle')}
          description={t('details.relatedCount', { count: roomsQuery.data?.length ?? 0 })}
          className="h-full"
        >
          {renderRelatedItems(
            roomsQuery,
            'room',
            t('details.noRoomsTitle'),
            t('details.noRoomsDescription'),
            t('errors.rooms')
          )}
        </Card>
      </div>
    </section>
  );
}
