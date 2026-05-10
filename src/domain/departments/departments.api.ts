import { api } from '@/libs/axios/client';
import type {
  CreateDepartmentDTO,
  Department,
  DepartmentRelationItem,
  UpdateDepartmentDTO,
} from './departments.types';

const BASE = '/api/departments';

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

function buildListAllQuery(params?: { sortBy?: string; order?: string }) {
  const query = new URLSearchParams();

  const sortBy = params?.sortBy ?? 'name';
  const order = params?.order ?? 'ASC';

  query.set('sortBy', sortBy);
  query.set('order', order);

  return query.toString();
}

export const DepartmentsApi = {
  /** Paginated listing (tables). See `listAll` for dropdowns / filters. */
  list: (params?: Record<string, string | number>) => {
    const query = new URLSearchParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value === undefined || value === null || String(value).trim() === '') {
        return;
      }

      query.set(key, String(value));
    });

    const suffix = query.toString();
    const url = suffix ? `${BASE}?${suffix}` : BASE;

    return api.core.get<unknown>(url).then((r) => normalizeList<Department>(r.data));
  },

  /** Full list for selects and filters (`GET /api/departments/all`). */
  listAll: (params?: { sortBy?: string; order?: string }) => {
    const qs = buildListAllQuery(params);
    return api.core
      .get<unknown>(`${BASE}/all?${qs}`)
      .then((r) => normalizeList<Department>(r.data));
  },

  get: (id: string) =>
    api.core.get<Department>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: CreateDepartmentDTO) =>
    api.core.post<Department>(BASE, payload).then((r) => r.data),

  update: (id: string, payload: UpdateDepartmentDTO) =>
    api.core.put<Department>(`${BASE}/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.core.delete<void>(`${BASE}/${id}`).then(() => undefined),

  doctors: (id: string) =>
    api.core
      .get<unknown>(`${BASE}/${id}/doctors`)
      .then((r) => normalizeList<DepartmentRelationItem>(r.data)),

  rooms: (id: string) =>
    api.core
      .get<unknown>(`${BASE}/${id}/rooms`)
      .then((r) => normalizeList<DepartmentRelationItem>(r.data)),

  nurses: (id: string) =>
    api.core
      .get<unknown>(`${BASE}/${id}/nurses`)
      .then((r) => normalizeList<DepartmentRelationItem>(r.data)),
};
