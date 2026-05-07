import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { InvoicesApi } from './invoices.api';
import type { CreateInvoiceDTO, InvoiceListParams } from './invoices.types';

export const invoicesKeys = {
  all: ['invoices'] as const,
  lists: () => [...invoicesKeys.all, 'list'] as const,
  list: (params: InvoiceListParams = {}) =>
    [
      ...invoicesKeys.lists(),
      params.patientId?.trim() ?? '',
      params.status?.trim() ?? '',
    ] as const,
  stats: () => [...invoicesKeys.all, 'stats'] as const,
};

export function useInvoices(params: InvoiceListParams = {}) {
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
    mutationFn: (payload: CreateInvoiceDTO) => InvoicesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
    },
  });
}

export function usePayInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InvoicesApi.pay(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InvoicesApi.update(id, { status: 'CANCELLED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
    },
  });
}
