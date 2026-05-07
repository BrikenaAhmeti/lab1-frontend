import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isAdminUser } from '@/domain/auth/role.utils';
import { useDepartments } from '@/domain/departments/departments.hooks';
import { useDeleteRoom, useRooms } from '@/domain/rooms/rooms.hooks';
import {
  getRoomApiMessage,
  getRoomApiStatus,
  getRoomStatusBadgeVariant,
  isKnownRoomStatus,
  isKnownRoomType,
  normalizeRoomStatus,
  normalizeRoomType,
} from '@/domain/rooms/rooms.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Select from '@/ui/atoms/Select';
import RoomStateCard from './state-card';

type FilterParams = {
  departmentId: string | null;
  type: string | null;
  availability: string | null;
};

function getDepartmentLabel(name: string, location: string) {
  return location.trim() ? `${name} (${location})` : name;
}

export default function RoomsListPage() {
  const { t } = useTranslation('rooms');
  const navigate = useNavigate();
  const location = useLocation();
  const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
  const isAdmin = isAdminUser(roles);
  const [searchParams, setSearchParams] = useSearchParams();
  const departmentId = searchParams.get('departmentId')?.trim() ?? '';
  const type = normalizeRoomType(searchParams.get('type'));
  const availability = searchParams.get('availability')?.trim().toLowerCase() ?? '';
  const onlyAvailable = availability === 'available';
  const roomsQuery = useRooms({
    departmentId,
    type,
    onlyAvailable,
  });
  const departmentsQuery = useDepartments();
  const deleteRoom = useDeleteRoom();
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const status = getRoomApiStatus(roomsQuery.error);
  const hasFilters = !!departmentId || !!type || onlyAvailable;

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

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('details.deleteConfirm'))) {
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      await deleteRoom.mutateAsync(id);
      setActionSuccess(t('messages.deleted'));
    } catch (error: unknown) {
      setActionError(getRoomApiMessage(error, t('errors.delete')));
    }
  };

  const getTypeLabel = (value: string) => {
    const normalized = normalizeRoomType(value);
    return isKnownRoomType(normalized) ? t(`types.${normalized}`) : value || t('labels.notAvailable');
  };

  const getStatusLabel = (value: string) => {
    const normalized = normalizeRoomStatus(value);
    return isKnownRoomStatus(normalized)
      ? t(`statuses.${normalized}`)
      : value || t('labels.notAvailable');
  };

  let content = null;

  if (roomsQuery.isLoading) {
    content = (
      <RoomStateCard
        title={t('states.loadingTitle')}
        description={t('states.loadingDescription')}
      />
    );
  } else if (status === 401) {
    content = (
      <RoomStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  } else if (status === 403) {
    content = (
      <RoomStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  } else if (roomsQuery.error) {
    content = (
      <RoomStateCard
        title={t('states.errorTitle')}
        description={getRoomApiMessage(roomsQuery.error, t('errors.list'))}
      >
        <Button variant="outline" onClick={() => roomsQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </RoomStateCard>
    );
  } else if (!roomsQuery.data?.length) {
    content = (
      <RoomStateCard
        title={hasFilters ? t('states.emptyFilteredTitle') : t('states.emptyTitle')}
        description={
          hasFilters ? t('states.emptyFilteredDescription') : t('states.emptyDescription')
        }
      >
        {hasFilters ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => updateParams({ departmentId: null, type: null, availability: null })}
          >
            {t('actions.clear')}
          </Button>
        ) : isAdmin ? (
          <Button onClick={() => navigate('/app/rooms/new')}>{t('actions.create')}</Button>
        ) : null}
      </RoomStateCard>
    );
  } else {
    content = (
      <div className="grid gap-4 xl:grid-cols-2">
        {roomsQuery.data.map((room) => (
          <div
            key={room.id}
            className="rounded-2xl border border-border/70 bg-background/50 p-5 transition-shadow duration-200 hover:shadow-soft"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-foreground">
                  {room.roomNumber}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {room.department?.name || t('labels.noDepartment')}
                </p>
              </div>
              <Badge variant={getRoomStatusBadgeVariant(room.status)}>
                {getStatusLabel(room.status)}
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fields.department')}
                </p>
                <p className="mt-1 break-words text-foreground">
                  {room.department?.name || t('labels.noDepartment')}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fields.type')}
                </p>
                <p className="mt-1 break-words text-foreground">{getTypeLabel(room.type)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fields.capacity')}
                </p>
                <p className="mt-1 break-words text-foreground">{room.capacity}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fields.activeAdmissionsCount')}
                </p>
                <p className="mt-1 break-words text-foreground">{room.activeAdmissionsCount}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fields.occupiedSummary')}
                </p>
                <p className="mt-1 break-words text-foreground">
                  {t('labels.occupiedSummary', {
                    occupied: room.activeAdmissionsCount,
                    capacity: room.capacity,
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fields.availableCapacity')}
                </p>
                <p className="mt-1 break-words text-foreground">
                  {t('labels.availableSummary', { count: room.availableCapacity })}
                </p>
              </div>
            </div>

            {isAdmin ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/app/rooms/${room.id}`)}
                >
                  {t('actions.view')}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/app/rooms/${room.id}/edit`)}
                >
                  {t('actions.edit')}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  loading={deleteRoom.isPending && deleteRoom.variables === room.id}
                  onClick={() => handleDelete(room.id)}
                >
                  {t('actions.delete')}
                </Button>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/app/rooms/${room.id}`)}
                >
                  {t('actions.view')}
                </Button>
              </div>
            )}
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
        {isAdmin ? <Button onClick={() => navigate('/app/rooms/new')}>{t('actions.create')}</Button> : null}
      </div>

      <Card title={t('filters.title')} description={t('filters.description')}>
        <div className="space-y-4">
          {departmentsQuery.error ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              <div>{getRoomApiMessage(departmentsQuery.error, t('errors.departments'))}</div>
              <Button
                size="sm"
                variant="outline"
                className="mt-3"
                onClick={() => departmentsQuery.refetch()}
              >
                {t('actions.retry')}
              </Button>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={onlyAvailable ? 'outline' : 'secondary'}
              onClick={() =>
                updateParams({
                  departmentId: departmentId || null,
                  type: type || null,
                  availability: null,
                })
              }
            >
              {t('actions.showAll')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={onlyAvailable ? 'secondary' : 'outline'}
              onClick={() =>
                updateParams({
                  departmentId: departmentId || null,
                  type: type || null,
                  availability: 'available',
                })
              }
            >
              {t('actions.showAvailable')}
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),220px,auto]">
            <Select
              name="departmentId"
              label={t('fields.department')}
              value={departmentId}
              disabled={departmentsQuery.isLoading || !!departmentsQuery.error}
              onChange={(event) =>
                updateParams({
                  departmentId: event.target.value || null,
                  type: type || null,
                  availability: onlyAvailable ? 'available' : null,
                })
              }
            >
              <option value="">
                {departmentsQuery.isLoading
                  ? t('labels.loadingDepartments')
                  : t('filters.allDepartments')}
              </option>
              {(departmentsQuery.data ?? []).map((department) => (
                <option key={department.id} value={department.id}>
                  {getDepartmentLabel(department.name, department.location)}
                </option>
              ))}
            </Select>

            <Select
              name="type"
              label={t('fields.type')}
              value={type}
              onChange={(event) =>
                updateParams({
                  departmentId: departmentId || null,
                  type: event.target.value || null,
                  availability: onlyAvailable ? 'available' : null,
                })
              }
            >
              <option value="">{t('filters.allTypes')}</option>
              <option value="GENERAL">{t('types.GENERAL')}</option>
              <option value="ICU">{t('types.ICU')}</option>
              <option value="SURGERY">{t('types.SURGERY')}</option>
              <option value="EMERGENCY">{t('types.EMERGENCY')}</option>
              <option value="PEDIATRIC">{t('types.PEDIATRIC')}</option>
            </Select>

            <Button
              type="button"
              variant="outline"
              className="md:self-end"
              onClick={() => updateParams({ departmentId: null, type: null, availability: null })}
            >
              {t('actions.clear')}
            </Button>
          </div>
        </div>
      </Card>

      <Card
        title={t('list.resultsTitle')}
        description={
          roomsQuery.data
            ? t('list.results', { count: roomsQuery.data.length })
            : t('list.resultsDescription')
        }
      >
        <div className="space-y-4">
          {roomsQuery.isFetching && !roomsQuery.isLoading ? (
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
