import { api } from '@/libs/axios/client';
const BASE = '/api/rooms';
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
function buildRoomsQuery(params = {}) {
    const query = new URLSearchParams();
    if (params.departmentId?.trim()) {
        query.set('departmentId', params.departmentId.trim());
    }
    if (params.type?.trim()) {
        query.set('type', params.type.trim());
    }
    return query.toString();
}
function buildRoomsUrl(path, params = {}) {
    const query = buildRoomsQuery(params);
    return query ? `${path}?${query}` : path;
}
export const RoomsApi = {
    list: (params = {}) => api.core.get(buildRoomsUrl(BASE, params)).then((r) => normalizeList(r.data)),
    available: (params = {}) => api.core
        .get(buildRoomsUrl(`${BASE}/available`, params))
        .then((r) => normalizeList(r.data)),
    get: (id) => api.core.get(`${BASE}/${id}`).then((r) => r.data),
    create: (payload) => api.core.post(BASE, payload).then((r) => r.data),
    update: (id, payload) => api.core.put(`${BASE}/${id}`, payload).then((r) => r.data),
    remove: (id) => api.core.delete(`${BASE}/${id}`).then(() => undefined),
};
