import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppointments } from '@/domain/appointments/appointments.hooks';
import { formatAppointmentDate, getAppointmentApiMessage, getAppointmentDoctorName, getAppointmentPatientName, getAppointmentStatusVariant, getTodayDateValue, } from '@/domain/appointments/appointments.utils';
import { useDoctors } from '@/domain/doctors/doctors.hooks';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
function getDoctorDepartmentLabel(name, location) {
    return location.trim() ? `${name} (${location})` : name;
}
export default function RelatedAppointmentsCard({ patientId, doctorId, }) {
    const { t, i18n } = useTranslation('appointments');
    const navigate = useNavigate();
    const appointmentsQuery = useAppointments({ patientId, doctorId });
    const doctorsQuery = useDoctors();
    const doctorMap = new Map((doctorsQuery.data ?? []).map((doctor) => [doctor.id, doctor]));
    const isDoctorView = !!doctorId;
    const results = appointmentsQuery.data ?? [];
    const upcoming = results.slice(0, 5);
    let content = null;
    if (appointmentsQuery.isLoading) {
        content = _jsx("p", { className: "text-sm text-muted-foreground", children: t('related.loading') });
    }
    else if (appointmentsQuery.error) {
        content = (_jsxs("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: [_jsx("div", { children: getAppointmentApiMessage(appointmentsQuery.error, t('errors.list')) }), _jsx(Button, { size: "sm", variant: "outline", className: "mt-3", onClick: () => appointmentsQuery.refetch(), children: t('actions.retry') })] }));
    }
    else if (!results.length) {
        content = (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/45 px-4 py-5", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: t('related.emptyTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('related.emptyDescription') })] }));
    }
    else {
        content = (_jsx("div", { className: "space-y-3", children: upcoming.map((appointment) => {
                const doctor = doctorMap.get(appointment.doctorId);
                const departmentLabel = doctor?.department
                    ? getDoctorDepartmentLabel(doctor.department.name, doctor.department.location)
                    : '';
                return (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/45 p-4", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: isDoctorView
                                                ? getAppointmentPatientName(appointment.patient)
                                                : getAppointmentDoctorName(appointment.doctor) }), _jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [formatAppointmentDate(appointment.appointmentDate, i18n.language), " \u00B7", ' ', appointment.appointmentTime] })] }), _jsx(Badge, { variant: getAppointmentStatusVariant(appointment.status), children: t(`statuses.${appointment.status}`) })] }), _jsxs("div", { className: "mt-3 grid gap-3 text-sm sm:grid-cols-2", children: [isDoctorView ? null : (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.specialization') }), _jsx("p", { className: "mt-1 text-foreground", children: appointment.doctor.specialization })] })), departmentLabel ? (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.department') }), _jsx("p", { className: "mt-1 text-foreground", children: departmentLabel })] })) : null] }), _jsx("div", { className: "mt-3 flex flex-wrap gap-2", children: _jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/app/appointments/${appointment.id}`), children: t('actions.view') }) })] }, appointment.id));
            }) }));
    }
    return (_jsx(Card, { title: isDoctorView ? t('related.doctorTitle') : t('related.patientTitle'), description: t('related.count', { count: results.length }), footer: _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { size: "sm", variant: "secondary", onClick: () => navigate('/app/appointments/new', {
                        state: {
                            patientId: patientId ?? '',
                            doctorId: doctorId ?? '',
                            date: getTodayDateValue(),
                        },
                    }), children: t('actions.create') }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/app/appointments?${patientId ? `patientId=${encodeURIComponent(patientId)}` : `doctorId=${encodeURIComponent(doctorId ?? '')}`}`), children: t('actions.viewAll') })] }), children: content }));
}
