import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useActiveAdmissions } from '@/domain/admissions/admissions.hooks';
import {
  formatAdmissionDate,
  getAdmissionApiMessage,
  getAdmissionDateValue,
  getAdmissionPatientName,
  getAdmissionRoomLabel,
  getAdmissionStatusVariant,
  isKnownAdmissionStatus,
  normalizeAdmissionStatus,
} from '@/domain/admissions/admissions.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import EmptyState from '@/ui/molecules/EmptyState';
import ListSkeleton from '@/ui/molecules/ListSkeleton';

export default function ActiveAdmissionsWidget() {
  const { t, i18n } = useTranslation('admissions');
  const navigate = useNavigate();
  const admissionsQuery = useActiveAdmissions();
  const admissions = admissionsQuery.data ?? [];
  const items = admissions.slice(0, 5);

  let content = null;

  if (admissionsQuery.isLoading) {
    content = <ListSkeleton items={2} />;
  } else if (admissionsQuery.error) {
    content = (
      <EmptyState
        compact
        tone="error"
        title={t('states.errorTitle')}
        description={getAdmissionApiMessage(admissionsQuery.error, t('errors.active'))}
        action={
          <Button size="sm" variant="outline" onClick={() => admissionsQuery.refetch()}>
            {t('actions.retry')}
          </Button>
        }
      />
    );
  } else if (!admissions.length) {
    content = (
      <EmptyState compact title={t('widget.emptyTitle')} description={t('widget.emptyDescription')} />
    );
  } else {
    content = (
      <div className="space-y-3">
        <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('widget.countLabel')}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{admissions.length}</p>
        </div>

        {items.map((admission) => {
          const patientName =
            getAdmissionPatientName(admission.patient) || t('labels.notAvailable');
          const roomLabel = getAdmissionRoomLabel(admission.room) || t('labels.notAvailable');
          const normalizedStatus = normalizeAdmissionStatus(admission.status);

          return (
            <div
              key={admission.id}
              className="rounded-2xl border border-border/70 bg-background/45 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{patientName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{roomLabel}</p>
                </div>
                <Badge variant={getAdmissionStatusVariant(admission.status)}>
                  {isKnownAdmissionStatus(normalizedStatus)
                    ? t(`statuses.${normalizedStatus}`)
                    : admission.status || t('labels.notAvailable')}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {formatAdmissionDate(getAdmissionDateValue(admission), i18n.language)
                  || t('labels.notAvailable')}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card
      title={t('widget.title')}
      description={t('widget.description')}
      footer={
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/app/admissions?status=ACTIVE')}
        >
          {t('actions.viewActive')}
        </Button>
      }
    >
      {content}
    </Card>
  );
}
