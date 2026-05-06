import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isDoctorOrAdminUser } from '@/domain/auth/role.utils';
import { useMedicalRecords } from '@/domain/medical-records/medical-records.hooks';
import { getMedicalRecordApiMessage } from '@/domain/medical-records/medical-records.utils';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import MedicalRecordItem from './record-item';
export default function RelatedMedicalRecordsCard({ patientId, }) {
    const { t } = useTranslation('medicalRecords');
    const navigate = useNavigate();
    const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
    const canManage = isDoctorOrAdminUser(roles);
    const recordsQuery = useMedicalRecords(patientId);
    const records = recordsQuery.data ?? [];
    const recentRecords = records.slice(0, 3);
    let content = null;
    if (recordsQuery.isLoading) {
        content = _jsx("p", { className: "text-sm text-muted-foreground", children: t('related.loading') });
    }
    else if (recordsQuery.error) {
        content = (_jsxs("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: [_jsx("div", { children: getMedicalRecordApiMessage(recordsQuery.error, t('errors.list')) }), _jsx(Button, { size: "sm", variant: "outline", className: "mt-3", onClick: () => recordsQuery.refetch(), children: t('actions.retry') })] }));
    }
    else if (!records.length) {
        content = (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/45 px-4 py-5", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: t('related.emptyTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('related.emptyDescription') })] }));
    }
    else {
        content = (_jsx("div", { className: "space-y-3", children: recentRecords.map((record) => (_jsx(MedicalRecordItem, { record: record }, record.id))) }));
    }
    return (_jsx(Card, { title: t('related.patientTitle'), description: t('related.count', { count: records.length }), footer: _jsxs("div", { className: "flex flex-wrap gap-2", children: [canManage ? (_jsx(Button, { size: "sm", variant: "secondary", onClick: () => navigate(`/app/medical-records/new?patientId=${encodeURIComponent(patientId)}`), children: t('actions.create') })) : null, _jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/app/medical-records?patientId=${encodeURIComponent(patientId)}`), children: t('actions.viewAll') })] }), children: content }));
}
