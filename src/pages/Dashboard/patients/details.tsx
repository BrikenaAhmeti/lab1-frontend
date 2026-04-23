import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { useDeletePatient, usePatient } from '@/domain/patients/patients.hooks';
import { formatPatientDate, getPatientApiMessage, getPatientApiStatus } from '@/domain/patients/patients.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import { useState } from 'react';
import PatientStateCard from './state-card';

function getIsAdmin(roles: string[]) {
  const storedRole = localStorage.getItem('role');
  const allRoles = [...roles, ...(storedRole ? [storedRole] : [])].map((role) => role.toUpperCase());
  return allRoles.includes('ADMIN') || allRoles.includes('ADMINS');
}

export default function PatientDetailsPage() {
  const { t, i18n } = useTranslation('patients');
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
  const isAdmin = getIsAdmin(roles);
  const patientQuery = usePatient(id);
  const deletePatient = useDeletePatient();
  const [actionError, setActionError] = useState('');
  const status = getPatientApiStatus(patientQuery.error);
  const patient = patientQuery.data;

  const handleDelete = async () => {
    if (!window.confirm(t('details.deleteConfirm'))) {
      return;
    }

    try {
      setActionError('');
      await deletePatient.mutateAsync(id);
      navigate('/app/patients', { replace: true });
    } catch (error: unknown) {
      setActionError(getPatientApiMessage(error, t('errors.delete')));
    }
  };

  if (patientQuery.isLoading) {
    return (
      <PatientStateCard
        title={t('states.loadingPatientTitle')}
        description={t('states.loadingPatientDescription')}
      />
    );
  }

  if (status === 401) {
    return (
      <PatientStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  }

  if (status === 403) {
    return (
      <PatientStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  }

  if (status === 404) {
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

  if (patientQuery.error || !patient) {
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

  const fields = [
    { label: t('fields.firstName'), value: patient.firstName },
    { label: t('fields.lastName'), value: patient.lastName },
    { label: t('fields.dateOfBirth'), value: formatPatientDate(patient.dateOfBirth, i18n.language) },
    { label: t('fields.gender'), value: t(`genders.${patient.gender}`) },
    { label: t('fields.phoneNumber'), value: patient.phoneNumber },
    { label: t('fields.bloodType'), value: patient.bloodType },
    { label: t('fields.address'), value: patient.address, full: true },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              {patient.firstName} {patient.lastName}
            </h1>
            <Badge>{patient.bloodType}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t('details.description')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/app/patients')}>
            {t('actions.back')}
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/app/patients/${patient.id}/edit`)}>
            {t('actions.edit')}
          </Button>
          {isAdmin ? (
            <Button variant="danger" loading={deletePatient.isPending} onClick={handleDelete}>
              {t('actions.delete')}
            </Button>
          ) : null}
        </div>
      </div>

      <Card title={t('details.title')} description={t('details.description')}>
        {actionError ? <p className="mb-4 text-sm text-danger">{actionError}</p> : null}
        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.label}
              className={field.full ? 'md:col-span-2' : undefined}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {field.label}
              </p>
              <p className="mt-1 break-words text-sm text-foreground">{field.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
