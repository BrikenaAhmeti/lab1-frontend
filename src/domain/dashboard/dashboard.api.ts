import { api } from '@/libs/axios/client';
import type {
  DashboardActiveAdmission,
  DashboardStats,
  DashboardTodayAppointment,
} from './dashboard.types';

const BASE = '/api/dashboard';

export const DashboardApi = {
  stats: () => api.core.get<DashboardStats>(`${BASE}/stats`).then((response) => response.data),

  todayAppointments: () =>
    api.core
      .get<DashboardTodayAppointment[]>(`${BASE}/appointments/today`)
      .then((response) => response.data),

  activeAdmissions: () =>
    api.core
      .get<DashboardActiveAdmission[]>(`${BASE}/admissions/active`)
      .then((response) => response.data),
};
