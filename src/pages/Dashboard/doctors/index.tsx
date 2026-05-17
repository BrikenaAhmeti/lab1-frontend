import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isAdminUser } from '@/domain/auth/role.utils';
import type { Doctor } from '@/domain/doctors/doctors.types';
import {
  useDeleteDoctor,
  useDoctors,
  useUpdateDoctorStatus,
} from '@/domain/doctors/doctors.hooks';
import {
  getDoctorApiMessage,
  getDoctorApiStatus,
  getDoctorFullName,
} from '@/domain/doctors/doctors.utils';
import Modal from '@/ui/molecules/Modal';
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
  const updateDoctorStatus = useUpdateDoctorStatus();
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [managedDoctors, setManagedDoctors] = useState<Doctor[]>([]);
  const [statusModalDoctor, setStatusModalDoctor] = useState<Doctor | null>(null);
  const status = getDoctorApiStatus(doctorsQuery.error);

  useEffect(() => {
    const successMessage = (location.state as { success?: string } | null)?.success;

    if (typeof successMessage !== 'string' || !successMessage.trim()) {
      return;
    }

    setActionSuccess(successMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!doctorsQuery.data) {
      return;
    }

    setManagedDoctors((current) => {
      const activeIds = new Set(doctorsQuery.data.map((doctor) => doctor.id));
      const retainedDisabled = current.filter((doctor) => !doctor.isActive && !activeIds.has(doctor.id));

      return [...doctorsQuery.data, ...retainedDisabled];
    });
  }, [doctorsQuery.data]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('details.deleteConfirm'))) {
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      await deleteDoctor.mutateAsync(id);
      setManagedDoctors((current) => current.filter((doctor) => doctor.id !== id));
      setActionSuccess(t('messages.removed'));
      doctorsQuery.refetch();
    } catch (error: unknown) {
      setActionError(getDoctorApiMessage(error, t('errors.delete')));
    }
  };

  const handleStatusChange = async (doctor: Doctor, isActive: boolean) => {
    setActionError('');
    setActionSuccess('');

    try {
      const updatedDoctor = await updateDoctorStatus.mutateAsync({ id: doctor.id, isActive });

      setManagedDoctors((current) => {
        const next = current.filter((item) => item.id !== updatedDoctor.id);
        return updatedDoctor.isActive ? [updatedDoctor, ...next] : [...next, updatedDoctor];
      });
      setActionSuccess(
        updatedDoctor.isActive ? t('messages.enabled') : t('messages.disabled')
      );
      setStatusModalDoctor(null);
      doctorsQuery.refetch();
    } catch (error: unknown) {
      setActionError(getDoctorApiMessage(error, t('errors.statusUpdate')));
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
  } else if (!managedDoctors.length) {
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
        {managedDoctors.map((doctor) => (
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
              <div className="flex flex-wrap gap-2">
                <Badge variant={doctor.isActive ? 'success' : 'danger'}>
                  {doctor.isActive ? t('labels.active') : t('labels.disabled')}
                </Badge>
                <Badge variant="secondary">{doctor.specialization}</Badge>
              </div>
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
                <>
                  <Button
                    size="sm"
                    variant={doctor.isActive ? 'outline' : 'secondary'}
                    loading={
                      updateDoctorStatus.isPending
                      && updateDoctorStatus.variables?.id === doctor.id
                      && updateDoctorStatus.variables?.isActive !== doctor.isActive
                    }
                    onClick={() =>
                      doctor.isActive
                        ? setStatusModalDoctor(doctor)
                        : handleStatusChange(doctor, true)
                    }
                  >
                    {doctor.isActive ? t('actions.disableDoctor') : t('actions.enableDoctor')}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    loading={deleteDoctor.isPending && deleteDoctor.variables === doctor.id}
                    onClick={() => handleDelete(doctor.id)}
                  >
                    {t('actions.delete')}
                  </Button>
                </>
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
          managedDoctors.length
            ? t('list.results', { count: managedDoctors.length })
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

      <Modal
        open={!!statusModalDoctor}
        title={t('modals.disableTitle')}
        description={t('modals.disableDescription')}
        onClose={() => setStatusModalDoctor(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {statusModalDoctor ? getDoctorFullName(statusModalDoctor) : ''}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStatusModalDoctor(null)}>
              {t('actions.cancel')}
            </Button>
            <Button
              variant="danger"
              loading={
                updateDoctorStatus.isPending && updateDoctorStatus.variables?.id === statusModalDoctor?.id
              }
              onClick={() =>
                statusModalDoctor ? handleStatusChange(statusModalDoctor, false) : undefined
              }
            >
              {t('actions.disableDoctor')}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
