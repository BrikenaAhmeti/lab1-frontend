import { isAxiosError } from 'axios';
export function getDepartmentApiStatus(error) {
    return isAxiosError(error) ? error.response?.status : undefined;
}
export function getDepartmentApiMessage(error, fallback) {
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
export function formatDepartmentDate(value, language) {
    if (!value) {
        return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat(language, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}
