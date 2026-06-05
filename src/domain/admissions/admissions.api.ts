import { api } from '@/libs/axios/client';
import type {
  Admission,
  AdmissionsListParams,
  CreateAdmissionDTO,
} from './admissions.types';

const BASE = '/api/admissions';

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

function buildAdmissionsQuery(params: AdmissionsListParams = {}) {
  const query = new URLSearchParams();

  if (params.status?.trim()) {
    query.set('status', params.status.trim());
  }

  if (params.patientId?.trim()) {
    query.set('patientId', params.patientId.trim());
  }

  if (params.roomId?.trim()) {
    query.set('roomId', params.roomId.trim());
  }

  if (params.date?.trim()) {
    query.set('date', params.date.trim());
  }

  if (params.from?.trim()) {
    query.set('from', params.from.trim());
  }

  if (params.to?.trim()) {
    query.set('to', params.to.trim());
  }

  return query.toString();
}

function buildAdmissionsUrl(path: string, params: AdmissionsListParams = {}) {
  const query = buildAdmissionsQuery(params);
  return query ? `${path}?${query}` : path;
}

export const AdmissionsApi = {
  list: (params: AdmissionsListParams = {}) =>
    api.core
      .get<unknown>(buildAdmissionsUrl(BASE, params))
      .then((response) => normalizeList<Admission>(response.data)),

  active: () =>
    api.core
      .get<unknown>(`${BASE}/active`)
      .then((response) => normalizeList<Admission>(response.data)),

  create: (payload: CreateAdmissionDTO) =>
    api.core.post<Admission>(BASE, payload).then((response) => response.data),

  discharge: (id: string) =>
    api.core.put<Admission | void>(`${BASE}/${id}/discharge`).then((response) => response.data),
};
