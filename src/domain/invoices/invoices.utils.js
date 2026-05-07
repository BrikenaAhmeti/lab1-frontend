import { isAxiosError } from 'axios';
export const invoiceStatuses = ['PENDING', 'PAID', 'CANCELLED'];
export const invoiceDatePattern = /^\d{4}-\d{2}-\d{2}$/;
export function getInvoiceApiStatus(error) {
    return isAxiosError(error) ? error.response?.status : undefined;
}
export function getInvoiceApiMessage(error, fallback) {
    if (!isAxiosError(error)) {
        return fallback;
    }
    const message = error.response?.data?.message;
    if (Array.isArray(message) && message.length) {
        return message.join(', ');
    }
    if (typeof message === 'string' && message.trim()) {
        return message;
    }
    if (typeof error.message === 'string' && error.message.trim()) {
        return error.message;
    }
    return fallback;
}
export function isKnownInvoiceStatus(value) {
    return invoiceStatuses.includes(value);
}
export function normalizeInvoiceStatus(value) {
    const normalized = value?.trim().toUpperCase() ?? '';
    return isKnownInvoiceStatus(normalized) ? normalized : '';
}
export function getInvoiceStatusVariant(status) {
    const normalized = normalizeInvoiceStatus(status);
    if (normalized === 'PAID') {
        return 'success';
    }
    if (normalized === 'CANCELLED') {
        return 'danger';
    }
    return 'warning';
}
export function getInvoicePatientName(patient) {
    return [patient?.firstName, patient?.lastName].filter(Boolean).join(' ').trim();
}
export function formatInvoiceDate(value, language) {
    const input = invoiceDatePattern.test(value) ? `${value}T00:00:00Z` : value;
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat(language, {
        dateStyle: 'medium',
        timeZone: invoiceDatePattern.test(value) ? 'UTC' : undefined,
    }).format(date);
}
export function getTodayInvoiceDateValue() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
