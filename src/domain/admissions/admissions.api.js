import { api } from '@/libs/axios/client';
const BASE = '/api/admissions';
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
function buildAdmissionsQuery(params = {}) {
    const query = new URLSearchParams();
    if (params.status?.trim()) {
        query.set('status', params.status.trim());
    }
    return query.toString();
}
function buildAdmissionsUrl(path, params = {}) {
    const query = buildAdmissionsQuery(params);
    return query ? `${path}?${query}` : path;
}
export const AdmissionsApi = {
    list: (params = {}) => api.core
        .get(buildAdmissionsUrl(BASE, params))
        .then((response) => normalizeList(response.data)),
    active: () => api.core
        .get(`${BASE}/active`)
        .then((response) => normalizeList(response.data)),
    create: (payload) => api.core.post(BASE, payload).then((response) => response.data),
    discharge: (id) => api.core.put(`${BASE}/${id}/discharge`).then((response) => response.data),
};
