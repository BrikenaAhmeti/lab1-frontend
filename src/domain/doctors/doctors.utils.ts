import { isAxiosError } from 'axios';
import type { Doctor } from './doctors.types';

export const doctorPhonePattern = /^\+\d{8,15}$/;

export function getDoctorApiStatus(error: unknown) {
  return isAxiosError(error) ? error.response?.status : undefined;
}

export function getDoctorApiMessage(error: unknown, fallback: string) {
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

export function isDoctorInactiveApiError(error: unknown) {
  if (!isAxiosError(error)) {
    return false;
  }

  return error.response?.status === 409 && error.response?.data?.message === 'Doctor is inactive';
}

export function formatDoctorDate(value: string | undefined, language: string) {
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

export function getDoctorFullName(doctor: Pick<Doctor, 'firstName' | 'lastName'>) {
  return [doctor.firstName, doctor.lastName].filter(Boolean).join(' ').trim();
}
