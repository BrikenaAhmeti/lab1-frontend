import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DepartmentsApi } from './departments.api';
export const departmentsKeys = {
    all: ['departments'],
    list: () => [...departmentsKeys.all, 'list'],
    details: () => [...departmentsKeys.all, 'detail'],
    detail: (id) => [...departmentsKeys.details(), id],
    doctors: (id) => [...departmentsKeys.detail(id), 'doctors'],
    rooms: (id) => [...departmentsKeys.detail(id), 'rooms'],
};
export function useDepartments() {
    return useQuery({
        queryKey: departmentsKeys.list(),
        queryFn: DepartmentsApi.list,
    });
}
export function useDepartment(id) {
    return useQuery({
        queryKey: departmentsKeys.detail(id),
        queryFn: () => DepartmentsApi.get(id),
        enabled: !!id,
    });
}
export function useDepartmentDoctors(id) {
    return useQuery({
        queryKey: departmentsKeys.doctors(id),
        queryFn: () => DepartmentsApi.doctors(id),
        enabled: !!id,
    });
}
export function useDepartmentRooms(id) {
    return useQuery({
        queryKey: departmentsKeys.rooms(id),
        queryFn: () => DepartmentsApi.rooms(id),
        enabled: !!id,
    });
}
export function useCreateDepartment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => DepartmentsApi.create(payload),
        onSuccess: (department) => {
            queryClient.setQueryData(departmentsKeys.detail(department.id), department);
            queryClient.invalidateQueries({ queryKey: departmentsKeys.list() });
        },
    });
}
export function useUpdateDepartment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => DepartmentsApi.update(id, payload),
        onSuccess: (department) => {
            queryClient.setQueryData(departmentsKeys.detail(department.id), department);
            queryClient.invalidateQueries({ queryKey: departmentsKeys.list() });
        },
    });
}
export function useDeleteDepartment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => DepartmentsApi.remove(id),
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: departmentsKeys.detail(id) });
            queryClient.removeQueries({ queryKey: departmentsKeys.doctors(id) });
            queryClient.removeQueries({ queryKey: departmentsKeys.rooms(id) });
            queryClient.setQueryData(departmentsKeys.list(), (current) => current?.filter((department) => department.id !== id) ?? current);
            queryClient.invalidateQueries({ queryKey: departmentsKeys.list() });
        },
    });
}
