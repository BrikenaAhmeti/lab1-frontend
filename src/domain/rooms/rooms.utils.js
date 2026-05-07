import { isAxiosError } from 'axios';
import { roomStatusValues, roomTypeValues } from './rooms.types';
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
export function isKnownRoomType(value) {
    return roomTypeValues.includes(value);
}
export function isKnownRoomStatus(value) {
    return roomStatusValues.includes(value);
}
export function normalizeRoomType(value) {
    const normalized = value?.trim().toUpperCase() ?? '';
    return isKnownRoomType(normalized) ? normalized : value?.trim() ?? '';
}
export function normalizeRoomStatus(value) {
    const normalized = value?.trim().toUpperCase().replace(/\s+/g, '_') ?? '';
    return isKnownRoomStatus(normalized) ? normalized : value?.trim() ?? '';
}
export function getRoomStatusBadgeVariant(value) {
    const status = normalizeRoomStatus(value);
    if (status === 'AVAILABLE')
        return 'success';
    if (status === 'OCCUPIED')
        return 'danger';
    if (status === 'UNDER_MAINTENANCE')
        return 'warning';
    return 'secondary';
}
export function getRoomApiStatus(error) {
    return isAxiosError(error) ? error.response?.status : undefined;
}
export function getRoomApiMessage(error, fallback) {
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
