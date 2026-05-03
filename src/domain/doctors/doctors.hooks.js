import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DoctorsApi } from './doctors.api';
export const doctorsKeys = {
    all: ['doctors'],
    list: () => [...doctorsKeys.all, 'list'],
    details: () => [...doctorsKeys.all, 'detail'],
    detail: (id) => [...doctorsKeys.details(), id],
};
export function useDoctors() {
    return useQuery({
        queryKey: doctorsKeys.list(),
        queryFn: DoctorsApi.list,
    });
}
export function useDoctor(id) {
    return useQuery({
        queryKey: doctorsKeys.detail(id),
        queryFn: () => DoctorsApi.get(id),
        enabled: !!id,
    });
}
export function useCreateDoctor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => DoctorsApi.create(payload),
        onSuccess: (doctor) => {
            queryClient.setQueryData(doctorsKeys.detail(doctor.id), doctor);
            queryClient.invalidateQueries({ queryKey: doctorsKeys.list() });
        },
    });
}
export function useUpdateDoctor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => DoctorsApi.update(id, payload),
        onSuccess: (doctor) => {
            queryClient.setQueryData(doctorsKeys.detail(doctor.id), doctor);
            queryClient.invalidateQueries({ queryKey: doctorsKeys.list() });
        },
    });
}
export function useDeleteDoctor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => DoctorsApi.remove(id),
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: doctorsKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: doctorsKeys.list() });
        },
    });
}
