import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppointmentsApi } from './appointments.api';
import type {
  Appointment,
  AppointmentListParams,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
} from './appointments.types';

export const appointmentsKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentsKeys.all, 'list'] as const,
  list: (params: AppointmentListParams = {}) =>
    [
      ...appointmentsKeys.lists(),
      params.date?.trim() ?? '',
      params.doctorId?.trim() ?? '',
      params.patientId?.trim() ?? '',
      params.status?.trim() ?? '',
    ] as const,
  today: () => [...appointmentsKeys.all, 'today'] as const,
  details: () => [...appointmentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentsKeys.details(), id] as const,
};

export function useAppointments(params: AppointmentListParams = {}) {
  return useQuery({
    queryKey: appointmentsKeys.list(params),
    queryFn: () => AppointmentsApi.list(params),
  });
}

export function useTodayAppointments() {
  return useQuery({
    queryKey: appointmentsKeys.today(),
    queryFn: AppointmentsApi.today,
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentsKeys.detail(id),
    queryFn: () => AppointmentsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAppointmentDTO) => AppointmentsApi.create(payload),
    onSuccess: (appointment: Appointment) => {
      queryClient.setQueryData(appointmentsKeys.detail(appointment.id), appointment);
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.all });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAppointmentDTO }) =>
      AppointmentsApi.update(id, payload),
    onSuccess: (appointment: Appointment) => {
      queryClient.setQueryData(appointmentsKeys.detail(appointment.id), appointment);
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.all });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => AppointmentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.all });
    },
  });
}
