import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import Card from '@/ui/atoms/Card';
import { commonCopy } from '../copy';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchArrayWithFallback } from '../lib/api';
import { formatDate, formatPersonName, getValue } from '../lib/utils';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
async function getTodayAppointments() {
    return fetchArrayWithFallback(['/api/dashboard/appointments/today', '/api/appointments/today']);
}
async function getAvailableRooms() {
    return fetchArrayWithFallback(['/api/dashboard/rooms/available', '/api/rooms/available']);
}
async function getActiveAdmissions() {
    return fetchArrayWithFallback(['/api/dashboard/admissions/active', '/api/admissions/active']);
}
export default function DashboardPage() {
    const { language, t } = useLanguage();
    const todayAppointments = useQuery({
        queryKey: ['dashboard', 'appointments-today'],
        queryFn: getTodayAppointments,
    });
    const availableRooms = useQuery({
        queryKey: ['dashboard', 'available-rooms'],
        queryFn: getAvailableRooms,
    });
    const activeAdmissions = useQuery({
        queryKey: ['dashboard', 'active-admissions'],
        queryFn: getActiveAdmissions,
    });
    const summaryCards = [
        {
            title: t(commonCopy.todayAppointments),
            value: todayAppointments.data?.length ?? 0,
        },
        {
            title: t(commonCopy.availableRooms),
            value: availableRooms.data?.length ?? 0,
        },
        {
            title: t(commonCopy.activeAdmissions),
            value: activeAdmissions.data?.length ?? 0,
        },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: t(commonCopy.dashboard), description: t(commonCopy.appSubtitle) }), _jsx("div", { className: "grid gap-4 md:grid-cols-3", children: summaryCards.map((card) => (_jsx(Card, { title: card.title, children: _jsx("div", { className: "text-3xl font-bold text-foreground", children: card.value }) }, card.title))) }), _jsxs("div", { className: "grid gap-6 xl:grid-cols-3", children: [_jsx(Card, { title: t(commonCopy.todayAppointments), children: todayAppointments.isLoading ? (_jsx("div", { className: "space-y-3", children: Array.from({ length: 3 }).map((_, index) => (_jsx("div", { className: "h-16 animate-pulse rounded-2xl bg-muted" }, index))) })) : todayAppointments.data?.length ? (_jsx("div", { className: "space-y-3", children: todayAppointments.data.map((appointment) => (_jsxs("div", { className: "rounded-2xl border border-border bg-background/60 p-4", children: [_jsx("p", { className: "font-semibold text-foreground", children: formatPersonName(getValue(appointment, 'patient')) || getValue(appointment, 'patient_name') }), _jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [formatDate(String(getValue(appointment, 'date', 'appointmentDate')), language), " \u00B7", ' ', String(getValue(appointment, 'time', 'appointmentTime'))] }), _jsx("p", { className: "mt-2 text-sm text-foreground", children: formatPersonName(getValue(appointment, 'doctor')) || getValue(appointment, 'doctor_name') })] }, String(appointment.id)))) })) : (_jsx(EmptyState, { title: t(commonCopy.emptyTitle), description: t(commonCopy.noItems) })) }), _jsx(Card, { title: t(commonCopy.availableRooms), children: availableRooms.isLoading ? (_jsx("div", { className: "space-y-3", children: Array.from({ length: 3 }).map((_, index) => (_jsx("div", { className: "h-16 animate-pulse rounded-2xl bg-muted" }, index))) })) : availableRooms.data?.length ? (_jsx("div", { className: "space-y-3", children: availableRooms.data.map((room) => (_jsxs("div", { className: "rounded-2xl border border-border bg-background/60 p-4", children: [_jsx("p", { className: "font-semibold text-foreground", children: String(getValue(room, 'room_number', 'roomNumber')) }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: String(getValue(room, 'type')) }), _jsx("p", { className: "mt-2 text-sm text-foreground", children: String(getValue(room, 'department.name', 'departmentName')) || t(commonCopy.notAvailable) })] }, String(room.id)))) })) : (_jsx(EmptyState, { title: t(commonCopy.emptyTitle), description: t(commonCopy.noItems) })) }), _jsx(Card, { title: t(commonCopy.activeAdmissions), children: activeAdmissions.isLoading ? (_jsx("div", { className: "space-y-3", children: Array.from({ length: 3 }).map((_, index) => (_jsx("div", { className: "h-16 animate-pulse rounded-2xl bg-muted" }, index))) })) : activeAdmissions.data?.length ? (_jsx("div", { className: "space-y-3", children: activeAdmissions.data.map((admission) => (_jsxs("div", { className: "rounded-2xl border border-border bg-background/60 p-4", children: [_jsx("p", { className: "font-semibold text-foreground", children: formatPersonName(getValue(admission, 'patient')) || getValue(admission, 'patient_name') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: String(getValue(admission, 'room.room_number', 'roomNumber', 'room_id')) }), _jsx("p", { className: "mt-2 text-sm text-foreground", children: formatDate(String(getValue(admission, 'admission_date', 'admitted_at', 'admissionDate', 'admittedAt')), language) })] }, String(admission.id)))) })) : (_jsx(EmptyState, { title: t(commonCopy.emptyTitle), description: t(commonCopy.noItems) })) })] })] }));
}
