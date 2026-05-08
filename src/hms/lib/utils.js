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
export function getErrorMessage(error) {
    const message = error?.response?.data?.message;
    if (Array.isArray(message)) {
        return message.join(', ');
    }
    if (typeof message === 'string' && message.trim()) {
        return message;
    }
    if (typeof error?.message === 'string' && error.message.trim()) {
        return error.message;
    }
    return 'Something went wrong.';
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
