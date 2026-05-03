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

export const DepartmentsApi = {
  list: () =>
    api.core.get<unknown>(BASE).then((r) => normalizeList<Department>(r.data)),

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
};
