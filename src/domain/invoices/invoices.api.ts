import { api } from '@/libs/axios/client';
import type {
  CreateInvoiceDTO,
  Invoice,
  InvoiceListParams,
  InvoiceStats,
  UpdateInvoiceDTO,
} from './invoices.types';

const BASE = '/api/invoices';

function getObjectList(value: unknown, key: 'items' | 'data') {
  if (typeof value !== 'object' || value === null || !(key in value)) {
    return null;
  }

  const nestedValue = (value as Record<string, unknown>)[key];
  return Array.isArray(nestedValue) ? nestedValue : null;
}

function normalizeList<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  const items = getObjectList(value, 'items');

  if (items) {
    return items as T[];
  }

  const data = getObjectList(value, 'data');

  if (data) {
    return data as T[];
  }

  return [];
}

function normalizeStats(value: unknown): InvoiceStats {
  if (typeof value !== 'object' || value === null || !('totalRevenue' in value)) {
    return { totalRevenue: 0 };
  }

  const totalRevenue = Number((value as { totalRevenue?: unknown }).totalRevenue);

  return {
    totalRevenue: Number.isFinite(totalRevenue) ? totalRevenue : 0,
  };
}

function buildInvoicesQuery(params: InvoiceListParams = {}) {
  const query = new URLSearchParams();

  if (params.patientId?.trim()) {
    query.set('patientId', params.patientId.trim());
  }

  if (params.status?.trim()) {
    query.set('status', params.status.trim());
  }

  if (params.date?.trim()) {
    query.set('date', params.date.trim());
  }

  if (params.from?.trim()) {
    query.set('from', params.from.trim());
  }

  if (params.to?.trim()) {
    query.set('to', params.to.trim());
  }

  const value = query.toString();
  return value ? `?${value}` : '';
}

export const InvoicesApi = {
  list: (params: InvoiceListParams = {}) =>
    api.core
      .get<unknown>(`${BASE}${buildInvoicesQuery(params)}`)
      .then((response) => normalizeList<Invoice>(response.data)),

  get: (id: string) =>
    api.core.get<Invoice>(`${BASE}/${id}`).then((response) => response.data),

  create: (payload: CreateInvoiceDTO) =>
    api.core.post<Invoice>(BASE, payload).then((response) => response.data),

  update: (id: string, payload: UpdateInvoiceDTO) =>
    api.core.put<Invoice | void>(`${BASE}/${id}`, payload).then((response) => response.data),

  pay: (id: string) =>
    api.core.put<Invoice | void>(`${BASE}/${id}/pay`).then((response) => response.data),

  remove: (id: string) =>
    api.core.delete<void>(`${BASE}/${id}`).then(() => undefined),

  stats: () =>
    api.core
      .get<unknown>(`${BASE}/stats`)
      .then((response) => normalizeStats(response.data)),
};
