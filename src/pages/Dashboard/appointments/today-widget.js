import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTodayAppointments } from '@/domain/appointments/appointments.hooks';
import { formatAppointmentDate, getAppointmentApiMessage, getAppointmentDoctorName, getAppointmentPatientName, getAppointmentStatusVariant, getTodayDateValue, } from '@/domain/appointments/appointments.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
export default function TodayAppointmentsWidget() {
    const { t, i18n } = useTranslation('appointments');
    const navigate = useNavigate();
    const appointmentsQuery = useTodayAppointments();
    const appointments = appointmentsQuery.data ?? [];
    const items = appointments.slice(0, 5);
    let content = null;
    if (appointmentsQuery.isLoading) {
        content = _jsx("p", { className: "text-sm text-muted-foreground", children: t('widget.loading') });
    }
    else if (appointmentsQuery.error) {
        content = (_jsxs("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: [_jsx("div", { children: getAppointmentApiMessage(appointmentsQuery.error, t('errors.today')) }), _jsx(Button, { size: "sm", variant: "outline", className: "mt-3", onClick: () => appointmentsQuery.refetch(), children: t('actions.retry') })] }));
    }
    else if (!appointments.length) {
        content = (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/45 px-4 py-5", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: t('widget.emptyTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('widget.emptyDescription') })] }));
    }
    else {
        content = (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "rounded-2xl border border-primary/15 bg-primary/5 px-4 py-4", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: t('widget.countLabel') }), _jsx("p", { className: "mt-1 text-3xl font-bold text-foreground", children: appointments.length })] }), items.map((appointment) => (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/45 p-4", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: getAppointmentPatientName(appointment.patient) }), _jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [getAppointmentDoctorName(appointment.doctor), " \u00B7 ", appointment.appointmentTime] })] }), _jsx(Badge, { variant: getAppointmentStatusVariant(appointment.status), children: t(`statuses.${appointment.status}`) })] }), _jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: formatAppointmentDate(appointment.appointmentDate, i18n.language) })] }, appointment.id)))] }));
    }
    return (_jsx(Card, { title: t('widget.title'), description: t('widget.description'), footer: _jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/app/appointments?date=${encodeURIComponent(getTodayDateValue())}`), children: t('actions.viewToday') }), children: content }));
}
