import { useQuery } from '@tanstack/react-query';
import { DashboardApi } from './dashboard.api';
import type {
  DashboardActiveAdmission,
  DashboardStats,
  DashboardTodayAppointment,
} from './dashboard.types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  todayAppointments: () => [...dashboardKeys.all, 'today-appointments'] as const,
  activeAdmissions: () => [...dashboardKeys.all, 'active-admissions'] as const,
};

const refetchInterval = 60000;

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: dashboardKeys.stats(),
    queryFn: DashboardApi.stats,
    refetchInterval,
  });
}

export function useDashboardTodayAppointments() {
  return useQuery<DashboardTodayAppointment[]>({
    queryKey: dashboardKeys.todayAppointments(),
    queryFn: DashboardApi.todayAppointments,
    refetchInterval,
  });
}

export function useDashboardActiveAdmissions() {
  return useQuery<DashboardActiveAdmission[]>({
    queryKey: dashboardKeys.activeAdmissions(),
    queryFn: DashboardApi.activeAdmissions,
    refetchInterval,
  });
}
