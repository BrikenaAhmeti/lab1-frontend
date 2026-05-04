import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isAdminUser } from '@/domain/auth/role.utils';
import { useDeleteDoctor, useDoctor } from '@/domain/doctors/doctors.hooks';
import {
  formatDoctorDate,
  getDoctorApiMessage,
  getDoctorApiStatus,
  getDoctorFullName,
} from '@/domain/doctors/doctors.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import RelatedAppointmentsCard from '@/pages/Dashboard/appointments/related-card';
import DoctorStateCard from './state-card';

export default function DoctorDetailsPage() {
  const { t, i18n } = useTranslation('doctors');
  const navigate = useNavigate();
  const location = useLocation();
  const { id = '' } = useParams();
  const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
  const isAdmin = isAdminUser(roles);
  const doctorQuery = useDoctor(id);
  const deleteDoctor = useDeleteDoctor();
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const status = getDoctorApiStatus(doctorQuery.error);
  const doctor = doctorQuery.data;

  useEffect(() => {
    const successMessage = (location.state as { success?: string } | null)?.success;

    if (typeof successMessage !== 'string' || !successMessage.trim()) {
      return;
    }

    setActionSuccess(successMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const handleDelete = async () => {
    if (!window.confirm(t('details.deleteConfirm'))) {
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      await deleteDoctor.mutateAsync(id);
      navigate('/app/doctors', {
        replace: true,
        state: { success: t('messages.deleted') },
      });
    } catch (error: unknown) {
      setActionError(getDoctorApiMessage(error, t('errors.delete')));
    }
  };

  if (doctorQuery.isLoading) {
    return (
      <DoctorStateCard
        title={t('states.loadingDoctorTitle')}
        description={t('states.loadingDoctorDescription')}
      />
    );
  }

  if (status === 401) {
    return (
      <DoctorStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  }

  if (status === 403) {
    return (
      <DoctorStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  }

  if (status === 404) {
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

  if (doctorQuery.error || !doctor) {
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

  const fields = [
    { label: t('fields.userId'), value: doctor.userId },
    { label: t('fields.phoneNumber'), value: doctor.phoneNumber },
    { label: t('fields.department'), value: doctor.department?.name || t('labels.noDepartment') },
    {
      label: t('fields.departmentLocation'),
      value: doctor.department?.location || t('labels.notAvailable'),
    },
    {
      label: t('fields.createdAt'),
      value: formatDoctorDate(doctor.createdAt, i18n.language) || t('labels.notAvailable'),
    },
    {
      label: t('fields.updatedAt'),
      value: formatDoctorDate(doctor.updatedAt, i18n.language) || t('labels.notAvailable'),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              {getDoctorFullName(doctor)}
            </h1>
            <Badge variant="secondary">{doctor.specialization}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t('details.description')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/app/doctors')}>
            {t('actions.back')}
          </Button>
          {doctor.departmentId ? (
            <Button
              variant="ghost"
              onClick={() => navigate(`/app/departments/${doctor.departmentId}`)}
            >
              {t('actions.viewDepartment')}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => navigate(`/app/doctors/${doctor.id}/edit`)}>
            {t('actions.edit')}
          </Button>
          {isAdmin ? (
            <Button variant="danger" loading={deleteDoctor.isPending} onClick={handleDelete}>
              {t('actions.delete')}
            </Button>
          ) : null}
        </div>
      </div>

      <Card title={t('details.title')} description={t('details.description')}>
        <div className="space-y-4">
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

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('fields.specialization')}
              </p>
              <p className="mt-1 break-words text-sm text-foreground">{doctor.specialization}</p>
            </div>

            {fields.map((field) => (
              <div key={field.label}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {field.label}
                </p>
                <p className="mt-1 break-words text-sm text-foreground">{field.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <RelatedAppointmentsCard doctorId={doctor.id} />
    </section>
  );
}
