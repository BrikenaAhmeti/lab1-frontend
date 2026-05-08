import { api } from '@/libs/axios/client';
const BASE = '/api/dashboard';
export const DashboardApi = {
    stats: () => api.core.get(`${BASE}/stats`).then((response) => response.data),
    todayAppointments: () => api.core
        .get(`${BASE}/appointments/today`)
        .then((response) => response.data),
    activeAdmissions: () => api.core
        .get(`${BASE}/admissions/active`)
        .then((response) => response.data),
};
