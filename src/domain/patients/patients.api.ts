import { api } from '@/libs/axios/client';
import type {
  CreatePatientDTO,
  Patient,
  PatientsListParams,
  PatientsListResponse,
  UpdatePatientDTO,
} from './patients.types';

const BASE = '/api/patients';

function buildPatientsQuery(params: PatientsListParams) {
  const query = new URLSearchParams();

  query.set('page', String(params.page ?? 1));
  query.set('limit', String(params.limit ?? 10));

  if (params.search?.trim()) {
    query.set('search', params.search.trim());
  }

  return query.toString();
}

export const PatientsApi = {
  list: (params: PatientsListParams = {}) =>
    api.core.get<PatientsListResponse>(`${BASE}?${buildPatientsQuery(params)}`).then((r) => r.data),

  get: (id: string) =>
    api.core.get<Patient>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: CreatePatientDTO) =>
    api.core.post<Patient>(BASE, payload).then((r) => r.data),

  update: (id: string, payload: UpdatePatientDTO) =>
    api.core.put<Patient>(`${BASE}/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.core.delete<void>(`${BASE}/${id}`).then(() => undefined),
};
