import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { MedicalRecord } from '@/domain/medical-records/medical-records.types';
import {
  formatMedicalRecordDate,
  getMedicalRecordDoctorName,
} from '@/domain/medical-records/medical-records.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import PrescriptionPanel from './prescription-panel';

type MedicalRecordItemProps = {
  record: MedicalRecord;
  canManage?: boolean;
  deleting?: boolean;
  onEdit?: (record: MedicalRecord) => void;
  onDelete?: (record: MedicalRecord) => void;
  showPatientLink?: boolean;
};

export default function MedicalRecordItem({
  record,
  canManage = false,
  deleting = false,
  onEdit,
  onDelete,
  showPatientLink = false,
}: MedicalRecordItemProps) {
  const { t, i18n } = useTranslation('medicalRecords');
  const navigate = useNavigate();
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const doctorName = getMedicalRecordDoctorName(record.doctor) || t('labels.notAvailable');

  return (
    <div className="rounded-2xl border border-border/70 bg-background/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-foreground">{record.diagnosis}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{doctorName}</p>
        </div>
        <Badge variant="secondary">{formatMedicalRecordDate(record.recordDate, i18n.language)}</Badge>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('fields.treatment')}
          </p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">
            {record.treatment}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('fields.prescriptionsText')}
          </p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">
            {record.prescriptionsText?.trim() || t('labels.noPrescriptionsText')}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {showPatientLink ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/app/patients/${record.patientId}`)}
          >
            {t('actions.viewPatient')}
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowPrescriptions((current) => !current)}
        >
          {showPrescriptions ? t('actions.hidePrescriptions') : t('actions.showPrescriptions')}
        </Button>
        {canManage && onEdit ? (
          <Button size="sm" variant="secondary" onClick={() => onEdit(record)}>
            {t('actions.edit')}
          </Button>
        ) : null}
        {canManage && onDelete ? (
          <Button
            size="sm"
            variant="danger"
            loading={deleting}
            onClick={() => onDelete(record)}
          >
            {t('actions.delete')}
          </Button>
        ) : null}
      </div>

      {showPrescriptions ? (
        <PrescriptionPanel medicalRecordId={record.id} canManage={canManage} />
      ) : null}
    </div>
  );
}
