import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomsKeys } from '@/domain/rooms/rooms.hooks';
import { AdmissionsApi } from './admissions.api';
import type { AdmissionsListParams, CreateAdmissionDTO } from './admissions.types';

export const admissionsKeys = {
  all: ['admissions'] as const,
  lists: () => [...admissionsKeys.all, 'list'] as const,
  list: (params: AdmissionsListParams = {}) =>
    [...admissionsKeys.lists(), params.status?.trim() ?? ''] as const,
  active: () => [...admissionsKeys.all, 'active'] as const,
};

export function useAdmissions(params: AdmissionsListParams = {}) {
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
    mutationFn: (payload: CreateAdmissionDTO) => AdmissionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.all });
      queryClient.invalidateQueries({ queryKey: roomsKeys.all });
    },
  });
}

export function useDischargeAdmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => AdmissionsApi.discharge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: admissionsKeys.all });
      queryClient.invalidateQueries({ queryKey: roomsKeys.all });
    },
  });
}
