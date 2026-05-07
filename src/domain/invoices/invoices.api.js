import { api } from '@/libs/axios/client';
const BASE = '/api/invoices';
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
function normalizeStats(value) {
    if (typeof value !== 'object' || value === null || !('totalRevenue' in value)) {
        return { totalRevenue: 0 };
    }
    const totalRevenue = Number(value.totalRevenue);
    return {
        totalRevenue: Number.isFinite(totalRevenue) ? totalRevenue : 0,
    };
}
function buildInvoicesQuery(params = {}) {
    const query = new URLSearchParams();
    if (params.patientId?.trim()) {
        query.set('patientId', params.patientId.trim());
    }
    if (params.status?.trim()) {
        query.set('status', params.status.trim());
    }
    const value = query.toString();
    return value ? `?${value}` : '';
}
export const InvoicesApi = {
    list: (params = {}) => api.core
        .get(`${BASE}${buildInvoicesQuery(params)}`)
        .then((response) => normalizeList(response.data)),
    get: (id) => api.core.get(`${BASE}/${id}`).then((response) => response.data),
    create: (payload) => api.core.post(BASE, payload).then((response) => response.data),
    update: (id, payload) => api.core.put(`${BASE}/${id}`, payload).then((response) => response.data),
    pay: (id) => api.core.put(`${BASE}/${id}/pay`).then((response) => response.data),
    remove: (id) => api.core.delete(`${BASE}/${id}`).then(() => undefined),
    stats: () => api.core
        .get(`${BASE}/stats`)
        .then((response) => normalizeStats(response.data)),
};
