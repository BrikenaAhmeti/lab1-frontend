import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppointmentsApi } from './appointments.api';
export const appointmentsKeys = {
    all: ['appointments'],
    lists: () => [...appointmentsKeys.all, 'list'],
    list: (params = {}) => [
        ...appointmentsKeys.lists(),
        params.date?.trim() ?? '',
        params.doctorId?.trim() ?? '',
        params.patientId?.trim() ?? '',
        params.status?.trim() ?? '',
    ],
    today: () => [...appointmentsKeys.all, 'today'],
    details: () => [...appointmentsKeys.all, 'detail'],
    detail: (id) => [...appointmentsKeys.details(), id],
};
export function useAppointments(params = {}) {
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
export function useAppointment(id) {
    return useQuery({
        queryKey: appointmentsKeys.detail(id),
        queryFn: () => AppointmentsApi.get(id),
        enabled: !!id,
    });
}
export function useCreateAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => AppointmentsApi.create(payload),
        onSuccess: (appointment) => {
            queryClient.setQueryData(appointmentsKeys.detail(appointment.id), appointment);
            queryClient.invalidateQueries({ queryKey: appointmentsKeys.all });
        },
    });
}
export function useUpdateAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => AppointmentsApi.update(id, payload),
        onSuccess: (appointment) => {
            queryClient.setQueryData(appointmentsKeys.detail(appointment.id), appointment);
            queryClient.invalidateQueries({ queryKey: appointmentsKeys.all });
        },
    });
}
export function useCancelAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => AppointmentsApi.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: appointmentsKeys.all });
        },
    });
}
