import { isAxiosError } from 'axios';
export const medicalRecordDatePattern = /^\d{4}-\d{2}-\d{2}$/;
export function getMedicalRecordApiStatus(error) {
    return isAxiosError(error) ? error.response?.status : undefined;
}
export function getMedicalRecordApiMessage(error, fallback, statusMessages = {}) {
    if (!isAxiosError(error)) {
        return fallback;
    }
    const status = error.response?.status;
    if (status && statusMessages[status]) {
        return statusMessages[status];
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
export function formatMedicalRecordDate(value, language) {
    if (!value) {
        return '';
    }
    const date = medicalRecordDatePattern.test(value)
        ? new Date(`${value}T00:00:00Z`)
        : new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat(language, {
        dateStyle: 'medium',
        timeZone: medicalRecordDatePattern.test(value) ? 'UTC' : undefined,
    }).format(date);
}
export function formatMedicalRecordDateTime(value, language) {
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
export function getMedicalRecordDoctorName(doctor) {
    return [doctor.firstName, doctor.lastName].filter(Boolean).join(' ').trim();
}
export function getMedicalRecordPatientName(patient) {
    return [patient.firstName, patient.lastName].filter(Boolean).join(' ').trim();
}
export function getMedicalRecordPatientOptionLabel(patient) {
    const fullName = getMedicalRecordPatientName(patient);
    return patient.phoneNumber ? `${fullName} (${patient.phoneNumber})` : fullName;
}
export function getMedicalRecordDoctorOptionLabel(doctor) {
    const fullName = getMedicalRecordDoctorName(doctor);
    const departmentName = doctor.department?.name ? ` · ${doctor.department.name}` : '';
    return `${fullName} · ${doctor.specialization}${departmentName}`;
}
export function withFallbackOption(options, value, label) {
    if (!value || options.some((option) => option.value === value)) {
        return options;
    }
    return [{ value, label }, ...options];
}
