import { isAxiosError } from 'axios';
import { nurseShiftValues } from './nurses.types';
function collectMessages(value) {
    if (typeof value === 'string' && value.trim()) {
        return [value];
    }
    if (Array.isArray(value)) {
        return value.flatMap((item) => collectMessages(item));
    }
    if (typeof value === 'object' && value !== null) {
        return Object.values(value).flatMap((item) => collectMessages(item));
    }
    return [];
}
export function isKnownNurseShift(value) {
    return nurseShiftValues.includes(value);
}
export function normalizeNurseShift(value) {
    const normalized = value?.trim().toLowerCase();
    if (normalized === 'morning')
        return 'Morning';
    if (normalized === 'evening')
        return 'Evening';
    if (normalized === 'night')
        return 'Night';
    return value?.trim() ?? '';
}
export function getNurseShiftBadgeVariant(value) {
    const shift = normalizeNurseShift(value);
    if (shift === 'Morning')
        return 'success';
    if (shift === 'Evening')
        return 'warning';
    return 'secondary';
}
export function getNurseApiStatus(error) {
    return isAxiosError(error) ? error.response?.status : undefined;
}
export function getNurseApiMessage(error, fallback) {
    if (!isAxiosError(error)) {
        return fallback;
    }
    const data = error.response?.data;
    const messages = [...collectMessages(data?.errors), ...collectMessages(data?.message)];
    if (messages.length) {
        return messages.join(', ');
    }
    if (typeof error.message === 'string' && error.message.trim()) {
        return error.message;
    }
    return fallback;
}
export function formatNurseDate(value, language) {
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
export function getNurseFullName(nurse) {
    return [nurse.firstName, nurse.lastName].filter(Boolean).join(' ').trim();
}
