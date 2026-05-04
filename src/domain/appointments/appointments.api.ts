import { api } from '@/libs/axios/client';
import type {
  Appointment,
  AppointmentListParams,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
} from './appointments.types';

const BASE = '/api/appointments';

function buildAppointmentsQuery(params: AppointmentListParams = {}) {
  const query = new URLSearchParams();

  if (params.date?.trim()) {
    query.set('date', params.date.trim());
  }

  if (params.doctorId?.trim()) {
    query.set('doctorId', params.doctorId.trim());
  }

  if (params.patientId?.trim()) {
    query.set('patientId', params.patientId.trim());
  }

  if (params.status?.trim()) {
    query.set('status', params.status.trim());
  }

  const value = query.toString();
  return value ? `?${value}` : '';
}

export const AppointmentsApi = {
  list: (params: AppointmentListParams = {}) =>
    api.core.get<Appointment[]>(`${BASE}${buildAppointmentsQuery(params)}`).then((r) => r.data),

  today: () =>
    api.core.get<Appointment[]>(`${BASE}/today`).then((r) => r.data),

  get: (id: string) =>
    api.core.get<Appointment>(`${BASE}/${id}`).then((r) => r.data),

  create: (payload: CreateAppointmentDTO) =>
    api.core.post<Appointment>(BASE, payload).then((r) => r.data),

  update: (id: string, payload: UpdateAppointmentDTO) =>
    api.core.put<Appointment>(`${BASE}/${id}`, payload).then((r) => r.data),

  remove: (id: string) =>
    api.core.delete<void>(`${BASE}/${id}`).then(() => undefined),
};
