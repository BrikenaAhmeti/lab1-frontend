import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { NursesApi } from './nurses.api';
import type { CreateNurseDTO, Nurse, NursesListParams, UpdateNurseDTO } from './nurses.types';

export const nursesKeys = {
  all: ['nurses'] as const,
  lists: () => [...nursesKeys.all, 'list'] as const,
  list: (params: NursesListParams = {}) =>
    [
      ...nursesKeys.lists(),
      params.departmentId?.trim() ?? '',
      params.search?.trim() ?? '',
      params.shift?.trim() ?? '',
    ] as const,
  details: () => [...nursesKeys.all, 'detail'] as const,
  detail: (id: string) => [...nursesKeys.details(), id] as const,
};

export function useNurses(params: NursesListParams = {}) {
  return useQuery({
    queryKey: nursesKeys.list(params),
    queryFn: () => NursesApi.list(params),
  });
}

export function useNurse(id: string) {
  return useQuery({
    queryKey: nursesKeys.detail(id),
    queryFn: () => NursesApi.get(id),
    enabled: !!id,
  });
}

export function useCreateNurse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNurseDTO) => NursesApi.create(payload),
    onSuccess: (nurse: Nurse) => {
      queryClient.setQueryData(nursesKeys.detail(nurse.id), nurse);
      queryClient.invalidateQueries({ queryKey: nursesKeys.lists() });
    },
  });
}

export function useUpdateNurse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateNurseDTO }) =>
      NursesApi.update(id, payload),
    onSuccess: (nurse: Nurse) => {
      queryClient.setQueryData(nursesKeys.detail(nurse.id), nurse);
      queryClient.invalidateQueries({ queryKey: nursesKeys.lists() });
    },
  });
}

export function useDeleteNurse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => NursesApi.remove(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: nursesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: nursesKeys.lists() });
    },
  });
}
