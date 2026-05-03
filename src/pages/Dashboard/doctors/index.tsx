import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isAdminUser } from '@/domain/auth/role.utils';
import { useDeleteDoctor, useDoctors } from '@/domain/doctors/doctors.hooks';
import {
  getDoctorApiMessage,
  getDoctorApiStatus,
  getDoctorFullName,
} from '@/domain/doctors/doctors.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import DoctorStateCard from './state-card';

export default function DoctorsListPage() {
  const { t } = useTranslation('doctors');
  const navigate = useNavigate();
  const location = useLocation();
  const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
  const isAdmin = isAdminUser(roles);
  const doctorsQuery = useDoctors();
  const deleteDoctor = useDeleteDoctor();
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const status = getDoctorApiStatus(doctorsQuery.error);

  useEffect(() => {
    const successMessage = (location.state as { success?: string } | null)?.success;

    if (typeof successMessage !== 'string' || !successMessage.trim()) {
      return;
    }

    setActionSuccess(successMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('details.deleteConfirm'))) {
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      await deleteDoctor.mutateAsync(id);
      setActionSuccess(t('messages.deleted'));
    } catch (error: unknown) {
      setActionError(getDoctorApiMessage(error, t('errors.delete')));
    }
  };

  let content = null;

  if (doctorsQuery.isLoading) {
    content = (
      <DoctorStateCard
        title={t('states.loadingTitle')}
        description={t('states.loadingDescription')}
      />
    );
  } else if (status === 401) {
    content = (
      <DoctorStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  } else if (status === 403) {
    content = (
      <DoctorStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  } else if (doctorsQuery.error) {
    content = (
      <DoctorStateCard
        title={t('states.errorTitle')}
        description={getDoctorApiMessage(doctorsQuery.error, t('errors.list'))}
      >
        <Button variant="outline" onClick={() => doctorsQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </DoctorStateCard>
    );
  } else if (!doctorsQuery.data?.length) {
    content = (
      <DoctorStateCard
        title={t('states.emptyTitle')}
        description={t('states.emptyDescription')}
      >
        {isAdmin ? (
          <Button onClick={() => navigate('/app/doctors/new')}>{t('actions.create')}</Button>
        ) : null}
      </DoctorStateCard>
    );
  } else {
    content = (
      <div className="grid gap-4 xl:grid-cols-2">
        {doctorsQuery.data.map((doctor) => (
          <div
            key={doctor.id}
            className="rounded-2xl border border-border/70 bg-background/50 p-5 transition-shadow duration-200 hover:shadow-soft"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-foreground">
                  {getDoctorFullName(doctor)}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {doctor.department?.name || t('labels.noDepartment')}
                </p>
              </div>
              <Badge variant="secondary">{doctor.specialization}</Badge>
            </div>

            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fields.phoneNumber')}
                </p>
                <p className="mt-1 break-words text-foreground">{doctor.phoneNumber}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('fields.departmentLocation')}
                </p>
                <p className="mt-1 break-words text-foreground">
                  {doctor.department?.location || t('labels.notAvailable')}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate(`/app/doctors/${doctor.id}`)}>
                {t('actions.view')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/app/doctors/${doctor.id}/edit`)}
              >
                {t('actions.edit')}
              </Button>
              {isAdmin ? (
                <Button
                  size="sm"
                  variant="danger"
                  loading={deleteDoctor.isPending && deleteDoctor.variables === doctor.id}
                  onClick={() => handleDelete(doctor.id)}
                >
                  {t('actions.delete')}
                </Button>
              ) : null}
            </div>
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
        {isAdmin ? (
          <Button onClick={() => navigate('/app/doctors/new')}>{t('actions.create')}</Button>
        ) : null}
      </div>

      <Card
        title={t('list.resultsTitle')}
        description={
          doctorsQuery.data
            ? t('list.results', { count: doctorsQuery.data.length })
            : t('list.resultsDescription')
        }
      >
        <div className="space-y-4">
          {doctorsQuery.isFetching && !doctorsQuery.isLoading ? (
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
