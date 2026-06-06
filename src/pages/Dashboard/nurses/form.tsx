import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useDepartments } from '@/domain/departments/departments.hooks';
import { useCreateNurse, useNurse, useUpdateNurse } from '@/domain/nurses/nurses.hooks';
import type { CreateNurseDTO, NurseShift, UpdateNurseDTO } from '@/domain/nurses/nurses.types';
import { nurseShiftValues } from '@/domain/nurses/nurses.types';
import {
  getNurseApiMessage,
  getNurseApiStatus,
  isKnownNurseShift,
  normalizeNurseShift,
} from '@/domain/nurses/nurses.utils';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import NurseStateCard from './state-card';

type NurseFormValues = {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  departmentId: string;
  shift: string;
};

type SelectOption = {
  value: string;
  label: string;
};

const emptyForm: NurseFormValues = {
  email: '',
  username: '',
  firstName: '',
  lastName: '',
  departmentId: '',
  shift: '',
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateForm(
  values: NurseFormValues,
  isEdit: boolean,
  t: (key: string) => string
) {
  const errors: Record<string, string> = {};
  const email = values.email.trim();
  const username = values.username.trim();

  if (!values.firstName.trim()) errors.firstName = t('validation.required');
  if (!values.lastName.trim()) errors.lastName = t('validation.required');
  if (!values.departmentId.trim()) errors.departmentId = t('validation.required');
  if (!values.shift.trim()) errors.shift = t('validation.required');

  if (isEdit) {
    return errors;
  }

  if (!email) {
    errors.email = t('validation.required');
  } else if (!isValidEmail(email)) {
    errors.email = t('validation.email');
  }

  if (!username) {
    errors.username = t('validation.required');
  } else if (username.length < 3) {
    errors.username = t('validation.username');
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

export default function NurseFormPage() {
  const { t } = useTranslation('nurses');
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const isEdit = !!id;
  const nurseQuery = useNurse(id);
  const departmentsQuery = useDepartments();
  const createNurse = useCreateNurse();
  const updateNurse = useUpdateNurse();
  const [form, setForm] = useState<NurseFormValues>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const status = getNurseApiStatus(nurseQuery.error);
  const saving = createNurse.isPending || updateNurse.isPending;

  useEffect(() => {
    if (!isEdit || !nurseQuery.data) {
      return;
    }

    setForm({
      email: nurseQuery.data.email ?? nurseQuery.data.user?.email ?? '',
      username: nurseQuery.data.username ?? nurseQuery.data.user?.username ?? '',
      firstName: nurseQuery.data.firstName,
      lastName: nurseQuery.data.lastName,
      departmentId: nurseQuery.data.departmentId,
      shift: normalizeNurseShift(nurseQuery.data.shift),
    });
  }, [isEdit, nurseQuery.data]);

  const handleChange = (name: keyof NurseFormValues, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  };

  const getShiftLabel = (value: string) => {
    const normalized = normalizeNurseShift(value);

    if (isKnownNurseShift(normalized)) {
      return t(`shifts.${normalized}`);
    }

    return value;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(form, isEdit, t);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    const basePayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      departmentId: form.departmentId.trim(),
      shift: normalizeNurseShift(form.shift) as NurseShift,
    };

    try {
      const nurse = isEdit
        ? await updateNurse.mutateAsync({
            id,
            payload: basePayload satisfies UpdateNurseDTO,
          })
        : await createNurse.mutateAsync({
            ...basePayload,
            email: form.email.trim(),
            username: form.username.trim(),
          } satisfies CreateNurseDTO);

      navigate(`/app/nurses/${nurse.id}`, {
        replace: true,
        state: { success: isEdit ? t('messages.updated') : t('messages.created') },
      });
    } catch (error: unknown) {
      setFormError(getNurseApiMessage(error, t('errors.save')));
    }
  };

  if (isEdit && nurseQuery.isLoading) {
    return (
      <NurseStateCard
        title={t('states.loadingNurseTitle')}
        description={t('states.loadingNurseDescription')}
      />
    );
  }

  if (isEdit && status === 401) {
    return (
      <NurseStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  }

  if (isEdit && status === 403) {
    return (
      <NurseStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  }

  if (isEdit && status === 404) {
    return (
      <NurseStateCard
        title={t('details.notFoundTitle')}
        description={t('details.notFoundDescription')}
      >
        <Button variant="outline" onClick={() => navigate('/app/nurses')}>
          {t('actions.back')}
        </Button>
      </NurseStateCard>
    );
  }

  if (isEdit && nurseQuery.error) {
    return (
      <NurseStateCard
        title={t('states.errorTitle')}
        description={getNurseApiMessage(nurseQuery.error, t('errors.details'))}
      >
        <Button variant="outline" onClick={() => nurseQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </NurseStateCard>
    );
  }

  if (departmentsQuery.isLoading) {
    return (
      <NurseStateCard
        title={t('states.loadingOptionsTitle')}
        description={t('states.loadingOptionsDescription')}
      />
    );
  }

  if (departmentsQuery.error) {
    return (
      <NurseStateCard
        title={t('states.errorTitle')}
        description={getNurseApiMessage(departmentsQuery.error, t('errors.departments'))}
      >
        <Button variant="outline" onClick={() => departmentsQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </NurseStateCard>
    );
  }

  const departmentOptions = (departmentsQuery.data ?? []).map((department) => ({
    value: department.id,
    label: getDepartmentLabel(department.name, department.location),
  }));
  const shiftOptions = nurseShiftValues.map((value) => ({
    value,
    label: t(`shifts.${value}`),
  }));
  const departmentSelectOptions = withFallbackOption(
    departmentOptions,
    form.departmentId,
    nurseQuery.data?.department
      ? getDepartmentLabel(nurseQuery.data.department.name, nurseQuery.data.department.location)
      : form.departmentId
  );
  const shiftSelectOptions = withFallbackOption(shiftOptions, form.shift, getShiftLabel(form.shift));

  if (!isEdit && !departmentSelectOptions.length) {
    return (
      <NurseStateCard
        title={t('states.emptyDepartmentsTitle')}
        description={t('states.emptyDepartmentsDescription')}
      >
        <Button variant="outline" onClick={() => navigate('/app/departments')}>
          {t('actions.viewDepartments')}
        </Button>
      </NurseStateCard>
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

        <Button variant="outline" onClick={() => navigate(isEdit ? `/app/nurses/${id}` : '/app/nurses')}>
          {t('actions.cancel')}
        </Button>
      </div>

      <Card title={t('form.formTitle')} description={t('form.formDescription')}>
        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              required={!isEdit}
              disabled={isEdit}
              readOnly={isEdit}
              type="email"
              name="email"
              label={t('fields.email')}
              value={form.email}
              error={errors.email}
              hint={isEdit ? t('form.accountReadOnlyHint') : t('form.emailHint')}
              onChange={(event) => handleChange('email', event.target.value)}
            />
            <Input
              required={!isEdit}
              disabled={isEdit}
              readOnly={isEdit}
              name="username"
              label={t('fields.username')}
              value={form.username}
              error={errors.username}
              hint={isEdit ? t('form.accountReadOnlyHint') : t('form.usernameHint')}
              onChange={(event) => handleChange('username', event.target.value)}
            />

            <Input
              required
              name="firstName"
              label={t('fields.firstName')}
              value={form.firstName}
              error={errors.firstName}
              onChange={(event) => handleChange('firstName', event.target.value)}
            />
            <Input
              required
              name="lastName"
              label={t('fields.lastName')}
              value={form.lastName}
              error={errors.lastName}
              onChange={(event) => handleChange('lastName', event.target.value)}
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
              name="shift"
              label={t('fields.shift')}
              value={form.shift}
              error={errors.shift}
              onChange={(event) => handleChange('shift', event.target.value)}
            >
              <option value="">{t('form.shiftPlaceholder')}</option>
              {shiftSelectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {formError ? (
            <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              {formError}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={saving}>
              {isEdit ? t('actions.update') : t('actions.save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(isEdit ? `/app/nurses/${id}` : '/app/nurses')}
            >
              {t('actions.cancel')}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
