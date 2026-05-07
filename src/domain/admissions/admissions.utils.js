import { isAxiosError } from 'axios';
import { admissionStatusValues } from './admissions.types';
export const admissionDatePattern = /^\d{4}-\d{2}-\d{2}$/;
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
export function isKnownAdmissionStatus(value) {
    return admissionStatusValues.includes(value);
}
export function normalizeAdmissionStatus(value) {
    const normalized = value?.trim().toUpperCase().replace(/\s+/g, '_') ?? '';
    return isKnownAdmissionStatus(normalized) ? normalized : value?.trim() ?? '';
}
export function getAdmissionApiStatus(error) {
    return isAxiosError(error) ? error.response?.status : undefined;
}
export function getAdmissionApiMessage(error, fallback) {
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
export function getAdmissionStatusVariant(value) {
    const status = normalizeAdmissionStatus(value);
    if (status === 'ACTIVE') {
        return 'success';
    }
    if (status === 'DISCHARGED') {
        return 'secondary';
    }
    return 'default';
}
export function getAdmissionPatientName(patient) {
    const firstName = typeof patient?.firstName === 'string' ? patient.firstName.trim() : '';
    const lastName = typeof patient?.lastName === 'string' ? patient.lastName.trim() : '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    return fullName || '';
}
export function getAdmissionDateValue(admission) {
    return (admission.admissionDate
        || admission.admittedAt
        || admission.createdAt
        || '');
}
export function formatAdmissionDate(value, language) {
    if (!value) {
        return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat(language, {
        dateStyle: 'medium',
    }).format(date);
}
export function getAdmissionRoomLabel(room) {
    const roomNumber = typeof room?.roomNumber === 'string' ? room.roomNumber.trim() : '';
    const departmentName = typeof room?.department?.name === 'string' ? room.department.name.trim() : '';
    if (roomNumber && departmentName) {
        return `${roomNumber} · ${departmentName}`;
    }
    return roomNumber || departmentName || '';
}
