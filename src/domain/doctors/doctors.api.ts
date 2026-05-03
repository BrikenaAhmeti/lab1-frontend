import { api } from '@/libs/axios/client';
import type { CreateDoctorDTO, Doctor, UpdateDoctorDTO } from './doctors.types';

const BASE = '/api/doctors';

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

export const DoctorsApi = {
  list: () =>
    api.core.get<unknown>(BASE).then((r) => normalizeList<Doctor>(r.data)),

  get: (id: string) =>
    api.core.get<Doctor>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: CreateDoctorDTO) =>
    api.core.post<Doctor>(BASE, payload).then((r) => r.data),

  update: (id: string, payload: UpdateDoctorDTO) =>
    api.core.put<Doctor>(`${BASE}/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.core.delete<void>(`${BASE}/${id}`).then(() => undefined),
};
