import { commonCopy } from '../copy';
export function buildQueryString(params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return;
        }
        query.set(key, String(value));
    });
    return query.toString();
}
function resolvePath(item, path) {
    return path.split('.').reduce((current, part) => current?.[part], item);
}
export function getValue(item, ...paths) {
    for (const path of paths) {
        const value = resolvePath(item, path);
        if (value !== undefined && value !== null && value !== '') {
            return value;
        }
    }
    return '';
}
export function snakeToCamel(value) {
    return value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
export function normalizeRoles(input) {
    if (Array.isArray(input)) {
        return input
            .map((role) => String(role).trim().toUpperCase())
            .filter(Boolean);
    }
    if (typeof input === 'string' && input.trim()) {
        return [input.trim().toUpperCase()];
    }
    return [];
}
export function normalizeUser(user) {
    return {
        ...user,
        id: String(getValue(user, 'id')),
        first_name: getValue(user, 'first_name', 'firstName'),
        last_name: getValue(user, 'last_name', 'lastName'),
        email: getValue(user, 'email'),
        roles: normalizeRoles(getValue(user, 'roles', 'role')),
    };
}
export function normalizeListResponse(payload) {
    return {
        data: Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.items) ? payload.items : [],
        total: Number(payload?.total ?? 0),
        page: Number(payload?.page ?? 1),
        limit: Number(payload?.limit ?? 10),
        totalPages: Number(payload?.totalPages ?? 1),
    };
}
export function normalizeArrayResponse(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }
    if (Array.isArray(payload?.data)) {
        return payload.data;
    }
    if (Array.isArray(payload?.items)) {
        return payload.items;
    }
    return [];
}
function getApiMessage(error) {
    const message = error?.response?.data?.message;
    if (Array.isArray(message)) {
        return message.join(', ');
    }
    if (typeof message === 'string' && message.trim()) {
        return message;
    }
    return '';
}
function isTechnicalMessage(message) {
    const normalized = message.trim().toLowerCase();
    return (normalized === 'network error' ||
        normalized === 'failed to fetch' ||
        normalized.startsWith('request failed with status code') ||
        normalized.includes('timeout') ||
        normalized.includes('econn') ||
        normalized.includes('err_network'));
}
function resolveCopy(value, translate) {
    return translate ? translate(value) : value.en;
}
export function getErrorMessage(error, translate) {
    const apiMessage = getApiMessage(error);
    const status = Number(error?.response?.status || 0);
    const rawMessage = String(error?.message || '').trim();
    const isTimeout = error?.code === 'ECONNABORTED' || /timeout/i.test(rawMessage);
    if (status === 429 && apiMessage.toLowerCase().includes('too many login attempts')) {
        return resolveCopy(commonCopy.loginRateLimitError, translate);
    }
    if (apiMessage) {
        return apiMessage;
    }
    if (status === 401) {
        return resolveCopy(commonCopy.unauthorizedDescription, translate);
    }
    if (status === 403) {
        return resolveCopy(commonCopy.forbiddenDescription, translate);
    }
    if (status === 404) {
        return resolveCopy(commonCopy.notFoundError, translate);
    }
    if (status === 409) {
        return resolveCopy(commonCopy.conflictError, translate);
    }
    if (status === 400 || status === 422) {
        return resolveCopy(commonCopy.validationError, translate);
    }
    if (status >= 500) {
        return resolveCopy(commonCopy.serverError, translate);
    }
    if (isTimeout) {
        return resolveCopy(commonCopy.timeoutError, translate);
    }
    if (!error?.response) {
        return resolveCopy(commonCopy.networkError, translate);
    }
    if (rawMessage && !isTechnicalMessage(rawMessage)) {
        return rawMessage;
    }
    return resolveCopy(commonCopy.genericError, translate);
}
export function formatPersonName(item) {
    const firstName = getValue(item, 'first_name', 'firstName');
    const lastName = getValue(item, 'last_name', 'lastName');
    return `${firstName} ${lastName}`.trim();
}
export function formatDate(value, language) {
    if (!value) {
        return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat(language === 'sq' ? 'sq-AL' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}
export function formatCurrency(value, language) {
    return new Intl.NumberFormat(language === 'sq' ? 'sq-AL' : 'en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(value || 0);
}
export function stripEmptyValues(values) {
    return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined && value !== null && value !== ''));
}
function normalizeDateInput(value) {
    if (!value) {
        return '';
    }
    if (value.includes('T')) {
        return value.slice(0, 10);
    }
    return value.slice(0, 10);
}
function normalizeTimeInput(value) {
    if (!value) {
        return '';
    }
    if (value.includes('T')) {
        return value.slice(11, 16);
    }
    return value.slice(0, 5);
}
export function getFieldInputValue(item, field) {
    const rawValue = getValue(item, field.name, snakeToCamel(field.name));
    if (field.type === 'date') {
        return normalizeDateInput(String(rawValue || ''));
    }
    if (field.type === 'time') {
        return normalizeTimeInput(String(rawValue || ''));
    }
    if (field.type === 'number') {
        return rawValue === '' ? '' : Number(rawValue);
    }
    return rawValue ?? '';
}
export function getStatusVariant(status) {
    const normalized = String(status || '').toUpperCase();
    if (['ACTIVE', 'AVAILABLE', 'COMPLETED', 'PAID'].includes(normalized)) {
        return 'success';
    }
    if (['PENDING', 'SCHEDULED', 'OCCUPIED', 'UNDER_MAINTENANCE'].includes(normalized)) {
        return 'warning';
    }
    if (['CANCELLED', 'DISCHARGED'].includes(normalized)) {
        return 'secondary';
    }
    return 'default';
}
