import { api } from '@/libs/axios/client';
import type {
  CreateRoomDTO,
  Room,
  RoomsListParams,
  UpdateRoomDTO,
} from './rooms.types';

const BASE = '/api/rooms';

function getObjectList(value: unknown, key: 'items' | 'data') {
  if (typeof value !== 'object' || value === null || !(key in value)) {
    return null;
  }

  const nestedValue = value[key as keyof typeof value];
  return Array.isArray(nestedValue) ? nestedValue : null;
}

function normalizeList<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  const items = getObjectList(value, 'items');

  if (items) {
    return items as T[];
  }

  const data = getObjectList(value, 'data');

  if (data) {
    return data as T[];
  }

  return [];
}

function buildRoomsQuery(params: RoomsListParams = {}) {
  const query = new URLSearchParams();

  if (params.departmentId?.trim()) {
    query.set('departmentId', params.departmentId.trim());
  }

  if (params.type?.trim()) {
    query.set('type', params.type.trim());
  }

  return query.toString();
}

function buildRoomsUrl(path: string, params: RoomsListParams = {}) {
  const query = buildRoomsQuery(params);
  return query ? `${path}?${query}` : path;
}

export const RoomsApi = {
  list: (params: RoomsListParams = {}) =>
    api.core.get<unknown>(buildRoomsUrl(BASE, params)).then((r) => normalizeList<Room>(r.data)),

  available: (params: RoomsListParams = {}) =>
    api.core
      .get<unknown>(buildRoomsUrl(`${BASE}/available`, params))
      .then((r) => normalizeList<Room>(r.data)),

  get: (id: string) =>
    api.core.get<Room>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: CreateRoomDTO) =>
    api.core.post<Room>(BASE, payload).then((r) => r.data),

  update: (id: string, payload: UpdateRoomDTO) =>
    api.core.put<Room>(`${BASE}/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.core.delete<void>(`${BASE}/${id}`).then(() => undefined),
};
