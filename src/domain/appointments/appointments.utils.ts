import { isAxiosError } from 'axios';
import type { Appointment, AppointmentStatus } from './appointments.types';

export const appointmentStatuses: AppointmentStatus[] = ['Scheduled', 'Completed', 'Cancelled'];
export const appointmentDatePattern = /^\d{4}-\d{2}-\d{2}$/;
export const appointmentTimePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function getAppointmentApiStatus(error: unknown) {
  return isAxiosError(error) ? error.response?.status : undefined;
}

export function getAppointmentApiMessage(
  error: unknown,
  fallback: string,
  conflictMessage?: string
) {
  if (!isAxiosError(error)) {
    return fallback;
  }

  if (error.response?.status === 409 && conflictMessage) {
    return conflictMessage;
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

export function formatAppointmentDate(value: string, language: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
  }).format(date);
}

export function formatAppointmentCreatedAt(value: string | undefined, language: string) {
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

export function getAppointmentDateValue(value: string) {
  return value.slice(0, 10);
}

export function getAppointmentPatientName(patient: Pick<Appointment['patient'], 'firstName' | 'lastName'>) {
  return [patient.firstName, patient.lastName].filter(Boolean).join(' ').trim();
}

export function getAppointmentDoctorName(doctor: Pick<Appointment['doctor'], 'firstName' | 'lastName'>) {
  return [doctor.firstName, doctor.lastName].filter(Boolean).join(' ').trim();
}

export function isAppointmentLocked(status: AppointmentStatus | string) {
  return status === 'Completed' || status === 'Cancelled';
}

export function getAppointmentStatusVariant(status: AppointmentStatus | string) {
  if (status === 'Completed') {
    return 'success';
  }

  if (status === 'Cancelled') {
    return 'danger';
  }

  return 'default';
}

export function isPastAppointmentSlot(date: string, time: string) {
  if (!appointmentDatePattern.test(date) || !appointmentTimePattern.test(time)) {
    return false;
  }

  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  const appointmentDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

  return appointmentDateTime.getTime() < Date.now();
}

export function getTodayDateValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
