import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import { commonCopy } from '../copy';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchArrayWithFallback } from '../lib/api';
import { formatDate, formatPersonName, getErrorMessage, getValue } from '../lib/utils';
import EmptyState from '../components/EmptyState';
import ListSkeleton from '../components/ListSkeleton';
import PageHeader from '../components/PageHeader';
const DASHBOARD_QUERY_STALE_TIME = 60_000;
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
        staleTime: DASHBOARD_QUERY_STALE_TIME,
    });
    const availableRooms = useQuery({
        queryKey: ['dashboard', 'available-rooms'],
        queryFn: getAvailableRooms,
        staleTime: DASHBOARD_QUERY_STALE_TIME,
    });
    const activeAdmissions = useQuery({
        queryKey: ['dashboard', 'active-admissions'],
        queryFn: getActiveAdmissions,
        staleTime: DASHBOARD_QUERY_STALE_TIME,
    });
    const summaryCards = useMemo(() => [
        {
            title: t(commonCopy.todayAppointments),
            value: todayAppointments.data?.length ?? 0,
            loading: todayAppointments.isLoading,
            hasError: Boolean(todayAppointments.error),
        },
        {
            title: t(commonCopy.availableRooms),
            value: availableRooms.data?.length ?? 0,
            loading: availableRooms.isLoading,
            hasError: Boolean(availableRooms.error),
        },
        {
            title: t(commonCopy.activeAdmissions),
            value: activeAdmissions.data?.length ?? 0,
            loading: activeAdmissions.isLoading,
            hasError: Boolean(activeAdmissions.error),
        },
    ], [
        activeAdmissions.data?.length,
        activeAdmissions.error,
        activeAdmissions.isLoading,
        availableRooms.data?.length,
        availableRooms.error,
        availableRooms.isLoading,
        t,
        todayAppointments.data?.length,
        todayAppointments.error,
        todayAppointments.isLoading,
    ]);
    const renderSectionState = (query, renderContent) => {
        if (query.isLoading) {
            return _jsx(ListSkeleton, {});
        }
        if (query.error) {
            return (_jsx(EmptyState, { compact: true, tone: "error", title: t(commonCopy.errorTitle), description: getErrorMessage(query.error, t), action: _jsx(Button, { variant: "outline", onClick: () => query.refetch(), children: t(commonCopy.retry) }) }));
        }
        if (!query.data?.length) {
            return _jsx(EmptyState, { compact: true, title: t(commonCopy.emptyTitle), description: t(commonCopy.noItems) });
        }
        return renderContent();
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(PageHeader, { title: t(commonCopy.dashboard), description: t(commonCopy.appSubtitle) }), _jsx("div", { className: "grid gap-4 md:grid-cols-3", children: summaryCards.map((card) => (_jsx(Card, { title: card.title, children: card.loading ? (_jsx("div", { "aria-hidden": "true", className: "h-10 w-16 animate-pulse rounded-2xl bg-muted" })) : (_jsx("div", { className: "text-3xl font-bold text-foreground", children: card.hasError ? '--' : card.value })) }, card.title))) }), _jsxs("div", { className: "grid gap-6 xl:grid-cols-3", children: [_jsx(Card, { title: t(commonCopy.todayAppointments), children: renderSectionState(todayAppointments, () => (_jsx("div", { className: "space-y-3", children: todayAppointments.data?.map((appointment) => (_jsxs("div", { className: "rounded-2xl border border-border bg-background/60 p-4", children: [_jsx("p", { className: "font-semibold text-foreground", children: formatPersonName(getValue(appointment, 'patient')) || getValue(appointment, 'patient_name') }), _jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [formatDate(String(getValue(appointment, 'date', 'appointmentDate')), language), " \u00B7", ' ', String(getValue(appointment, 'time', 'appointmentTime'))] }), _jsx("p", { className: "mt-2 text-sm text-foreground", children: formatPersonName(getValue(appointment, 'doctor')) || getValue(appointment, 'doctor_name') })] }, String(appointment.id)))) }))) }), _jsx(Card, { title: t(commonCopy.availableRooms), children: renderSectionState(availableRooms, () => (_jsx("div", { className: "space-y-3", children: availableRooms.data?.map((room) => (_jsxs("div", { className: "rounded-2xl border border-border bg-background/60 p-4", children: [_jsx("p", { className: "font-semibold text-foreground", children: String(getValue(room, 'room_number', 'roomNumber')) }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: String(getValue(room, 'type')) }), _jsx("p", { className: "mt-2 text-sm text-foreground", children: String(getValue(room, 'department.name', 'departmentName')) || t(commonCopy.notAvailable) })] }, String(room.id)))) }))) }), _jsx(Card, { title: t(commonCopy.activeAdmissions), children: renderSectionState(activeAdmissions, () => (_jsx("div", { className: "space-y-3", children: activeAdmissions.data?.map((admission) => (_jsxs("div", { className: "rounded-2xl border border-border bg-background/60 p-4", children: [_jsx("p", { className: "font-semibold text-foreground", children: formatPersonName(getValue(admission, 'patient')) || getValue(admission, 'patient_name') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: String(getValue(admission, 'room.room_number', 'roomNumber', 'room_id')) }), _jsx("p", { className: "mt-2 text-sm text-foreground", children: formatDate(String(getValue(admission, 'admission_date', 'admitted_at', 'admissionDate', 'admittedAt')), language) })] }, String(admission.id)))) }))) })] })] }));
}
