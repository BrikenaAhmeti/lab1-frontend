import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PatientsApi } from './patients.api';
import type {
  CreatePatientDTO,
  Patient,
  PatientsListParams,
  UpdatePatientDTO,
} from './patients.types';

export const patientsKeys = {
  all: ['patients'] as const,
  lists: () => [...patientsKeys.all, 'list'] as const,
  list: (params: PatientsListParams) =>
    [...patientsKeys.lists(), params.page ?? 1, params.limit ?? 10, params.search?.trim() ?? ''] as const,
  details: () => [...patientsKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientsKeys.details(), id] as const,
};

export function usePatients(params: PatientsListParams) {
  return useQuery({
    queryKey: patientsKeys.list(params),
    queryFn: () => PatientsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: patientsKeys.detail(id),
    queryFn: () => PatientsApi.get(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePatientDTO) => PatientsApi.create(payload),
    onSuccess: (patient: Patient) => {
      queryClient.setQueryData(patientsKeys.detail(patient.id), patient);
      queryClient.invalidateQueries({ queryKey: patientsKeys.lists() });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePatientDTO }) =>
      PatientsApi.update(id, payload),
    onSuccess: (patient: Patient) => {
      queryClient.setQueryData(patientsKeys.detail(patient.id), patient);
      queryClient.invalidateQueries({ queryKey: patientsKeys.lists() });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PatientsApi.remove(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: patientsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: patientsKeys.lists() });
    },
  });
}
