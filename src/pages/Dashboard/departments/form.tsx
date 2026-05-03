import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCreateDepartment,
  useDepartment,
  useUpdateDepartment,
} from '@/domain/departments/departments.hooks';
import {
  getDepartmentApiMessage,
  getDepartmentApiStatus,
} from '@/domain/departments/departments.utils';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Textarea from '@/ui/atoms/Textarea';
import DepartmentStateCard from './state-card';

type DepartmentFormValues = {
  name: string;
  location: string;
  description: string;
};

const emptyForm: DepartmentFormValues = {
  name: '',
  location: '',
  description: '',
};

function validateForm(values: DepartmentFormValues, t: (key: string) => string) {
  const errors: Record<string, string> = {};

  if (!values.name.trim()) errors.name = t('validation.required');
  if (!values.location.trim()) errors.location = t('validation.required');

  return errors;
}

export default function DepartmentFormPage() {
  const { t } = useTranslation('departments');
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const isEdit = !!id;
  const departmentQuery = useDepartment(id);
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const [form, setForm] = useState<DepartmentFormValues>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const status = getDepartmentApiStatus(departmentQuery.error);
  const saving = createDepartment.isPending || updateDepartment.isPending;

  useEffect(() => {
    if (!isEdit || !departmentQuery.data) {
      return;
    }

    setForm({
      name: departmentQuery.data.name,
      location: departmentQuery.data.location,
      description: departmentQuery.data.description ?? '',
    });
  }, [departmentQuery.data, isEdit]);

  const handleChange = (name: keyof DepartmentFormValues, value: string) => {
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

    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      description: form.description.trim() || undefined,
    };

    try {
      if (isEdit) {
        await updateDepartment.mutateAsync({ id, payload });
      } else {
        await createDepartment.mutateAsync(payload);
      }

      navigate('/app/departments', {
        replace: true,
        state: { success: isEdit ? t('messages.updated') : t('messages.created') },
      });
    } catch (error: unknown) {
      setFormError(getDepartmentApiMessage(error, t('errors.save')));
    }
  };

  if (isEdit && departmentQuery.isLoading) {
    return (
      <DepartmentStateCard
        title={t('states.loadingDepartmentTitle')}
        description={t('states.loadingDepartmentDescription')}
      />
    );
  }

  if (isEdit && status === 401) {
    return (
      <DepartmentStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  }

  if (isEdit && status === 403) {
    return (
      <DepartmentStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  }

  if (isEdit && status === 404) {
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

  if (isEdit && departmentQuery.error) {
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

        <Button
          variant="outline"
          onClick={() => navigate(isEdit ? `/app/departments/${id}` : '/app/departments')}
        >
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
              name="name"
              label={t('fields.name')}
              value={form.name}
              error={errors.name}
              onChange={(event) => handleChange('name', event.target.value)}
            />
            <Input
              required
              name="location"
              label={t('fields.location')}
              value={form.location}
              error={errors.location}
              onChange={(event) => handleChange('location', event.target.value)}
            />
            <div className="md:col-span-2">
              <Textarea
                rows={5}
                name="description"
                label={t('fields.description')}
                value={form.description}
                placeholder={t('form.descriptionPlaceholder')}
                onChange={(event) => handleChange('description', event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/app/departments')}>
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
