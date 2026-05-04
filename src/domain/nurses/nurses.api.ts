import { api } from '@/libs/axios/client';
import type { CreateNurseDTO, Nurse, NursesListParams, UpdateNurseDTO } from './nurses.types';

const BASE = '/api/nurses';

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

function buildNursesQuery(params: NursesListParams = {}) {
  const query = new URLSearchParams();

  if (params.departmentId?.trim()) {
    query.set('departmentId', params.departmentId.trim());
  }

  return query.toString();
}

export const NursesApi = {
  list: (params: NursesListParams = {}) => {
    const query = buildNursesQuery(params);
    const url = query ? `${BASE}?${query}` : BASE;

    return api.core.get<unknown>(url).then((r) => normalizeList<Nurse>(r.data));
  },

  get: (id: string) =>
    api.core.get<Nurse>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: CreateNurseDTO) =>
    api.core.post<Nurse>(BASE, payload).then((r) => r.data),

  update: (id: string, payload: UpdateNurseDTO) =>
    api.core.put<Nurse>(`${BASE}/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.core.delete<void>(`${BASE}/${id}`).then(() => undefined),
};
