import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useActiveAdmissions } from '@/domain/admissions/admissions.hooks';
import { formatAdmissionDate, getAdmissionApiMessage, getAdmissionDateValue, getAdmissionPatientName, getAdmissionRoomLabel, getAdmissionStatusVariant, isKnownAdmissionStatus, normalizeAdmissionStatus, } from '@/domain/admissions/admissions.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
export default function ActiveAdmissionsWidget() {
    const { t, i18n } = useTranslation('admissions');
    const navigate = useNavigate();
    const admissionsQuery = useActiveAdmissions();
    const admissions = admissionsQuery.data ?? [];
    const items = admissions.slice(0, 5);
    let content = null;
    if (admissionsQuery.isLoading) {
        content = _jsx("p", { className: "text-sm text-muted-foreground", children: t('widget.loading') });
    }
    else if (admissionsQuery.error) {
        content = (_jsxs("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: [_jsx("div", { children: getAdmissionApiMessage(admissionsQuery.error, t('errors.active')) }), _jsx(Button, { size: "sm", variant: "outline", className: "mt-3", onClick: () => admissionsQuery.refetch(), children: t('actions.retry') })] }));
    }
    else if (!admissions.length) {
        content = (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/45 px-4 py-5", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: t('widget.emptyTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('widget.emptyDescription') })] }));
    }
    else {
        content = (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "rounded-2xl border border-success/20 bg-success/10 px-4 py-4", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: t('widget.countLabel') }), _jsx("p", { className: "mt-1 text-3xl font-bold text-foreground", children: admissions.length })] }), items.map((admission) => {
                    const patientName = getAdmissionPatientName(admission.patient) || t('labels.notAvailable');
                    const roomLabel = getAdmissionRoomLabel(admission.room) || t('labels.notAvailable');
                    const normalizedStatus = normalizeAdmissionStatus(admission.status);
                    return (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/45 p-4", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: patientName }), _jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: roomLabel })] }), _jsx(Badge, { variant: getAdmissionStatusVariant(admission.status), children: isKnownAdmissionStatus(normalizedStatus)
                                            ? t(`statuses.${normalizedStatus}`)
                                            : admission.status || t('labels.notAvailable') })] }), _jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: formatAdmissionDate(getAdmissionDateValue(admission), i18n.language)
                                    || t('labels.notAvailable') })] }, admission.id));
                })] }));
    }
    return (_jsx(Card, { title: t('widget.title'), description: t('widget.description'), footer: _jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate('/app/admissions?status=ACTIVE'), children: t('actions.viewActive') }), children: content }));
}
