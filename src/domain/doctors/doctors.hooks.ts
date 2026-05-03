import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DoctorsApi } from './doctors.api';
import type { CreateDoctorDTO, Doctor, UpdateDoctorDTO } from './doctors.types';

export const doctorsKeys = {
  all: ['doctors'] as const,
  list: () => [...doctorsKeys.all, 'list'] as const,
  details: () => [...doctorsKeys.all, 'detail'] as const,
  detail: (id: string) => [...doctorsKeys.details(), id] as const,
};

export function useDoctors() {
  return useQuery({
    queryKey: doctorsKeys.list(),
    queryFn: DoctorsApi.list,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: doctorsKeys.detail(id),
    queryFn: () => DoctorsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDoctorDTO) => DoctorsApi.create(payload),
    onSuccess: (doctor: Doctor) => {
      queryClient.setQueryData(doctorsKeys.detail(doctor.id), doctor);
      queryClient.invalidateQueries({ queryKey: doctorsKeys.list() });
    },
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDoctorDTO }) =>
      DoctorsApi.update(id, payload),
    onSuccess: (doctor: Doctor) => {
      queryClient.setQueryData(doctorsKeys.detail(doctor.id), doctor);
      queryClient.invalidateQueries({ queryKey: doctorsKeys.list() });
    },
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DoctorsApi.remove(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: doctorsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: doctorsKeys.list() });
    },
  });
}
