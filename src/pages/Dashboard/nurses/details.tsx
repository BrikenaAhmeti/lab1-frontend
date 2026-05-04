import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDeleteNurse, useNurse } from '@/domain/nurses/nurses.hooks';
import {
  formatNurseDate,
  getNurseApiMessage,
  getNurseApiStatus,
  getNurseFullName,
  getNurseShiftBadgeVariant,
  isKnownNurseShift,
  normalizeNurseShift,
} from '@/domain/nurses/nurses.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import NurseStateCard from './state-card';

export default function NurseDetailsPage() {
  const { t, i18n } = useTranslation('nurses');
  const navigate = useNavigate();
  const location = useLocation();
  const { id = '' } = useParams();
  const nurseQuery = useNurse(id);
  const deleteNurse = useDeleteNurse();
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const status = getNurseApiStatus(nurseQuery.error);
  const nurse = nurseQuery.data;

  useEffect(() => {
    const successMessage = (location.state as { success?: string } | null)?.success;

    if (typeof successMessage !== 'string' || !successMessage.trim()) {
      return;
    }

    setActionSuccess(successMessage);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const getShiftLabel = (value: string) => {
    const normalized = normalizeNurseShift(value);

    if (isKnownNurseShift(normalized)) {
      return t(`shifts.${normalized}`);
    }

    return value || t('labels.notAvailable');
  };

  const handleDelete = async () => {
    if (!window.confirm(t('details.deleteConfirm'))) {
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      await deleteNurse.mutateAsync(id);
      navigate('/app/nurses', {
        replace: true,
        state: { success: t('messages.deleted') },
      });
    } catch (error: unknown) {
      setActionError(getNurseApiMessage(error, t('errors.delete')));
    }
  };

  if (nurseQuery.isLoading) {
    return (
      <NurseStateCard
        title={t('states.loadingNurseTitle')}
        description={t('states.loadingNurseDescription')}
      />
    );
  }

  if (status === 401) {
    return (
      <NurseStateCard
        title={t('states.unauthorizedTitle')}
        description={t('states.unauthorizedDescription')}
      />
    );
  }

  if (status === 403) {
    return (
      <NurseStateCard
        title={t('states.forbiddenTitle')}
        description={t('states.forbiddenDescription')}
      />
    );
  }

  if (status === 404) {
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

  if (nurseQuery.error || !nurse) {
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

  const fields = [
    { label: t('fields.firstName'), value: nurse.firstName },
    { label: t('fields.lastName'), value: nurse.lastName },
    { label: t('fields.department'), value: nurse.department?.name || t('labels.noDepartment') },
    {
      label: t('fields.departmentLocation'),
      value: nurse.department?.location || t('labels.notAvailable'),
    },
    {
      label: t('fields.createdAt'),
      value: formatNurseDate(nurse.createdAt, i18n.language) || t('labels.notAvailable'),
    },
    {
      label: t('fields.updatedAt'),
      value: formatNurseDate(nurse.updatedAt, i18n.language) || t('labels.notAvailable'),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              {getNurseFullName(nurse)}
            </h1>
            <Badge variant={getNurseShiftBadgeVariant(nurse.shift)}>
              {getShiftLabel(nurse.shift)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t('details.description')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/app/nurses')}>
            {t('actions.back')}
          </Button>
          {nurse.departmentId ? (
            <Button variant="ghost" onClick={() => navigate(`/app/departments/${nurse.departmentId}`)}>
              {t('actions.viewDepartment')}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => navigate(`/app/nurses/${nurse.id}/edit`)}>
            {t('actions.edit')}
          </Button>
          <Button variant="danger" loading={deleteNurse.isPending} onClick={handleDelete}>
            {t('actions.delete')}
          </Button>
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
                {t('fields.shift')}
              </p>
              <p className="mt-1 break-words text-sm text-foreground">{getShiftLabel(nurse.shift)}</p>
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
    </section>
  );
}
