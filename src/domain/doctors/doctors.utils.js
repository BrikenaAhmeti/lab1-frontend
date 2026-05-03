import { isAxiosError } from 'axios';
export const doctorPhonePattern = /^\+\d{8,15}$/;
export function getDoctorApiStatus(error) {
    return isAxiosError(error) ? error.response?.status : undefined;
}
export function getDoctorApiMessage(error, fallback) {
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
export function formatDoctorDate(value, language) {
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
export function getDoctorFullName(doctor) {
    return [doctor.firstName, doctor.lastName].filter(Boolean).join(' ').trim();
}
