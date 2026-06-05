import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { useAdmissions } from '@/domain/admissions/admissions.hooks';
import {
  getAdmissionApiMessage,
  getAdmissionStatusVariant,
} from '@/domain/admissions/admissions.utils';
import { isAdminUser } from '@/domain/auth/role.utils';
import { useRoom } from '@/domain/rooms/rooms.hooks';
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
import RoomStateCard from './state-card';

function getPatientName(patient?: { firstName?: string; lastName?: string } | null) {
  const firstName = typeof patient?.firstName === 'string' ? patient.firstName.trim() : '';
  const lastName = typeof patient?.lastName === 'string' ? patient.lastName.trim() : '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

  return fullName || '';
}

function getAdmissionDateValue(admission: {
  admissionDate?: string;
  admittedAt?: string;
  createdAt?: string;
}) {
  return admission.admissionDate || admission.admittedAt || admission.createdAt || '';
}

function formatAdmissionDate(value: string | undefined, language: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
  }).format(date);
}

export default function RoomDetailsPage() {
  const { t, i18n } = useTranslation('rooms');
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
  const isAdmin = isAdminUser(roles);
  const roomQuery = useRoom(id);
  const admissionsQuery = useAdmissions({ status: 'ACTIVE', roomId: id });
  const status = getRoomApiStatus(roomQuery.error);
  const room = roomQuery.data;

  if (roomQuery.isLoading) {
    return (
      <RoomStateCard
        title={t('states.loadingRoomTitle')}
        description={t('states.loadingRoomDescription')}
      />
    );
  }

  if (status === 401) {
    return (
      <RoomStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  }

  if (status === 403) {
    return (
      <RoomStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  }

  if (status === 404) {
    return (
      <RoomStateCard
        title={t('details.notFoundTitle')}
        description={t('details.notFoundDescription')}
      >
        <Button variant="outline" onClick={() => navigate('/app/rooms')}>
          {t('actions.back')}
        </Button>
      </RoomStateCard>
    );
  }

  if (roomQuery.error || !room) {
    return (
      <RoomStateCard
        title={t('states.errorTitle')}
        description={getRoomApiMessage(roomQuery.error, t('errors.details'))}
      >
        <Button variant="outline" onClick={() => roomQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </RoomStateCard>
    );
  }

  const normalizedType = normalizeRoomType(room.type);
  const normalizedStatus = normalizeRoomStatus(room.status);
  const roomAdmissions = admissionsQuery.data?.filter((admission) =>
    admission.roomId === room.id || admission.room?.id === room.id
  );
  const currentAdmissions = roomAdmissions ?? room.currentAdmissions ?? [];
  const hasEmbeddedAdmissions = Boolean(room.currentAdmissions?.length);
  const showAdmissionsLoading = admissionsQuery.isLoading && !hasEmbeddedAdmissions;
  const showAdmissionsError = Boolean(admissionsQuery.error && !hasEmbeddedAdmissions);
  const showAdmissionsFallbackNotice = Boolean(admissionsQuery.error && hasEmbeddedAdmissions);
  const fields = [
    { label: t('fields.department'), value: room.department?.name || t('labels.noDepartment') },
    {
      label: t('fields.departmentLocation'),
      value: room.department?.location || t('labels.notAvailable'),
    },
    {
      label: t('fields.type'),
      value: isKnownRoomType(normalizedType)
        ? t(`types.${normalizedType}`)
        : room.type || t('labels.notAvailable'),
    },
    { label: t('fields.capacity'), value: String(room.capacity) },
    {
      label: t('fields.occupiedSummary'),
      value: t('labels.occupiedSummary', {
        occupied: room.activeAdmissionsCount,
        capacity: room.capacity,
      }),
    },
    {
      label: t('fields.availableCapacity'),
      value: t('labels.availableSummary', { count: room.availableCapacity }),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              {room.roomNumber}
            </h1>
            <Badge variant={getRoomStatusBadgeVariant(room.status)}>
              {isKnownRoomStatus(normalizedStatus)
                ? t(`statuses.${normalizedStatus}`)
                : room.status || t('labels.notAvailable')}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t('details.description')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/app/rooms')}>
            {t('actions.back')}
          </Button>
          {room.departmentId ? (
            <Button
              variant="ghost"
              onClick={() => navigate(`/app/departments/${room.departmentId}`)}
            >
              {t('actions.viewDepartment')}
            </Button>
          ) : null}
          {isAdmin ? (
            <Button variant="secondary" onClick={() => navigate(`/app/rooms/${room.id}/edit`)}>
              {t('actions.edit')}
            </Button>
          ) : null}
        </div>
      </div>

      <Card title={t('details.title')} description={t('details.description')}>
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {field.label}
              </p>
              <p className="mt-1 break-words text-sm text-foreground">{field.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title={t('details.currentAdmissionsTitle')}
        description={t('details.currentAdmissionsDescription', { count: currentAdmissions.length })}
      >
        {showAdmissionsLoading ? (
          <div className="rounded-2xl border border-border/70 bg-background/45 px-4 py-5">
            <p className="text-sm font-semibold text-foreground">
              {t('details.loadingAdmissionsTitle')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('details.loadingAdmissionsDescription')}
            </p>
          </div>
        ) : showAdmissionsError ? (
          <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-5">
            <p className="text-sm font-semibold text-danger">{t('states.errorTitle')}</p>
            <p className="mt-1 text-sm text-danger">
              {getAdmissionApiMessage(admissionsQuery.error, t('errors.currentAdmissions'))}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => admissionsQuery.refetch()}
            >
              {t('actions.retry')}
            </Button>
          </div>
        ) : !currentAdmissions.length ? (
          <div className="rounded-2xl border border-border/70 bg-background/45 px-4 py-5">
            <p className="text-sm font-semibold text-foreground">
              {t('details.noAdmissionsTitle')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('details.noAdmissionsDescription')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {showAdmissionsFallbackNotice ? (
              <div className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-warning">
                {getAdmissionApiMessage(admissionsQuery.error, t('errors.currentAdmissions'))}
              </div>
            ) : null}
            {currentAdmissions.map((admission) => {
              const patientName = getPatientName(admission.patient) || t('labels.notAvailable');
              const admissionDate = formatAdmissionDate(
                getAdmissionDateValue(admission),
                i18n.language
              ) || t('labels.notAvailable');
              const admissionStatus = normalizeRoomStatus(admission.status);
              const patientId = typeof admission.patient?.id === 'string' && admission.patient.id.trim()
                ? admission.patient.id
                : typeof admission.patientId === 'string'
                  ? admission.patientId
                  : '';

              return (
                <div
                  key={admission.id}
                  className="rounded-2xl border border-border/70 bg-background/45 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{patientName}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t('fields.admissionDate')}: {admissionDate}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Badge variant={getAdmissionStatusVariant(admission.status || '')}>
                        {isKnownRoomStatus(admissionStatus)
                          ? t(`statuses.${admissionStatus}`)
                          : admission.status || t('labels.notAvailable')}
                      </Badge>
                      {patientId ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/app/patients/${patientId}`)}
                        >
                          {t('actions.viewPatient')}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </section>
  );
}
