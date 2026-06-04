import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isDoctorOrAdminUser } from '@/domain/auth/role.utils';
import { useMedicalRecords } from '@/domain/medical-records/medical-records.hooks';
import { getMedicalRecordApiMessage } from '@/domain/medical-records/medical-records.utils';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import EmptyState from '@/ui/molecules/EmptyState';
import ListSkeleton from '@/ui/molecules/ListSkeleton';
import MedicalRecordItem from './record-item';

type RelatedMedicalRecordsCardProps = {
  patientId: string;
};

export default function RelatedMedicalRecordsCard({
  patientId,
}: RelatedMedicalRecordsCardProps) {
  const { t } = useTranslation('medicalRecords');
  const navigate = useNavigate();
  const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
  const canManage = isDoctorOrAdminUser(roles);
  const recordsQuery = useMedicalRecords(patientId);
  const records = recordsQuery.data ?? [];
  const recentRecords = records.slice(0, 3);

  let content = null;

  if (recordsQuery.isLoading) {
    content = <ListSkeleton items={2} />;
  } else if (recordsQuery.error) {
    content = (
      <EmptyState
        compact
        tone="error"
        title={t('states.errorTitle')}
        description={getMedicalRecordApiMessage(recordsQuery.error, t('errors.list'))}
        action={
          <Button size="sm" variant="outline" onClick={() => recordsQuery.refetch()}>
            {t('actions.retry')}
          </Button>
        }
      />
    );
  } else if (!records.length) {
    content = (
      <EmptyState compact title={t('related.emptyTitle')} description={t('related.emptyDescription')} />
    );
  } else {
    content = (
      <div className="space-y-3">
        {recentRecords.map((record) => (
          <MedicalRecordItem key={record.id} record={record} />
        ))}
      </div>
    );
  }

  return (
    <Card
      title={t('related.patientTitle')}
      description={t('related.count', { count: records.length })}
      footer={
        <div className="flex flex-wrap gap-2">
          {canManage ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                navigate(`/medical-records/new?patientId=${encodeURIComponent(patientId)}`)
              }
            >
              {t('actions.create')}
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              navigate(`/medical-records?patientId=${encodeURIComponent(patientId)}`)
            }
          >
            {t('actions.viewAll')}
          </Button>
        </div>
      }
    >
      {content}
    </Card>
  );
}
