import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MedicalRecordsApi } from './medical-records.api';
export const medicalRecordsKeys = {
    all: ['medical-records'],
    lists: () => [...medicalRecordsKeys.all, 'list'],
    list: (patientId) => [...medicalRecordsKeys.lists(), patientId],
    details: () => [...medicalRecordsKeys.all, 'detail'],
    detail: (id) => [...medicalRecordsKeys.details(), id],
    prescriptions: () => [...medicalRecordsKeys.all, 'prescriptions'],
    prescriptionList: (id) => [...medicalRecordsKeys.prescriptions(), id],
};
export function useMedicalRecords(patientId) {
    return useQuery({
        queryKey: medicalRecordsKeys.list(patientId),
        queryFn: () => MedicalRecordsApi.list({ patientId }),
        enabled: !!patientId,
    });
}
export function useMedicalRecord(id) {
    return useQuery({
        queryKey: medicalRecordsKeys.detail(id),
        queryFn: () => MedicalRecordsApi.get(id),
        enabled: !!id,
    });
}
export function useMedicalRecordPrescriptions(id, enabled = true) {
    return useQuery({
        queryKey: medicalRecordsKeys.prescriptionList(id),
        queryFn: () => MedicalRecordsApi.listPrescriptions(id),
        enabled: !!id && enabled,
    });
}
export function useCreateMedicalRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => MedicalRecordsApi.create(payload),
        onSuccess: (record) => {
            queryClient.setQueryData(medicalRecordsKeys.detail(record.id), record);
            queryClient.invalidateQueries({ queryKey: medicalRecordsKeys.all });
        },
    });
}
export function useUpdateMedicalRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => MedicalRecordsApi.update(id, payload),
        onSuccess: (record) => {
            queryClient.setQueryData(medicalRecordsKeys.detail(record.id), record);
            queryClient.invalidateQueries({ queryKey: medicalRecordsKeys.all });
        },
    });
}
export function useDeleteMedicalRecord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => MedicalRecordsApi.remove(id),
        onSuccess: (_, id) => {
            queryClient.removeQueries({ queryKey: medicalRecordsKeys.detail(id) });
            queryClient.removeQueries({ queryKey: medicalRecordsKeys.prescriptionList(id) });
            queryClient.invalidateQueries({ queryKey: medicalRecordsKeys.all });
        },
    });
}
