import { isAxiosError } from 'axios';
import { isTechnicalMessage } from '@/libs/app/utils';

export function getDepartmentApiStatus(error: unknown) {
  return isAxiosError(error) ? error.response?.status : undefined;
}

export function getDepartmentApiMessage(error: unknown, fallback: string) {
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

  if (typeof error.message === 'string' && error.message.trim() && !isTechnicalMessage(error.message)) {
    return error.message;
  }

  return fallback;
}

export function formatDepartmentDate(value: string | undefined, language: string) {
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
