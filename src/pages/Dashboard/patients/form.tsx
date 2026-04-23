import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreatePatient, usePatient, useUpdatePatient } from '@/domain/patients/patients.hooks';
import {
  getPatientApiMessage,
  getPatientApiStatus,
  patientBloodTypes,
  patientDatePattern,
  patientGenders,
  patientPhonePattern,
} from '@/domain/patients/patients.utils';
import type { PatientBloodType, PatientGender } from '@/domain/patients/patients.types';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import Textarea from '@/ui/atoms/Textarea';
import PatientStateCard from './state-card';

type PatientFormValues = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  address: string;
  bloodType: string;
};

const emptyForm: PatientFormValues = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  phoneNumber: '',
  address: '',
  bloodType: '',
};

function validateForm(values: PatientFormValues, t: (key: string) => string) {
  const errors: Record<string, string> = {};

  if (!values.firstName.trim()) errors.firstName = t('validation.required');
  if (!values.lastName.trim()) errors.lastName = t('validation.required');
  if (!values.dateOfBirth.trim()) errors.dateOfBirth = t('validation.required');
  if (!values.gender.trim()) errors.gender = t('validation.required');
  if (!values.phoneNumber.trim()) errors.phoneNumber = t('validation.required');
  if (!values.address.trim()) errors.address = t('validation.required');
  if (!values.bloodType.trim()) errors.bloodType = t('validation.required');

  if (values.dateOfBirth && !patientDatePattern.test(values.dateOfBirth)) {
    errors.dateOfBirth = t('validation.dateOfBirth');
  }

  if (values.phoneNumber && !patientPhonePattern.test(values.phoneNumber)) {
    errors.phoneNumber = t('validation.phoneNumber');
  }

  return errors;
}

export default function PatientFormPage() {
  const { t } = useTranslation('patients');
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const isEdit = !!id;
  const patientQuery = usePatient(id);
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const [form, setForm] = useState<PatientFormValues>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const status = getPatientApiStatus(patientQuery.error);
  const saving = createPatient.isPending || updatePatient.isPending;

  useEffect(() => {
    if (!isEdit || !patientQuery.data) {
      return;
    }

    setForm({
      firstName: patientQuery.data.firstName,
      lastName: patientQuery.data.lastName,
      dateOfBirth: patientQuery.data.dateOfBirth,
      gender: patientQuery.data.gender,
      phoneNumber: patientQuery.data.phoneNumber,
      address: patientQuery.data.address,
      bloodType: patientQuery.data.bloodType,
    });
  }, [isEdit, patientQuery.data]);

  const handleChange = (name: keyof PatientFormValues, value: string) => {
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
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      dateOfBirth: form.dateOfBirth,
      gender: form.gender as PatientGender,
      phoneNumber: form.phoneNumber.trim(),
      address: form.address.trim(),
      bloodType: form.bloodType as PatientBloodType,
    };

    try {
      const patient = isEdit
        ? await updatePatient.mutateAsync({ id, payload })
        : await createPatient.mutateAsync(payload);

      navigate(`/app/patients/${patient.id}`, { replace: true });
    } catch (error: unknown) {
      setFormError(getPatientApiMessage(error, t('errors.save')));
    }
  };

  if (isEdit && patientQuery.isLoading) {
    return (
      <PatientStateCard
        title={t('states.loadingPatientTitle')}
        description={t('states.loadingPatientDescription')}
      />
    );
  }

  if (isEdit && status === 401) {
    return (
      <PatientStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  }

  if (isEdit && status === 403) {
    return (
      <PatientStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  }

  if (isEdit && status === 404) {
    return (
      <PatientStateCard
        title={t('details.notFoundTitle')}
        description={t('details.notFoundDescription')}
      >
        <Button variant="outline" onClick={() => navigate('/app/patients')}>
          {t('actions.back')}
        </Button>
      </PatientStateCard>
    );
  }

  if (isEdit && patientQuery.error) {
    return (
      <PatientStateCard
        title={t('states.errorTitle')}
        description={getPatientApiMessage(patientQuery.error, t('errors.details'))}
      >
        <Button variant="outline" onClick={() => patientQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </PatientStateCard>
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
          onClick={() => navigate(isEdit ? `/app/patients/${id}` : '/app/patients')}
        >
          {t('actions.cancel')}
        </Button>
      </div>

      <Card title={t('form.formTitle')} description={t('form.formDescription')}>
        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
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
              type="date"
              name="dateOfBirth"
              label={t('fields.dateOfBirth')}
              value={form.dateOfBirth}
              error={errors.dateOfBirth}
              onChange={(event) => handleChange('dateOfBirth', event.target.value)}
            />
            <Select
              required
              name="gender"
              label={t('fields.gender')}
              value={form.gender}
              error={errors.gender}
              onChange={(event) => handleChange('gender', event.target.value)}
            >
              <option value="">{t('form.genderPlaceholder')}</option>
              {patientGenders.map((gender) => (
                <option key={gender} value={gender}>
                  {t(`genders.${gender}`)}
                </option>
              ))}
            </Select>
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
            <Select
              required
              name="bloodType"
              label={t('fields.bloodType')}
              value={form.bloodType}
              error={errors.bloodType}
              onChange={(event) => handleChange('bloodType', event.target.value)}
            >
              <option value="">{t('form.bloodTypePlaceholder')}</option>
              {patientBloodTypes.map((bloodType) => (
                <option key={bloodType} value={bloodType}>
                  {bloodType}
                </option>
              ))}
            </Select>
          </div>

          <Textarea
            required
            name="address"
            label={t('fields.address')}
            value={form.address}
            error={errors.address}
            onChange={(event) => handleChange('address', event.target.value)}
          />

          {formError ? <p className="text-sm text-danger">{formError}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" loading={saving}>
              {isEdit ? t('actions.update') : t('actions.save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(isEdit ? `/app/patients/${id}` : '/app/patients')}
            >
              {t('actions.cancel')}
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
