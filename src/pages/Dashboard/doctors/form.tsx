import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import type { AuthUser } from '@/domain/auth/types';
import { isAdminUser } from '@/domain/auth/role.utils';
import { useDepartments } from '@/domain/departments/departments.hooks';
import type { Department } from '@/domain/departments/departments.types';
import { useCreateDoctor, useDoctor, useUpdateDoctor } from '@/domain/doctors/doctors.hooks';
import { doctorPhonePattern, getDoctorApiMessage, getDoctorApiStatus } from '@/domain/doctors/doctors.utils';
import { useUsers } from '@/hooks/useUsers';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import DoctorStateCard from './state-card';

type UserLinkMode = 'existing' | 'new';

type DoctorFormValues = {
  userLinkMode: UserLinkMode;
  userId: string;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  specialization: string;
  departmentId: string;
  phoneNumber: string;
};

type SelectOption = {
  value: string;
  label: string;
};

const emptyForm: DoctorFormValues = {
  userLinkMode: 'existing',
  userId: '',
  email: '',
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  specialization: '',
  departmentId: '',
  phoneNumber: '',
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateForm(
  values: DoctorFormValues,
  isEdit: boolean,
  t: (key: string) => string
) {
  const errors: Record<string, string> = {};
  const email = values.email.trim();
  const username = values.username.trim();
  const password = values.password.trim();
  const phoneNumber = values.phoneNumber.trim();

  if (!values.firstName.trim()) errors.firstName = t('validation.required');
  if (!values.lastName.trim()) errors.lastName = t('validation.required');
  if (!values.specialization.trim()) errors.specialization = t('validation.required');
  if (!values.departmentId.trim()) errors.departmentId = t('validation.required');
  if (!phoneNumber) errors.phoneNumber = t('validation.required');

  if (phoneNumber && !doctorPhonePattern.test(phoneNumber)) {
    errors.phoneNumber = t('validation.phoneNumber');
  }

  if (isEdit || values.userLinkMode === 'existing') {
    if (!values.userId.trim()) errors.userId = t('validation.required');
    return errors;
  }

  if (email && !isValidEmail(email)) {
    errors.email = t('validation.email');
  }

  if (username && username.length < 3) {
    errors.username = t('validation.username');
  }

  if (password && password.length < 6) {
    errors.password = t('validation.password');
  }

  return errors;
}

function getUserLabel(user: AuthUser) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

  if (fullName && user.email) {
    return `${fullName} (${user.email})`;
  }

  return fullName || user.email || user.id;
}

function getDepartmentLabel(department: Pick<Department, 'name' | 'location'>) {
  return department.location?.trim()
    ? `${department.name} (${department.location})`
    : department.name;
}

function withFallbackOption(options: SelectOption[], value: string, label: string) {
  if (!value || options.some((option) => option.value === value)) {
    return options;
  }

  return [{ value, label }, ...options];
}

export default function DoctorFormPage() {
  const { t } = useTranslation('doctors');
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
  const isAdmin = isAdminUser(roles);
  const isEdit = !!id;
  const doctorQuery = useDoctor(id);
  const departmentsQuery = useDepartments();
  const usersQuery = useUsers({ enabled: isAdmin });
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();
  const [form, setForm] = useState<DoctorFormValues>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const status = getDoctorApiStatus(doctorQuery.error);
  const saving = createDoctor.isPending || updateDoctor.isPending;

  useEffect(() => {
    if (!isEdit || !doctorQuery.data) {
      return;
    }

    setForm({
      userLinkMode: 'existing',
      userId: doctorQuery.data.userId,
      email: '',
      username: '',
      password: '',
      firstName: doctorQuery.data.firstName,
      lastName: doctorQuery.data.lastName,
      specialization: doctorQuery.data.specialization,
      departmentId: doctorQuery.data.departmentId,
      phoneNumber: doctorQuery.data.phoneNumber,
    });
  }, [doctorQuery.data, isEdit]);

  const handleChange = (name: keyof DoctorFormValues, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setFormError('');
  };

  const handleUserLinkModeChange = (userLinkMode: UserLinkMode) => {
    setForm((current) => ({
      ...current,
      userLinkMode,
      userId: userLinkMode === 'existing' ? current.userId : '',
      email: userLinkMode === 'new' ? current.email : '',
      username: userLinkMode === 'new' ? current.username : '',
      password: userLinkMode === 'new' ? current.password : '',
    }));
    setErrors((current) => ({
      ...current,
      userId: '',
      email: '',
      username: '',
      password: '',
    }));
    setFormError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateForm(form, isEdit, t);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      specialization: form.specialization.trim(),
      departmentId: form.departmentId.trim(),
      phoneNumber: form.phoneNumber.trim(),
      ...(isEdit || form.userLinkMode === 'existing'
        ? { userId: form.userId.trim() }
        : {}),
      ...(!isEdit && form.userLinkMode === 'new' && form.email.trim()
        ? { email: form.email.trim() }
        : {}),
      ...(!isEdit && form.userLinkMode === 'new' && form.username.trim()
        ? { username: form.username.trim() }
        : {}),
      ...(!isEdit && form.userLinkMode === 'new' && form.password.trim()
        ? { password: form.password.trim() }
        : {}),
    };

    try {
      const doctor = isEdit
        ? await updateDoctor.mutateAsync({ id, payload })
        : await createDoctor.mutateAsync(payload);

      navigate(`/app/doctors/${doctor.id}`, {
        replace: true,
        state: { success: isEdit ? t('messages.updated') : t('messages.created') },
      });
    } catch (error: unknown) {
      setFormError(getDoctorApiMessage(error, t('errors.save')));
    }
  };

  if (isEdit && doctorQuery.isLoading) {
    return (
      <DoctorStateCard
        title={t('states.loadingDoctorTitle')}
        description={t('states.loadingDoctorDescription')}
      />
    );
  }

  if (isEdit && status === 401) {
    return (
      <DoctorStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  }

  if (isEdit && status === 403) {
    return (
      <DoctorStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  }

  if (isEdit && status === 404) {
    return (
      <DoctorStateCard
        title={t('details.notFoundTitle')}
        description={t('details.notFoundDescription')}
      >
        <Button variant="outline" onClick={() => navigate('/app/doctors')}>
          {t('actions.back')}
        </Button>
      </DoctorStateCard>
    );
  }

  if (isEdit && doctorQuery.error) {
    return (
      <DoctorStateCard
        title={t('states.errorTitle')}
        description={getDoctorApiMessage(doctorQuery.error, t('errors.details'))}
      >
        <Button variant="outline" onClick={() => doctorQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </DoctorStateCard>
    );
  }

  if (!isEdit && !isAdmin) {
    return (
      <DoctorStateCard
        title={t('states.createForbiddenTitle')}
        description={t('states.createForbiddenDescription')}
      >
        <Button variant="outline" onClick={() => navigate('/app/doctors')}>
          {t('actions.back')}
        </Button>
      </DoctorStateCard>
    );
  }

  if (departmentsQuery.isLoading || (isAdmin && usersQuery.isLoading)) {
    return (
      <DoctorStateCard
        title={t('states.loadingOptionsTitle')}
        description={t('states.loadingOptionsDescription')}
      />
    );
  }

  if (departmentsQuery.error) {
    return (
      <DoctorStateCard
        title={t('states.errorTitle')}
        description={getDoctorApiMessage(departmentsQuery.error, t('errors.departments'))}
      >
        <Button variant="outline" onClick={() => departmentsQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </DoctorStateCard>
    );
  }

  const departmentOptions = (departmentsQuery.data ?? []).map((department) => ({
    value: department.id,
    label: getDepartmentLabel(department),
  }));
  const userOptions = (usersQuery.data ?? []).map((user) => ({
    value: user.id,
    label: getUserLabel(user),
  }));
  const selectedDepartmentLabel =
    doctorQuery.data?.department
      ? getDepartmentLabel(doctorQuery.data.department)
      : form.departmentId;
  const selectedUserLabel = form.userId;
  const departmentSelectOptions = withFallbackOption(
    departmentOptions,
    form.departmentId,
    selectedDepartmentLabel
  );
  const userSelectOptions = withFallbackOption(userOptions, form.userId, selectedUserLabel);
  const canChooseUser = isAdmin && !usersQuery.error;

  if (!isEdit && !departmentSelectOptions.length) {
    return (
      <DoctorStateCard
        title={t('states.emptyDepartmentsTitle')}
        description={t('states.emptyDepartmentsDescription')}
      >
        <Button variant="outline" onClick={() => navigate('/app/departments')}>
          {t('actions.viewDepartments')}
        </Button>
      </DoctorStateCard>
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

        <Button variant="outline" onClick={() => navigate(isEdit ? `/app/doctors/${id}` : '/app/doctors')}>
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

          {!isEdit ? (
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-foreground">
                {t('form.userLinkLegend')}
              </legend>
              <p className="text-sm text-muted-foreground">{t('form.userLinkDescription')}</p>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-background/50 p-4">
                  <input
                    checked={form.userLinkMode === 'existing'}
                    className="mt-1"
                    name="userLinkMode"
                    type="radio"
                    value="existing"
                    onChange={() => handleUserLinkModeChange('existing')}
                  />
                  <span>
                    <span className="block text-sm font-medium text-foreground">
                      {t('form.linkExistingUser')}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {t('form.linkExistingUserHint')}
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-background/50 p-4">
                  <input
                    checked={form.userLinkMode === 'new'}
                    className="mt-1"
                    name="userLinkMode"
                    type="radio"
                    value="new"
                    onChange={() => handleUserLinkModeChange('new')}
                  />
                  <span>
                    <span className="block text-sm font-medium text-foreground">
                      {t('form.createNewLinkedUser')}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {t('form.createNewLinkedUserHint')}
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            {isEdit || form.userLinkMode === 'existing' ? (
              canChooseUser ? (
                <Select
                  required
                  name="userId"
                  label={t('fields.userId')}
                  value={form.userId}
                  error={errors.userId}
                  onChange={(event) => handleChange('userId', event.target.value)}
                >
                  <option value="">{t('form.userPlaceholder')}</option>
                  {userSelectOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  required
                  disabled
                  readOnly
                  name="userId"
                  label={t('fields.userId')}
                  value={form.userId}
                  error={errors.userId}
                  hint={
                    !isEdit && usersQuery.error
                      ? t('form.userLoadFailedHint')
                      : t('form.userReadOnlyHint')
                  }
                />
              )
            ) : (
              <>
                <Input
                  name="email"
                  label={t('fields.email')}
                  value={form.email}
                  error={errors.email}
                  hint={t('form.emailHint')}
                  onChange={(event) => handleChange('email', event.target.value)}
                />
                <Input
                  name="username"
                  label={t('fields.username')}
                  value={form.username}
                  error={errors.username}
                  hint={t('form.usernameHint')}
                  onChange={(event) => handleChange('username', event.target.value)}
                />
              </>
            )}

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
            <Input
              required
              name="specialization"
              label={t('fields.specialization')}
              value={form.specialization}
              error={errors.specialization}
              onChange={(event) => handleChange('specialization', event.target.value)}
            />
            <Input
              required
              type="tel"
              name="phoneNumber"
              label={t('fields.phoneNumber')}
              value={form.phoneNumber}
              error={errors.phoneNumber}
              placeholder="+38344111222"
              onChange={(event) => handleChange('phoneNumber', event.target.value)}
            />
            {!isEdit && form.userLinkMode === 'new' ? (
              <Input
                type="password"
                name="password"
                label={t('fields.password')}
                value={form.password}
                error={errors.password}
                hint={t('form.passwordHint')}
                onChange={(event) => handleChange('password', event.target.value)}
              />
            ) : null}
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(isEdit ? `/app/doctors/${id}` : '/app/doctors')}>
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
