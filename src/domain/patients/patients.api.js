import { api } from '@/libs/axios/client';
const BASE = '/api/patients';
function buildPatientsQuery(params) {
    const query = new URLSearchParams();
    query.set('page', String(params.page ?? 1));
    query.set('limit', String(params.limit ?? 10));
    if (params.search?.trim()) {
        query.set('search', params.search.trim());
    }
    return query.toString();
}
export const PatientsApi = {
    list: (params = {}) => api.core.get(`${BASE}?${buildPatientsQuery(params)}`).then((r) => r.data),
    get: (id) => api.core.get(`${BASE}/${id}`).then((r) => r.data),
    create: (payload) => api.core.post(BASE, payload).then((r) => r.data),
    update: (id, payload) => api.core.put(`${BASE}/${id}`, payload).then((r) => r.data),
    remove: (id) => api.core.delete(`${BASE}/${id}`).then(() => undefined),
};
