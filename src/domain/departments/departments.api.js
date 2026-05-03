import { api } from '@/libs/axios/client';
const BASE = '/api/departments';
function getObjectList(value, key) {
    if (typeof value !== 'object' || value === null || !(key in value)) {
        return null;
    }
    const nestedValue = value[key];
    return Array.isArray(nestedValue) ? nestedValue : null;
}
function normalizeList(value) {
    if (Array.isArray(value)) {
        return value;
    }
    const items = getObjectList(value, 'items');
    if (items) {
        return items;
    }
    const data = getObjectList(value, 'data');
    if (data) {
        return data;
    }
    return [];
}
export const DepartmentsApi = {
    list: () => api.core.get(BASE).then((r) => normalizeList(r.data)),
    get: (id) => api.core.get(`${BASE}/${id}`).then((r) => r.data),
    create: (payload) => api.core.post(BASE, payload).then((r) => r.data),
    update: (id, payload) => api.core.put(`${BASE}/${id}`, payload).then((r) => r.data),
    remove: (id) => api.core.delete(`${BASE}/${id}`).then(() => undefined),
    doctors: (id) => api.core
        .get(`${BASE}/${id}/doctors`)
        .then((r) => normalizeList(r.data)),
    rooms: (id) => api.core
        .get(`${BASE}/${id}/rooms`)
        .then((r) => normalizeList(r.data)),
};
