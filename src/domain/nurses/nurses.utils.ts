import { isAxiosError } from 'axios';
import type { Nurse, NurseShift } from './nurses.types';
import { nurseShiftValues } from './nurses.types';

function collectMessages(value: unknown): string[] {
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

export function isKnownNurseShift(value: string): value is NurseShift {
  return nurseShiftValues.includes(value as NurseShift);
}

export function normalizeNurseShift(value: string | undefined | null) {
  const normalized = value?.trim().toLowerCase();

  if (normalized === 'morning') return 'Morning';
  if (normalized === 'evening') return 'Evening';
  if (normalized === 'night') return 'Night';

  return value?.trim() ?? '';
}

export function getNurseShiftBadgeVariant(value: string): 'success' | 'warning' | 'secondary' {
  const shift = normalizeNurseShift(value);

  if (shift === 'Morning') return 'success';
  if (shift === 'Evening') return 'warning';

  return 'secondary';
}

export function getNurseApiStatus(error: unknown) {
  return isAxiosError(error) ? error.response?.status : undefined;
}

export function getNurseApiMessage(error: unknown, fallback: string) {
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

export function formatNurseDate(value: string | undefined, language: string) {
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

export function getNurseFullName(nurse: Pick<Nurse, 'firstName' | 'lastName'>) {
  return [nurse.firstName, nurse.lastName].filter(Boolean).join(' ').trim();
}
