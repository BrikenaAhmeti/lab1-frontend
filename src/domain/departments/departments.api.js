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
function buildListAllQuery(params) {
    const query = new URLSearchParams();
    const sortBy = params?.sortBy ?? 'name';
    const order = params?.order ?? 'ASC';
    query.set('sortBy', sortBy);
    query.set('order', order);
    return query.toString();
}
export const DepartmentsApi = {
    /** Paginated listing (tables). See `listAll` for dropdowns / filters. */
    list: (params) => {
        const query = new URLSearchParams();
        Object.entries(params ?? {}).forEach(([key, value]) => {
            if (value === undefined || value === null || String(value).trim() === '') {
                return;
            }
            query.set(key, String(value));
        });
        const suffix = query.toString();
        const url = suffix ? `${BASE}?${suffix}` : BASE;
        return api.core.get(url).then((r) => normalizeList(r.data));
    },
    /** Full list for selects (`GET /api/departments/all`). */
    listAll: (params) => {
        const qs = buildListAllQuery(params ?? {});
        return api.core.get(`${BASE}/all?${qs}`).then((r) => normalizeList(r.data));
    },
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
    nurses: (id) => api.core
        .get(`${BASE}/${id}/nurses`)
        .then((r) => normalizeList(r.data)),
};
