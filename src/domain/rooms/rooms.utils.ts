import { isAxiosError } from 'axios';
import type { RoomStatus, RoomType } from './rooms.types';
import { roomStatusValues, roomTypeValues } from './rooms.types';

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

export function isKnownRoomType(value: string): value is RoomType {
  return roomTypeValues.includes(value as RoomType);
}

export function isKnownRoomStatus(value: string): value is RoomStatus {
  return roomStatusValues.includes(value as RoomStatus);
}

export function normalizeRoomType(value: string | undefined | null) {
  const normalized = value?.trim().toUpperCase() ?? '';
  return isKnownRoomType(normalized) ? normalized : value?.trim() ?? '';
}

export function normalizeRoomStatus(value: string | undefined | null) {
  const normalized = value?.trim().toUpperCase().replace(/\s+/g, '_') ?? '';
  return isKnownRoomStatus(normalized) ? normalized : value?.trim() ?? '';
}

export function getRoomStatusBadgeVariant(
  value: string
): 'success' | 'danger' | 'warning' | 'secondary' {
  const status = normalizeRoomStatus(value);

  if (status === 'AVAILABLE') return 'success';
  if (status === 'OCCUPIED') return 'danger';
  if (status === 'UNDER_MAINTENANCE') return 'warning';

  return 'secondary';
}

export function getRoomApiStatus(error: unknown) {
  return isAxiosError(error) ? error.response?.status : undefined;
}

export function getRoomApiMessage(error: unknown, fallback: string) {
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
