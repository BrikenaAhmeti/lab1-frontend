import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { formatMedicalRecordDate, getMedicalRecordDoctorName, } from '@/domain/medical-records/medical-records.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import PrescriptionPanel from './prescription-panel';
export default function MedicalRecordItem({ record, canManage = false, deleting = false, onEdit, onDelete, showPatientLink = false, }) {
    const { t, i18n } = useTranslation('medicalRecords');
    const navigate = useNavigate();
    const [showPrescriptions, setShowPrescriptions] = useState(false);
    const doctorName = getMedicalRecordDoctorName(record.doctor) || t('labels.notAvailable');
    return (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/50 p-4", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("h2", { className: "truncate text-lg font-semibold text-foreground", children: record.diagnosis }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: doctorName })] }), _jsx(Badge, { variant: "secondary", children: formatMedicalRecordDate(record.recordDate, i18n.language) })] }), _jsxs("div", { className: "mt-4 grid gap-4 md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.treatment') }), _jsx("p", { className: "mt-1 whitespace-pre-wrap break-words text-sm text-foreground", children: record.treatment })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.prescriptionsText') }), _jsx("p", { className: "mt-1 whitespace-pre-wrap break-words text-sm text-foreground", children: record.prescriptionsText?.trim() || t('labels.noPrescriptionsText') })] })] }), _jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [showPatientLink ? (_jsx(Button, { size: "sm", variant: "ghost", onClick: () => navigate(`/app/patients/${record.patientId}`), children: t('actions.viewPatient') })) : null, _jsx(Button, { size: "sm", variant: "outline", onClick: () => setShowPrescriptions((current) => !current), children: showPrescriptions ? t('actions.hidePrescriptions') : t('actions.showPrescriptions') }), canManage && onEdit ? (_jsx(Button, { size: "sm", variant: "secondary", onClick: () => onEdit(record), children: t('actions.edit') })) : null, canManage && onDelete ? (_jsx(Button, { size: "sm", variant: "danger", loading: deleting, onClick: () => onDelete(record), children: t('actions.delete') })) : null] }), showPrescriptions ? (_jsx(PrescriptionPanel, { medicalRecordId: record.id, canManage: canManage })) : null] }));
}
