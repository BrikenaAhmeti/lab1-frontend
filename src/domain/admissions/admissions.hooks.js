import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomsKeys } from '@/domain/rooms/rooms.hooks';
import { AdmissionsApi } from './admissions.api';
export const admissionsKeys = {
    all: ['admissions'],
    lists: () => [...admissionsKeys.all, 'list'],
    list: (params = {}) => [...admissionsKeys.lists(), params.status?.trim() ?? ''],
    active: () => [...admissionsKeys.all, 'active'],
};
export function useAdmissions(params = {}) {
    return useQuery({
        queryKey: admissionsKeys.list(params),
        queryFn: () => AdmissionsApi.list(params),
    });
}
export function useActiveAdmissions() {
    return useQuery({
        queryKey: admissionsKeys.active(),
        queryFn: AdmissionsApi.active,
    });
}
export function useCreateAdmission() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => AdmissionsApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: admissionsKeys.all });
            queryClient.invalidateQueries({ queryKey: roomsKeys.all });
        },
    });
}
export function useDischargeAdmission() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => AdmissionsApi.discharge(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: admissionsKeys.all });
            queryClient.invalidateQueries({ queryKey: roomsKeys.all });
        },
    });
}
