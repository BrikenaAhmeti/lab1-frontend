import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NursesApi } from './nurses.api';
export const nursesKeys = {
    all: ['nurses'],
    lists: () => [...nursesKeys.all, 'list'],
    list: (params = {}) => [...nursesKeys.lists(), params.departmentId?.trim() ?? ''],
    details: () => [...nursesKeys.all, 'detail'],
    detail: (id) => [...nursesKeys.details(), id],
};
export function useNurses(params = {}) {
    return useQuery({
        queryKey: nursesKeys.list(params),
        queryFn: () => NursesApi.list(params),
    });
}
export function useNurse(id) {
    return useQuery({
        queryKey: nursesKeys.detail(id),
        queryFn: () => NursesApi.get(id),
        enabled: !!id,
    });
}
export function useCreateNurse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => NursesApi.create(payload),
        onSuccess: (nurse) => {
            queryClient.setQueryData(nursesKeys.detail(nurse.id), nurse);
            queryClient.invalidateQueries({ queryKey: nursesKeys.lists() });
        },
    });
}
export function useUpdateNurse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => NursesApi.update(id, payload),
        onSuccess: (nurse) => {
            queryClient.setQueryData(nursesKeys.detail(nurse.id), nurse);
            queryClient.invalidateQueries({ queryKey: nursesKeys.lists() });
        },
    });
}
export function useDeleteNurse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => NursesApi.remove(id),
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: nursesKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: nursesKeys.lists() });
        },
    });
}
