import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DepartmentsApi } from './departments.api';
import type { CreateDepartmentDTO, Department, UpdateDepartmentDTO } from './departments.types';

export const departmentsKeys = {
  all: ['departments'] as const,
  list: () => [...departmentsKeys.all, 'list'] as const,
  details: () => [...departmentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...departmentsKeys.details(), id] as const,
  doctors: (id: string) => [...departmentsKeys.detail(id), 'doctors'] as const,
  rooms: (id: string) => [...departmentsKeys.detail(id), 'rooms'] as const,
};

export function useDepartments() {
  return useQuery({
    queryKey: departmentsKeys.list(),
    queryFn: DepartmentsApi.list,
  });
}

export function useDepartment(id: string) {
  return useQuery({
    queryKey: departmentsKeys.detail(id),
    queryFn: () => DepartmentsApi.get(id),
    enabled: !!id,
  });
}

export function useDepartmentDoctors(id: string) {
  return useQuery({
    queryKey: departmentsKeys.doctors(id),
    queryFn: () => DepartmentsApi.doctors(id),
    enabled: !!id,
  });
}

export function useDepartmentRooms(id: string) {
  return useQuery({
    queryKey: departmentsKeys.rooms(id),
    queryFn: () => DepartmentsApi.rooms(id),
    enabled: !!id,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDepartmentDTO) => DepartmentsApi.create(payload),
    onSuccess: (department: Department) => {
      queryClient.setQueryData(departmentsKeys.detail(department.id), department);
      queryClient.invalidateQueries({ queryKey: departmentsKeys.list() });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDepartmentDTO }) =>
      DepartmentsApi.update(id, payload),
    onSuccess: (department: Department) => {
      queryClient.setQueryData(departmentsKeys.detail(department.id), department);
      queryClient.invalidateQueries({ queryKey: departmentsKeys.list() });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DepartmentsApi.remove(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: departmentsKeys.detail(id) });
      queryClient.removeQueries({ queryKey: departmentsKeys.doctors(id) });
      queryClient.removeQueries({ queryKey: departmentsKeys.rooms(id) });
      queryClient.setQueryData<Department[]>(departmentsKeys.list(), (current) =>
        current?.filter((department) => department.id !== id) ?? current
      );
      queryClient.invalidateQueries({ queryKey: departmentsKeys.list() });
    },
  });
}
