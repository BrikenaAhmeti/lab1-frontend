import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PatientsApi } from './patients.api';
export const patientsKeys = {
    all: ['patients'],
    lists: () => [...patientsKeys.all, 'list'],
    list: (params) => [...patientsKeys.lists(), params.page ?? 1, params.limit ?? 10, params.search?.trim() ?? ''],
    details: () => [...patientsKeys.all, 'detail'],
    detail: (id) => [...patientsKeys.details(), id],
};
export function usePatients(params) {
    return useQuery({
        queryKey: patientsKeys.list(params),
        queryFn: () => PatientsApi.list(params),
        placeholderData: keepPreviousData,
    });
}
export function usePatient(id) {
    return useQuery({
        queryKey: patientsKeys.detail(id),
        queryFn: () => PatientsApi.get(id),
        enabled: !!id,
    });
}
export function useCreatePatient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => PatientsApi.create(payload),
        onSuccess: (patient) => {
            queryClient.setQueryData(patientsKeys.detail(patient.id), patient);
            queryClient.invalidateQueries({ queryKey: patientsKeys.lists() });
        },
    });
}
export function useUpdatePatient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => PatientsApi.update(id, payload),
        onSuccess: (patient) => {
            queryClient.setQueryData(patientsKeys.detail(patient.id), patient);
            queryClient.invalidateQueries({ queryKey: patientsKeys.lists() });
        },
    });
}
export function useDeletePatient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => PatientsApi.remove(id),
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: patientsKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: patientsKeys.lists() });
        },
    });
}
