import { api } from '@/libs/axios/client';
const BASE = '/api/appointments';
function buildAppointmentsQuery(params = {}) {
    const query = new URLSearchParams();
    if (params.date?.trim()) {
        query.set('date', params.date.trim());
    }
    if (params.doctorId?.trim()) {
        query.set('doctorId', params.doctorId.trim());
    }
    if (params.patientId?.trim()) {
        query.set('patientId', params.patientId.trim());
    }
    if (params.status?.trim()) {
        query.set('status', params.status.trim());
    }
    const value = query.toString();
    return value ? `?${value}` : '';
}
export const AppointmentsApi = {
    list: (params = {}) => api.core.get(`${BASE}${buildAppointmentsQuery(params)}`).then((r) => r.data),
    today: () => api.core.get(`${BASE}/today`).then((r) => r.data),
    get: (id) => api.core.get(`${BASE}/${id}`).then((r) => r.data),
    create: (payload) => api.core.post(BASE, payload).then((r) => r.data),
    update: (id, payload) => api.core.put(`${BASE}/${id}`, payload).then((r) => r.data),
    remove: (id) => api.core.delete(`${BASE}/${id}`).then(() => undefined),
};
