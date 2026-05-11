import { api } from '@/libs/axios/client';
import type { CreateDoctorDTO, Doctor, UpdateDoctorDTO } from './doctors.types';

const BASE = '/api/doctors';

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

function normalizeDoctor(value: unknown): Doctor {
  const doctor = typeof value === 'object' && value !== null ? value : {};
  const departmentValue = getValue(doctor, ['department']);
  const department = typeof departmentValue === 'object' && departmentValue !== null
    ? {
        id: normalizeText(getValue(departmentValue, ['id'])),
        name: normalizeText(getValue(departmentValue, ['name'])),
        location: normalizeText(getValue(departmentValue, ['location'])),
      }
    : null;

  return {
    id: normalizeText(getValue(doctor, ['id'])),
    userId: normalizeText(getValue(doctor, ['userId', 'user_id'])),
    firstName: normalizeText(getValue(doctor, ['firstName', 'first_name'])),
    lastName: normalizeText(getValue(doctor, ['lastName', 'last_name'])),
    specialization: normalizeText(getValue(doctor, ['specialization'])),
    departmentId: normalizeText(getValue(doctor, ['departmentId', 'department_id'])),
    phoneNumber: normalizeText(getValue(doctor, ['phoneNumber', 'phone_number'])),
    isActive: getValue(doctor, ['isActive', 'is_active']) !== false,
    department,
    createdAt: normalizeText(getValue(doctor, ['createdAt', 'created_at'])) || undefined,
    updatedAt: normalizeText(getValue(doctor, ['updatedAt', 'updated_at'])) || undefined,
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

export const DoctorsApi = {
  list: () =>
    api.core.get<unknown>(BASE).then((r) => normalizeList(r.data).map(normalizeDoctor)),

  get: (id: string) =>
    api.core.get<unknown>(`${BASE}/${id}`).then((r) => normalizeDoctor(r.data)),

  create: (payload: CreateDoctorDTO) =>
    api.core.post<unknown>(BASE, payload).then((r) => normalizeDoctor(r.data)),

  update: (id: string, payload: UpdateDoctorDTO) =>
    api.core.put<unknown>(`${BASE}/${id}`, payload).then((r) => normalizeDoctor(r.data)),

  updateStatus: (id: string, isActive: boolean) =>
    api.core
      .patch<unknown>(`${BASE}/${id}/status`, { isActive })
      .then((r) => normalizeDoctor(r.data)),

  remove: (id: string) =>
    api.core.delete<void>(`${BASE}/${id}`).then(() => undefined),
};
