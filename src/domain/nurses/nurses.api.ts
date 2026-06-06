import { api } from '@/libs/axios/client';
import type { CreateNurseDTO, Nurse, NursesListParams, UpdateNurseDTO } from './nurses.types';

const BASE = '/api/nurses';

function getValue(source: unknown, keys: string[]) {
  if (typeof source !== 'object' || source === null) {
    return undefined;
  }

  for (const key of keys) {
    if (key in source) {
      return (source as Record<string, unknown>)[key];
    }
  }

  return undefined;
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function normalizeNullableText(value: unknown) {
  const text = normalizeText(value).trim();
  return text || null;
}

function normalizeNurse(value: unknown): Nurse {
  const nurse = typeof value === 'object' && value !== null ? value : {};
  const departmentValue = getValue(nurse, ['department']);
  const department = typeof departmentValue === 'object' && departmentValue !== null
    ? {
        id: normalizeText(getValue(departmentValue, ['id'])),
        name: normalizeText(getValue(departmentValue, ['name'])),
        location: normalizeText(getValue(departmentValue, ['location'])),
      }
    : null;
  const userValue = getValue(nurse, ['user']);
  const user = typeof userValue === 'object' && userValue !== null
    ? {
        id: normalizeText(getValue(userValue, ['id'])) || undefined,
        email: normalizeNullableText(getValue(userValue, ['email'])),
        username: normalizeNullableText(getValue(userValue, ['username'])),
      }
    : null;
  const email = normalizeNullableText(getValue(nurse, ['email'])) ?? user?.email ?? null;
  const username = normalizeNullableText(getValue(nurse, ['username'])) ?? user?.username ?? null;

  return {
    id: normalizeText(getValue(nurse, ['id'])),
    userId: normalizeNullableText(getValue(nurse, ['userId', 'user_id'])) ?? user?.id ?? null,
    email,
    username,
    firstName: normalizeText(getValue(nurse, ['firstName', 'first_name'])),
    lastName: normalizeText(getValue(nurse, ['lastName', 'last_name'])),
    departmentId: normalizeText(getValue(nurse, ['departmentId', 'department_id'])),
    shift: normalizeText(getValue(nurse, ['shift'])),
    department,
    user,
    createdAt: normalizeText(getValue(nurse, ['createdAt', 'created_at'])) || undefined,
    updatedAt: normalizeText(getValue(nurse, ['updatedAt', 'updated_at'])) || undefined,
  };
}

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

  if (params.search?.trim()) {
    query.set('search', params.search.trim());
  }

  if (params.shift?.trim()) {
    query.set('shift', params.shift.trim());
  }

  return query.toString();
}

export const NursesApi = {
  list: (params: NursesListParams = {}) => {
    const query = buildNursesQuery(params);
    const url = query ? `${BASE}?${query}` : BASE;

    return api.core.get<unknown>(url).then((r) => normalizeList(r.data).map(normalizeNurse));
  },

  get: (id: string) =>
    api.core.get<unknown>(`${BASE}/${id}`).then((r) => normalizeNurse(r.data)),

  create: (payload: CreateNurseDTO) =>
    api.core.post<unknown>(BASE, payload).then((r) => normalizeNurse(r.data)),

  update: (id: string, payload: UpdateNurseDTO) =>
    api.core.put<unknown>(`${BASE}/${id}`, payload).then((r) => normalizeNurse(r.data)),

  remove: (id: string) =>
    api.core.delete<void>(`${BASE}/${id}`).then(() => undefined),
};
