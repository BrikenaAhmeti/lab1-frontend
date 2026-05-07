import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isAdminUser } from '@/domain/auth/role.utils';
import { useDepartments } from '@/domain/departments/departments.hooks';
import {
  useCreateRoom,
  useRoom,
  useUpdateRoom,
} from '@/domain/rooms/rooms.hooks';
import type { RoomStatus, RoomType } from '@/domain/rooms/rooms.types';
import {
  isKnownRoomStatus,
  isKnownRoomType,
  normalizeRoomStatus,
  normalizeRoomType,
  getRoomApiMessage,
  getRoomApiStatus,
} from '@/domain/rooms/rooms.utils';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import RoomStateCard from './state-card';

type RoomFormValues = {
  roomNumber: string;
  departmentId: string;
  type: string;
  status: string;
  capacity: string;
};

type SelectOption = {
  value: string;
  label: string;
};

const emptyForm: RoomFormValues = {
  roomNumber: '',
  departmentId: '',
  type: '',
  status: 'AVAILABLE',
  capacity: '',
};

function validateForm(values: RoomFormValues, t: (key: string) => string) {
  const errors: Record<string, string> = {};
  const capacity = Number(values.capacity);

  if (!values.roomNumber.trim()) errors.roomNumber = t('validation.required');
  if (!values.departmentId.trim()) errors.departmentId = t('validation.required');
  if (!values.type.trim()) errors.type = t('validation.required');
  if (!values.capacity.trim()) {
    errors.capacity = t('validation.required');
  } else if (!Number.isFinite(capacity) || capacity <= 0) {
    errors.capacity = t('validation.capacity');
  }

  return errors;
}

function getDepartmentLabel(name: string, location: string) {
  return location.trim() ? `${name} (${location})` : name;
}

function withFallbackOption(options: SelectOption[], value: string, label: string) {
  if (!value || options.some((option) => option.value === value)) {
    return options;
  }

  return [{ value, label }, ...options];
}

export default function RoomFormPage() {
  const { t } = useTranslation('rooms');
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
  const isAdmin = isAdminUser(roles);
  const isEdit = !!id;
  const roomQuery = useRoom(id);
  const departmentsQuery = useDepartments();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const [form, setForm] = useState<RoomFormValues>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const status = getRoomApiStatus(roomQuery.error);
  const saving = createRoom.isPending || updateRoom.isPending;

  useEffect(() => {
    if (!isEdit || !roomQuery.data) {
      return;
    }

    setForm({
      roomNumber: roomQuery.data.roomNumber,
      departmentId: roomQuery.data.departmentId,
      type: normalizeRoomType(roomQuery.data.type),
      status: normalizeRoomStatus(roomQuery.data.status),
      capacity: String(roomQuery.data.capacity ?? ''),
    });
  }, [isEdit, roomQuery.data]);

  const handleChange = (name: keyof RoomFormValues, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  };

  const getTypeLabel = (value: string) => {
    const normalized = normalizeRoomType(value);
    return isKnownRoomType(normalized) ? t(`types.${normalized}`) : value;
  };

  const getStatusLabel = (value: string) => {
    const normalized = normalizeRoomStatus(value);
    return isKnownRoomStatus(normalized) ? t(`statuses.${normalized}`) : value;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(form, t);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    const payload = {
      roomNumber: form.roomNumber.trim(),
      departmentId: form.departmentId.trim(),
      type: normalizeRoomType(form.type) as RoomType,
      status: normalizeRoomStatus(form.status) as RoomStatus,
      capacity: Number(form.capacity),
    };

    try {
      if (isEdit) {
        await updateRoom.mutateAsync({ id, payload });
      } else {
        await createRoom.mutateAsync(payload);
      }

      navigate('/app/rooms', {
        replace: true,
        state: { success: isEdit ? t('messages.updated') : t('messages.created') },
      });
    } catch (error: unknown) {
      setFormError(getRoomApiMessage(error, t('errors.save')));
    }
  };

  if (!isAdmin) {
    return (
      <RoomStateCard
        title={t('states.manageForbiddenTitle')}
        description={t('states.manageForbiddenDescription')}
      >
        <Button variant="outline" onClick={() => navigate('/app/rooms')}>
          {t('actions.back')}
        </Button>
      </RoomStateCard>
    );
  }

  if (isEdit && roomQuery.isLoading) {
    return (
      <RoomStateCard
        title={t('states.loadingRoomTitle')}
        description={t('states.loadingRoomDescription')}
      />
    );
  }

  if (isEdit && status === 401) {
    return (
      <RoomStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  }

  if (isEdit && status === 403) {
    return (
      <RoomStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  }

  if (isEdit && status === 404) {
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

  if (isEdit && roomQuery.error) {
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

  if (departmentsQuery.isLoading) {
    return (
      <RoomStateCard
        title={t('states.loadingOptionsTitle')}
        description={t('states.loadingOptionsDescription')}
      />
    );
  }

  if (departmentsQuery.error) {
    return (
      <RoomStateCard
        title={t('states.errorTitle')}
        description={getRoomApiMessage(departmentsQuery.error, t('errors.departments'))}
      >
        <Button variant="outline" onClick={() => departmentsQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </RoomStateCard>
    );
  }

  const departmentOptions = (departmentsQuery.data ?? []).map((department) => ({
    value: department.id,
    label: getDepartmentLabel(department.name, department.location),
  }));
  const typeOptions = [
    { value: 'GENERAL', label: t('types.GENERAL') },
    { value: 'ICU', label: t('types.ICU') },
    { value: 'SURGERY', label: t('types.SURGERY') },
    { value: 'EMERGENCY', label: t('types.EMERGENCY') },
    { value: 'PEDIATRIC', label: t('types.PEDIATRIC') },
  ];
  const statusOptions = [
    { value: 'AVAILABLE', label: t('statuses.AVAILABLE') },
    { value: 'OCCUPIED', label: t('statuses.OCCUPIED') },
    { value: 'UNDER_MAINTENANCE', label: t('statuses.UNDER_MAINTENANCE') },
  ];
  const departmentSelectOptions = withFallbackOption(
    departmentOptions,
    form.departmentId,
    roomQuery.data?.department
      ? getDepartmentLabel(roomQuery.data.department.name, roomQuery.data.department.location)
      : form.departmentId
  );
  const typeSelectOptions = withFallbackOption(typeOptions, form.type, getTypeLabel(form.type));
  const statusSelectOptions = withFallbackOption(
    statusOptions,
    form.status,
    getStatusLabel(form.status)
  );

  if (!isEdit && !departmentSelectOptions.length) {
    return (
      <RoomStateCard
        title={t('states.emptyDepartmentsTitle')}
        description={t('states.emptyDepartmentsDescription')}
      >
        <Button variant="outline" onClick={() => navigate('/app/departments')}>
          {t('actions.viewDepartments')}
        </Button>
      </RoomStateCard>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            {isEdit ? t('form.editTitle') : t('form.createTitle')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isEdit ? t('form.editDescription') : t('form.createDescription')}
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate('/app/rooms')}>
          {t('actions.cancel')}
        </Button>
      </div>

      <Card title={t('form.formTitle')} description={t('form.formDescription')}>
        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          {formError ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              {formError}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              required
              name="roomNumber"
              label={t('fields.roomNumber')}
              value={form.roomNumber}
              error={errors.roomNumber}
              onChange={(event) => handleChange('roomNumber', event.target.value)}
            />

            <Select
              required
              name="departmentId"
              label={t('fields.department')}
              value={form.departmentId}
              error={errors.departmentId}
              onChange={(event) => handleChange('departmentId', event.target.value)}
            >
              <option value="">{t('form.departmentPlaceholder')}</option>
              {departmentSelectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Select
              required
              name="type"
              label={t('fields.type')}
              value={form.type}
              error={errors.type}
              onChange={(event) => handleChange('type', event.target.value)}
            >
              <option value="">{t('form.typePlaceholder')}</option>
              {typeSelectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Select
              name="status"
              label={t('fields.status')}
              value={form.status}
              onChange={(event) => handleChange('status', event.target.value)}
            >
              {statusSelectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Input
              required
              min={1}
              type="number"
              inputMode="numeric"
              name="capacity"
              label={t('fields.capacity')}
              value={form.capacity}
              error={errors.capacity}
              onChange={(event) => handleChange('capacity', event.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/app/rooms')}>
              {t('actions.back')}
            </Button>
            <Button type="submit" loading={saving}>
              {isEdit ? t('actions.update') : t('actions.save')}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
