import { isAxiosError } from 'axios';
import { isTechnicalMessage } from '@/libs/app/utils';
import type { Doctor } from '@/domain/doctors/doctors.types';
import type { Patient } from '@/domain/patients/patients.types';
import type { MedicalRecord } from './medical-records.types';

type StatusMessages = Partial<Record<number, string>>;

export type SelectOption = {
  value: string;
  label: string;
};

export const medicalRecordDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function getMedicalRecordApiStatus(error: unknown) {
  return isAxiosError(error) ? error.response?.status : undefined;
}

export function getMedicalRecordApiMessage(
  error: unknown,
  fallback: string,
  statusMessages: StatusMessages = {}
) {
  if (!isAxiosError(error)) {
    return fallback;
  }

  const status = error.response?.status;

  if (status && statusMessages[status]) {
    return statusMessages[status] as string;
  }

  const message = error.response?.data?.message;

  if (Array.isArray(message) && message.length) {
    return message.join(', ');
  }

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (typeof error.message === 'string' && error.message.trim() && !isTechnicalMessage(error.message)) {
    return error.message;
  }

  return fallback;
}

export function formatMedicalRecordDate(value: string, language: string) {
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

export function formatMedicalRecordDateTime(value: string | undefined, language: string) {
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

export function getMedicalRecordDoctorName(
  doctor: Pick<MedicalRecord['doctor'], 'firstName' | 'lastName'>
) {
  return [doctor.firstName, doctor.lastName].filter(Boolean).join(' ').trim();
}

export function getMedicalRecordPatientName(
  patient: Pick<MedicalRecord['patient'], 'firstName' | 'lastName'>
) {
  return [patient.firstName, patient.lastName].filter(Boolean).join(' ').trim();
}

export function getMedicalRecordPatientOptionLabel(
  patient: Pick<Patient, 'firstName' | 'lastName' | 'phoneNumber'>
) {
  const fullName = getMedicalRecordPatientName(patient);
  return patient.phoneNumber ? `${fullName} (${patient.phoneNumber})` : fullName;
}

export function getMedicalRecordDoctorOptionLabel(
  doctor: Pick<Doctor, 'firstName' | 'lastName' | 'specialization'> & {
    department?: Pick<NonNullable<Doctor['department']>, 'name'> | null;
  }
) {
  const fullName = getMedicalRecordDoctorName(doctor);
  const departmentName = doctor.department?.name ? ` · ${doctor.department.name}` : '';

  return `${fullName} · ${doctor.specialization}${departmentName}`;
}

export function withFallbackOption(options: SelectOption[], value: string, label: string) {
  if (!value || options.some((option) => option.value === value)) {
    return options;
  }

  return [{ value, label }, ...options];
}
