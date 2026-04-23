import { isAxiosError } from 'axios';
export const patientGenders = ['MALE', 'FEMALE', 'OTHER'];
export const patientBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const patientPageSizes = [10, 20, 50];
export const patientDatePattern = /^\d{4}-\d{2}-\d{2}$/;
export const patientPhonePattern = /^\+\d{8,15}$/;
export function getPatientApiStatus(error) {
    return isAxiosError(error) ? error.response?.status : undefined;
}
export function getPatientApiMessage(error, fallback) {
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
export function formatPatientDate(value, language) {
    if (!patientDatePattern.test(value)) {
        return value;
    }
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat(language, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
}
