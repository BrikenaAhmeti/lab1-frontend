import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MedicalRecordsApi } from './medical-records.api';
import type {
  CreateMedicalRecordDTO,
  MedicalRecord,
  Prescription,
  UpdateMedicalRecordDTO,
} from './medical-records.types';

export const medicalRecordsKeys = {
  all: ['medical-records'] as const,
  lists: () => [...medicalRecordsKeys.all, 'list'] as const,
  list: (patientId: string) => [...medicalRecordsKeys.lists(), patientId] as const,
  details: () => [...medicalRecordsKeys.all, 'detail'] as const,
  detail: (id: string) => [...medicalRecordsKeys.details(), id] as const,
  prescriptions: () => [...medicalRecordsKeys.all, 'prescriptions'] as const,
  prescriptionList: (id: string) => [...medicalRecordsKeys.prescriptions(), id] as const,
};

export function useMedicalRecords(patientId: string) {
  return useQuery<MedicalRecord[]>({
    queryKey: medicalRecordsKeys.list(patientId),
    queryFn: () => MedicalRecordsApi.list({ patientId }),
    enabled: !!patientId,
  });
}

export function useMedicalRecord(id: string) {
  return useQuery<MedicalRecord>({
    queryKey: medicalRecordsKeys.detail(id),
    queryFn: () => MedicalRecordsApi.get(id),
    enabled: !!id,
  });
}

export function useMedicalRecordPrescriptions(id: string, enabled = true) {
  return useQuery<Prescription[]>({
    queryKey: medicalRecordsKeys.prescriptionList(id),
    queryFn: () => MedicalRecordsApi.listPrescriptions(id),
    enabled: !!id && enabled,
  });
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMedicalRecordDTO) => MedicalRecordsApi.create(payload),
    onSuccess: (record: MedicalRecord) => {
      queryClient.setQueryData(medicalRecordsKeys.detail(record.id), record);
      queryClient.invalidateQueries({ queryKey: medicalRecordsKeys.all });
    },
  });
}

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMedicalRecordDTO }) =>
      MedicalRecordsApi.update(id, payload),
    onSuccess: (record: MedicalRecord) => {
      queryClient.setQueryData(medicalRecordsKeys.detail(record.id), record);
      queryClient.invalidateQueries({ queryKey: medicalRecordsKeys.all });
    },
  });
}

export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => MedicalRecordsApi.remove(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: medicalRecordsKeys.detail(id) });
      queryClient.removeQueries({ queryKey: medicalRecordsKeys.prescriptionList(id) });
      queryClient.invalidateQueries({ queryKey: medicalRecordsKeys.all });
    },
  });
}
