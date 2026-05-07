import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { InvoicesApi } from './invoices.api';
export const invoicesKeys = {
    all: ['invoices'],
    lists: () => [...invoicesKeys.all, 'list'],
    list: (params = {}) => [
        ...invoicesKeys.lists(),
        params.patientId?.trim() ?? '',
        params.status?.trim() ?? '',
    ],
    stats: () => [...invoicesKeys.all, 'stats'],
};
export function useInvoices(params = {}) {
    return useQuery({
        queryKey: invoicesKeys.list(params),
        queryFn: () => InvoicesApi.list(params),
    });
}
export function useInvoiceStats() {
    return useQuery({
        queryKey: invoicesKeys.stats(),
        queryFn: InvoicesApi.stats,
    });
}
export function useCreateInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => InvoicesApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
        },
    });
}
export function usePayInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => InvoicesApi.pay(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
        },
    });
}
export function useCancelInvoice() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => InvoicesApi.update(id, { status: 'CANCELLED' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
        },
    });
}
