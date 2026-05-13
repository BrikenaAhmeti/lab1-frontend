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
export function camelToSnake(value) {
    return value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}
export function deepCamelCaseKeys(value) {
    if (Array.isArray(value)) {
        return value.map(deepCamelCaseKeys);
    }
    if (!value || typeof value !== 'object' || value instanceof Date) {
        return value;
    }
    return Object.fromEntries(Object.entries(value).map(([key, entryValue]) => [snakeToCamel(key), deepCamelCaseKeys(entryValue)]));
}
export function deepSnakeCaseKeys(value) {
    if (Array.isArray(value)) {
        return value.map(deepSnakeCaseKeys);
    }
    if (!value || typeof value !== 'object' || value instanceof Date) {
        return value;
    }
    return Object.fromEntries(Object.entries(value).map(([key, entryValue]) => [camelToSnake(key), deepSnakeCaseKeys(entryValue)]));
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
    const normalized = deepCamelCaseKeys(user);
    const firstName = getValue(normalized, 'firstName', 'first_name');
    const lastName = getValue(normalized, 'lastName', 'last_name');
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    return {
        ...normalized,
        id: String(getValue(user, 'id')),
        firstName,
        lastName,
        fullName: fullName || getValue(normalized, 'fullName', 'full_name'),
        email: getValue(user, 'email'),
        roles: normalizeRoles(getValue(user, 'roles', 'role')),
    };
}
export function normalizeListResponse(payload) {
    return {
        data: Array.isArray(payload?.data)
            ? deepCamelCaseKeys(payload.data)
            : Array.isArray(payload?.items)
                ? deepCamelCaseKeys(payload.items)
                : [],
        total: Number(payload?.total ?? 0),
        page: Number(payload?.page ?? 1),
        limit: Number(payload?.limit ?? 10),
        totalPages: Number(payload?.totalPages ?? 1),
    };
}
export function normalizeArrayResponse(payload) {
    if (Array.isArray(payload)) {
        return deepCamelCaseKeys(payload);
    }
    if (Array.isArray(payload?.data)) {
        return deepCamelCaseKeys(payload.data);
    }
    if (Array.isArray(payload?.items)) {
        return deepCamelCaseKeys(payload.items);
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
    const fullName = getValue(item, 'fullName', 'full_name');
    const firstName = getValue(item, 'firstName', 'first_name');
    const lastName = getValue(item, 'lastName', 'last_name');
    return `${firstName} ${lastName}`.trim() || String(fullName || '');
}
export function formatDate(value, language) {
    if (!value) {
        return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}
export function formatCurrency(value, language) {
    return new Intl.NumberFormat(language === 'de' ? 'de-DE' : 'en-US', {
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
    const rawValue = getValue(item, field.name, camelToSnake(field.name));
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
