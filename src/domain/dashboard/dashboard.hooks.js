import { useQuery } from '@tanstack/react-query';
import { DashboardApi } from './dashboard.api';
export const dashboardKeys = {
    all: ['dashboard'],
    stats: () => [...dashboardKeys.all, 'stats'],
    todayAppointments: () => [...dashboardKeys.all, 'today-appointments'],
    activeAdmissions: () => [...dashboardKeys.all, 'active-admissions'],
};
const refetchInterval = 60000;
export function useDashboardStats() {
    return useQuery({
        queryKey: dashboardKeys.stats(),
        queryFn: DashboardApi.stats,
        refetchInterval,
    });
}
export function useDashboardTodayAppointments() {
    return useQuery({
        queryKey: dashboardKeys.todayAppointments(),
        queryFn: DashboardApi.todayAppointments,
        refetchInterval,
    });
}
export function useDashboardActiveAdmissions() {
    return useQuery({
        queryKey: dashboardKeys.activeAdmissions(),
        queryFn: DashboardApi.activeAdmissions,
        refetchInterval,
    });
}
