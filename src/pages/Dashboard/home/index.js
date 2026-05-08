import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { formatAdmissionDate, getAdmissionApiMessage, getAdmissionDateValue, getAdmissionPatientName, getAdmissionRoomLabel, getAdmissionStatusVariant, isKnownAdmissionStatus, normalizeAdmissionStatus, } from '@/domain/admissions/admissions.utils';
import { useDashboardActiveAdmissions, useDashboardStats, useDashboardTodayAppointments, } from '@/domain/dashboard/dashboard.hooks';
import { formatAppointmentDate, getAppointmentApiMessage, getAppointmentDoctorName, getAppointmentPatientName, getAppointmentStatusVariant, getTodayDateValue, } from '@/domain/appointments/appointments.utils';
import { formatCurrency } from '@/utils/formatters/currency';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
function SummaryCard({ title, value }) {
    return (_jsx(Card, { title: title, className: "h-full", children: _jsx("p", { className: "text-3xl font-bold text-foreground", children: value }) }));
}
function getLocale(language) {
    return language === 'de' ? 'de-DE' : 'en-US';
}
function formatCount(value, locale) {
    return new Intl.NumberFormat(locale).format(value);
}
function getDaysAdmitted(value) {
    if (!value) {
        return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }
    const difference = Date.now() - date.getTime();
    return String(Math.max(0, Math.floor(difference / (1000 * 60 * 60 * 24))));
}
export default function Home() {
    const { t, i18n } = useTranslation(['dashboard', 'appointments', 'admissions']);
    const navigate = useNavigate();
    const statsQuery = useDashboardStats();
    const appointmentsQuery = useDashboardTodayAppointments();
    const admissionsQuery = useDashboardActiveAdmissions();
    const locale = getLocale(i18n.language);
    const stats = statsQuery.data;
    const summaryCards = [
        {
            title: t('dashboard:summary.appointmentsToday'),
            value: statsQuery.isLoading
                ? t('dashboard:summary.loading')
                : statsQuery.error
                    ? t('dashboard:summary.unavailable')
                    : formatCount(stats?.appointmentsToday ?? 0, locale),
        },
        {
            title: t('dashboard:summary.availableRooms'),
            value: statsQuery.isLoading
                ? t('dashboard:summary.loading')
                : statsQuery.error
                    ? t('dashboard:summary.unavailable')
                    : formatCount(stats?.availableRooms ?? 0, locale),
        },
        {
            title: t('dashboard:summary.admittedPatients'),
            value: statsQuery.isLoading
                ? t('dashboard:summary.loading')
                : statsQuery.error
                    ? t('dashboard:summary.unavailable')
                    : formatCount(stats?.admittedPatients ?? 0, locale),
        },
        {
            title: t('dashboard:summary.totalPatients'),
            value: statsQuery.isLoading
                ? t('dashboard:summary.loading')
                : statsQuery.error
                    ? t('dashboard:summary.unavailable')
                    : formatCount(stats?.totalPatients ?? 0, locale),
        },
        {
            title: t('dashboard:summary.totalDoctors'),
            value: statsQuery.isLoading
                ? t('dashboard:summary.loading')
                : statsQuery.error
                    ? t('dashboard:summary.unavailable')
                    : formatCount(stats?.totalDoctors ?? 0, locale),
        },
        {
            title: t('dashboard:summary.pendingInvoices'),
            value: statsQuery.isLoading
                ? t('dashboard:summary.loading')
                : statsQuery.error
                    ? t('dashboard:summary.unavailable')
                    : formatCurrency(stats?.pendingInvoicesAmount ?? 0, 'EUR', locale),
        },
    ];
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: t('dashboard:title') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('dashboard:description') })] }), _jsx(Badge, { variant: "secondary", children: t('dashboard:badge') })] }), statsQuery.error ? (_jsxs("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: [_jsx("div", { children: t('dashboard:summary.error') }), _jsx(Button, { size: "sm", variant: "outline", className: "mt-3", onClick: () => statsQuery.refetch(), children: t('dashboard:actions.retry') })] })) : null, (statsQuery.isFetching || appointmentsQuery.isFetching || admissionsQuery.isFetching) &&
                !(statsQuery.isLoading || appointmentsQuery.isLoading || admissionsQuery.isLoading) ? (_jsx("p", { className: "text-sm text-muted-foreground", children: t('dashboard:sections.refreshing') })) : null, _jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: summaryCards.map((card) => (_jsx(SummaryCard, { title: card.title, value: card.value }, card.title))) }), _jsxs("div", { className: "grid gap-6 xl:grid-cols-2", children: [_jsx(Card, { title: t('dashboard:sections.appointmentsTitle'), description: t('dashboard:sections.appointmentsDescription'), footer: _jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/app/appointments?date=${encodeURIComponent(getTodayDateValue())}`), children: t('dashboard:actions.viewAppointments') }), children: appointmentsQuery.isLoading ? (_jsx("p", { className: "text-sm text-muted-foreground", children: t('dashboard:states.loading') })) : appointmentsQuery.error ? (_jsxs("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: [_jsx("div", { children: getAppointmentApiMessage(appointmentsQuery.error, t('dashboard:states.appointmentsError')) }), _jsx(Button, { size: "sm", variant: "outline", className: "mt-3", onClick: () => appointmentsQuery.refetch(), children: t('dashboard:actions.retry') })] })) : !appointmentsQuery.data?.length ? (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/45 px-4 py-5", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: t('dashboard:states.appointmentsEmptyTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('dashboard:states.appointmentsEmptyDescription') })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-[640px] w-full text-left text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border/70 text-muted-foreground", children: [_jsx("th", { className: "px-3 py-3 font-medium", children: t('dashboard:fields.time') }), _jsx("th", { className: "px-3 py-3 font-medium", children: t('dashboard:fields.patient') }), _jsx("th", { className: "px-3 py-3 font-medium", children: t('dashboard:fields.doctor') }), _jsx("th", { className: "px-3 py-3 font-medium", children: t('dashboard:fields.specialization') }), _jsx("th", { className: "px-3 py-3 font-medium", children: t('dashboard:fields.status') })] }) }), _jsx("tbody", { children: appointmentsQuery.data.map((appointment) => (_jsxs("tr", { className: "border-b border-border/50 last:border-b-0", children: [_jsx("td", { className: "px-3 py-3 text-foreground", children: appointment.appointmentTime }), _jsxs("td", { className: "px-3 py-3", children: [_jsx("div", { className: "font-medium text-foreground", children: getAppointmentPatientName(appointment.patient) }), _jsx("div", { className: "text-xs text-muted-foreground", children: formatAppointmentDate(appointment.appointmentDate, i18n.language) })] }), _jsx("td", { className: "px-3 py-3 text-foreground", children: getAppointmentDoctorName(appointment.doctor) }), _jsx("td", { className: "px-3 py-3 text-foreground", children: appointment.doctor.specialization || t('dashboard:labels.notAvailable') }), _jsx("td", { className: "px-3 py-3", children: _jsx(Badge, { variant: getAppointmentStatusVariant(appointment.status), children: t(`appointments:statuses.${appointment.status}`) }) })] }, appointment.id))) })] }) })) }), _jsx(Card, { title: t('dashboard:sections.admissionsTitle'), description: t('dashboard:sections.admissionsDescription'), footer: _jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate('/app/admissions?status=ACTIVE'), children: t('dashboard:actions.viewAdmissions') }), children: admissionsQuery.isLoading ? (_jsx("p", { className: "text-sm text-muted-foreground", children: t('dashboard:states.loading') })) : admissionsQuery.error ? (_jsxs("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: [_jsx("div", { children: getAdmissionApiMessage(admissionsQuery.error, t('dashboard:states.admissionsError')) }), _jsx(Button, { size: "sm", variant: "outline", className: "mt-3", onClick: () => admissionsQuery.refetch(), children: t('dashboard:actions.retry') })] })) : !admissionsQuery.data?.length ? (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/45 px-4 py-5", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: t('dashboard:states.admissionsEmptyTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('dashboard:states.admissionsEmptyDescription') })] })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-[700px] w-full text-left text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border/70 text-muted-foreground", children: [_jsx("th", { className: "px-3 py-3 font-medium", children: t('dashboard:fields.patient') }), _jsx("th", { className: "px-3 py-3 font-medium", children: t('dashboard:fields.room') }), _jsx("th", { className: "px-3 py-3 font-medium", children: t('dashboard:fields.department') }), _jsx("th", { className: "px-3 py-3 font-medium", children: t('dashboard:fields.admittedOn') }), _jsx("th", { className: "px-3 py-3 font-medium", children: t('dashboard:fields.daysAdmitted') }), _jsx("th", { className: "px-3 py-3 font-medium", children: t('dashboard:fields.status') })] }) }), _jsx("tbody", { children: admissionsQuery.data.map((admission) => {
                                            const normalizedStatus = normalizeAdmissionStatus(admission.status);
                                            const admissionDateValue = getAdmissionDateValue(admission);
                                            const daysAdmitted = getDaysAdmitted(admissionDateValue);
                                            return (_jsxs("tr", { className: "border-b border-border/50 last:border-b-0", children: [_jsx("td", { className: "px-3 py-3 text-foreground", children: getAdmissionPatientName(admission.patient)
                                                            || t('dashboard:labels.notAvailable') }), _jsx("td", { className: "px-3 py-3 text-foreground", children: getAdmissionRoomLabel(admission.room)
                                                            || t('dashboard:labels.notAvailable') }), _jsx("td", { className: "px-3 py-3 text-foreground", children: admission.room?.department?.name || t('dashboard:labels.notAvailable') }), _jsx("td", { className: "px-3 py-3 text-foreground", children: formatAdmissionDate(admissionDateValue, i18n.language)
                                                            || t('dashboard:labels.notAvailable') }), _jsx("td", { className: "px-3 py-3 text-foreground", children: daysAdmitted
                                                            ? t('dashboard:labels.days', { count: Number(daysAdmitted) })
                                                            : t('dashboard:labels.notAvailable') }), _jsx("td", { className: "px-3 py-3", children: _jsx(Badge, { variant: getAdmissionStatusVariant(admission.status), children: isKnownAdmissionStatus(normalizedStatus)
                                                                ? t(`admissions:statuses.${normalizedStatus}`)
                                                                : admission.status || t('dashboard:labels.notAvailable') }) })] }, admission.id));
                                        }) })] }) })) })] })] }));
}
