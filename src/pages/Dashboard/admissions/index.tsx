import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useAdmissions,
  useCreateAdmission,
  useDischargeAdmission,
} from '@/domain/admissions/admissions.hooks';
import {
  admissionDatePattern,
  formatAdmissionDate,
  getAdmissionApiMessage,
  getAdmissionApiStatus,
  getAdmissionDateValue,
  getAdmissionPatientName,
  getAdmissionRoomLabel,
  getAdmissionStatusVariant,
  isKnownAdmissionStatus,
  normalizeAdmissionStatus,
} from '@/domain/admissions/admissions.utils';
import { getPatientApiStatus } from '@/domain/patients/patients.utils';
import { usePatients } from '@/domain/patients/patients.hooks';
import {
  getRoomApiMessage,
  getRoomApiStatus,
  normalizeRoomStatus,
} from '@/domain/rooms/rooms.utils';
import { useRooms } from '@/domain/rooms/rooms.hooks';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import DateRangePicker from '@/ui/molecules/DateRangePicker';
import AdmissionStateCard from './state-card';

type FilterParams = {
  status?: string | null;
  date?: string | null;
  from?: string | null;
  to?: string | null;
};

type AdmissionFormValues = {
  patientId: string;
  roomId: string;
  admissionDate: string;
};

const emptyForm: AdmissionFormValues = {
  patientId: '',
  roomId: '',
  admissionDate: '',
};

function validateForm(values: AdmissionFormValues, t: (key: string) => string) {
  const errors: Record<string, string> = {};

  if (!values.patientId.trim()) errors.patientId = t('validation.required');
  if (!values.roomId.trim()) errors.roomId = t('validation.required');

  if (values.admissionDate && !admissionDatePattern.test(values.admissionDate)) {
    errors.admissionDate = t('validation.date');
  }

  return errors;
}

function getDepartmentLabel(name: string, location: string) {
  return location.trim() ? `${name} (${location})` : name;
}

export default function AdmissionsPage() {
  const { t, i18n } = useTranslation('admissions');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = normalizeAdmissionStatus(searchParams.get('status'));
  const date = searchParams.get('date')?.trim() ?? '';
  const from = searchParams.get('from')?.trim() ?? '';
  const to = searchParams.get('to')?.trim() ?? '';
  const [patientSearch, setPatientSearch] = useState('');
  const [form, setForm] = useState<AdmissionFormValues>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const admissionsParams = {
    ...(status ? { status } : {}),
    ...(date ? { date } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  };
  const admissionsQuery = useAdmissions(admissionsParams);
  const patientsQuery = usePatients({ page: 1, limit: 50, search: patientSearch });
  const roomsQuery = useRooms();
  const createAdmission = useCreateAdmission();
  const dischargeAdmission = useDischargeAdmission();
  const admissionsStatus = getAdmissionApiStatus(admissionsQuery.error);
  const patientsStatus = getPatientApiStatus(patientsQuery.error);
  const roomsStatus = getRoomApiStatus(roomsQuery.error);
  const saving = createAdmission.isPending;
  const statuses = [admissionsStatus, patientsStatus, roomsStatus];
  const hasFilters = !!status || !!date || !!from || !!to;

  useEffect(() => {
    if (!form.roomId || !roomsQuery.data?.some((room) => room.id === form.roomId)) {
      return;
    }

    const selectedRoom = roomsQuery.data.find((room) => room.id === form.roomId);

    if (!selectedRoom) {
      return;
    }

    const isUnavailable =
      normalizeRoomStatus(selectedRoom.status) === 'UNDER_MAINTENANCE'
      || selectedRoom.availableCapacity <= 0;

    if (!isUnavailable) {
      return;
    }

    setForm((current) => ({ ...current, roomId: '' }));
  }, [form.roomId, roomsQuery.data]);

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

  const handleChange = (name: keyof AdmissionFormValues, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(form, t);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      await createAdmission.mutateAsync({
        patientId: form.patientId.trim(),
        roomId: form.roomId.trim(),
        admissionDate: form.admissionDate || undefined,
      });

      setForm(emptyForm);
      setPatientSearch('');
      setFormError('');
      setActionSuccess(t('messages.created'));
    } catch (error: unknown) {
      setFormError(getAdmissionApiMessage(error, t('errors.save')));
    }
  };

  const handleDischarge = async (id: string) => {
    if (!window.confirm(t('details.dischargeConfirm'))) {
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      await dischargeAdmission.mutateAsync(id);
      setActionSuccess(t('messages.discharged'));
    } catch (error: unknown) {
      setActionError(getAdmissionApiMessage(error, t('errors.discharge')));
    }
  };

  if (statuses.includes(401)) {
    return (
      <AdmissionStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  }

  if (statuses.includes(403)) {
    return (
      <AdmissionStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  }

  const patientOptions = (patientsQuery.data?.items ?? []).map((patient) => ({
    value: patient.id,
    label: patient.phoneNumber
      ? `${patient.firstName} ${patient.lastName} (${patient.phoneNumber})`
      : `${patient.firstName} ${patient.lastName}`,
  }));

  const roomOptions = (roomsQuery.data ?? []).map((room) => {
    const departmentLabel = room.department
      ? getDepartmentLabel(room.department.name, room.department.location)
      : t('labels.noDepartment');
    const normalizedStatus = normalizeRoomStatus(room.status);
    const isMaintenance = normalizedStatus === 'UNDER_MAINTENANCE';
    const isFull = room.availableCapacity <= 0;
    const disabled = isMaintenance || isFull;
    let availabilityLabel = t('labels.roomAvailability', {
      available: room.availableCapacity,
      capacity: room.capacity,
    });

    if (isMaintenance) {
      availabilityLabel = t('labels.roomMaintenance');
    } else if (isFull) {
      availabilityLabel = t('labels.roomFull');
    }

    return {
      value: room.id,
      label: `${room.roomNumber} · ${departmentLabel} · ${availabilityLabel}`,
      disabled,
    };
  });

  const hasSelectableRooms = roomOptions.some((option) => !option.disabled);

  let listContent = null;

  if (admissionsQuery.isLoading) {
    listContent = (
      <AdmissionStateCard
        title={t('states.loadingTitle')}
        description={t('states.loadingDescription')}
      />
    );
  } else if (admissionsQuery.error) {
    listContent = (
      <AdmissionStateCard
        title={t('states.errorTitle')}
        description={getAdmissionApiMessage(admissionsQuery.error, t('errors.list'))}
      >
        <Button variant="outline" onClick={() => admissionsQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </AdmissionStateCard>
    );
  } else if (!admissionsQuery.data?.length) {
    listContent = (
      <AdmissionStateCard
        title={hasFilters ? t('states.emptyFilteredTitle') : t('states.emptyTitle')}
        description={
          hasFilters
            ? t('states.emptyFilteredDescription')
            : t('states.emptyDescription')
        }
      >
        {hasFilters ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => updateParams({ status: null, date: null, from: null, to: null })}
          >
            {t('actions.clear')}
          </Button>
        ) : null}
      </AdmissionStateCard>
    );
  } else {
    listContent = (
      <div className="grid gap-4 xl:grid-cols-2">
        {admissionsQuery.data.map((admission) => {
          const patientName =
            getAdmissionPatientName(admission.patient) || t('labels.notAvailable');
          const roomLabel = getAdmissionRoomLabel(admission.room) || t('labels.notAvailable');
          const admissionDate = formatAdmissionDate(
            getAdmissionDateValue(admission),
            i18n.language
          ) || t('labels.notAvailable');
          const normalizedStatus = normalizeAdmissionStatus(admission.status);
          const isActive = normalizedStatus === 'ACTIVE';

          return (
            <div
              key={admission.id}
              className="rounded-2xl border border-border/70 bg-background/50 p-5 transition-shadow duration-200 hover:shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-foreground">
                    {patientName}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{roomLabel}</p>
                </div>
                <Badge variant={getAdmissionStatusVariant(admission.status)}>
                  {isKnownAdmissionStatus(normalizedStatus)
                    ? t(`statuses.${normalizedStatus}`)
                    : admission.status || t('labels.notAvailable')}
                </Badge>
              </div>

              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('fields.patientName')}
                  </p>
                  <p className="mt-1 break-words text-foreground">{patientName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('fields.room')}
                  </p>
                  <p className="mt-1 break-words text-foreground">{roomLabel}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('fields.admissionDate')}
                  </p>
                  <p className="mt-1 break-words text-foreground">{admissionDate}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('fields.status')}
                  </p>
                  <p className="mt-1 break-words text-foreground">
                    {isKnownAdmissionStatus(normalizedStatus)
                      ? t(`statuses.${normalizedStatus}`)
                      : admission.status || t('labels.notAvailable')}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {admission.room?.id ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/app/rooms/${admission.room?.id}`)}
                  >
                    {t('actions.viewRoom')}
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!isActive}
                  loading={
                    dischargeAdmission.isPending
                    && dischargeAdmission.variables === admission.id
                  }
                  onClick={() => handleDischarge(admission.id)}
                >
                  {t('actions.discharge')}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const showPatientState =
    !patientsQuery.isLoading && !patientsQuery.error && !patientOptions.length && !form.patientId;

  const showRoomState =
    !roomsQuery.isLoading && !roomsQuery.error && !roomOptions.length;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{t('page.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('page.description')}</p>
        </div>
      </div>

      <Card title={t('form.title')} description={t('form.description')}>
        <div className="space-y-4">
          {roomsQuery.isLoading || patientsQuery.isLoading ? (
            <AdmissionStateCard
              title={t('states.loadingOptionsTitle')}
              description={t('states.loadingOptionsDescription')}
            />
          ) : null}

          {!roomsQuery.isLoading && roomsQuery.error ? (
            <AdmissionStateCard
              title={t('states.errorTitle')}
              description={getRoomApiMessage(roomsQuery.error, t('errors.rooms'))}
            >
              <Button variant="outline" onClick={() => roomsQuery.refetch()}>
                {t('actions.retry')}
              </Button>
            </AdmissionStateCard>
          ) : null}

          {!patientsQuery.isLoading && patientsQuery.error ? (
            <AdmissionStateCard
              title={t('states.errorTitle')}
              description={t('errors.patients')}
            >
              <Button variant="outline" onClick={() => patientsQuery.refetch()}>
                {t('actions.retry')}
              </Button>
            </AdmissionStateCard>
          ) : null}

          {showPatientState ? (
            <AdmissionStateCard
              title={t('states.emptyPatientsTitle')}
              description={t('states.emptyPatientsDescription')}
            >
              <Button variant="outline" onClick={() => navigate('/app/patients')}>
                {t('actions.viewPatients')}
              </Button>
            </AdmissionStateCard>
          ) : null}

          {showRoomState ? (
            <AdmissionStateCard
              title={t('states.emptyRoomsTitle')}
              description={t('states.emptyRoomsDescription')}
            >
              <Button variant="outline" onClick={() => navigate('/app/rooms')}>
                {t('actions.viewRooms')}
              </Button>
            </AdmissionStateCard>
          ) : null}

          {!roomsQuery.isLoading && !roomsQuery.error && roomOptions.length && !hasSelectableRooms ? (
            <div className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-attention">
              {t('states.noCapacityDescription')}
            </div>
          ) : null}

          {!roomsQuery.isLoading
          && !patientsQuery.isLoading
          && !roomsQuery.error
          && !patientsQuery.error
          && !showPatientState
          && !showRoomState ? (
            <form className="space-y-4" noValidate onSubmit={handleSubmit}>
              {formError ? (
                <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
                  {formError}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  name="patientSearch"
                  label={t('fields.patientSearch')}
                  value={patientSearch}
                  placeholder={t('form.patientSearchPlaceholder')}
                  onChange={(event) => setPatientSearch(event.target.value)}
                />

                <Select
                  required
                  name="patientId"
                  label={t('fields.patient')}
                  value={form.patientId}
                  error={errors.patientId}
                  onChange={(event) => handleChange('patientId', event.target.value)}
                >
                  <option value="">{t('form.patientPlaceholder')}</option>
                  {patientOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>

                <Select
                  required
                  name="roomId"
                  label={t('fields.room')}
                  value={form.roomId}
                  error={errors.roomId}
                  onChange={(event) => handleChange('roomId', event.target.value)}
                >
                  <option value="">{t('form.roomPlaceholder')}</option>
                  {roomOptions.map((option) => (
                    <option key={option.value} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </option>
                  ))}
                </Select>

                <Input
                  type="date"
                  name="admissionDate"
                  label={t('fields.admissionDate')}
                  value={form.admissionDate}
                  error={errors.admissionDate}
                  hint={t('form.admissionDateHint')}
                  onChange={(event) => handleChange('admissionDate', event.target.value)}
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setForm(emptyForm)}>
                  {t('actions.reset')}
                </Button>
                <Button type="submit" loading={saving}>
                  {t('actions.create')}
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      </Card>

      <Card title={t('filters.title')} description={t('filters.description')}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[220px,260px,auto]">
          <Select
            name="status"
            label={t('fields.status')}
            value={status}
            onChange={(event) => updateParams({ status: event.target.value || null })}
          >
            <option value="">{t('filters.allStatuses')}</option>
            <option value="ACTIVE">{t('statuses.ACTIVE')}</option>
            <option value="DISCHARGED">{t('statuses.DISCHARGED')}</option>
          </Select>

          <DateRangePicker
            label={t('fields.admissionDate')}
            exactLabel={t('filters.exactDate')}
            rangeLabel={t('filters.dateRange')}
            value={{ date, from, to }}
            onChange={(value) =>
              updateParams({
                date: value.date || null,
                from: value.from || null,
                to: value.to || null,
              })
            }
          />

          <Button
            type="button"
            variant="outline"
            className="md:self-end"
            onClick={() => updateParams({ status: null, date: null, from: null, to: null })}
          >
            {t('actions.clear')}
          </Button>
        </div>
      </Card>

      <Card
        title={t('list.title')}
        description={
          admissionsQuery.data
            ? t('list.results', { count: admissionsQuery.data.length })
            : t('list.description')
        }
      >
        <div className="space-y-4">
          {admissionsQuery.isFetching && !admissionsQuery.isLoading ? (
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
