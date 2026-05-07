export const invoiceStatusValues = ['PENDING', 'PAID', 'CANCELLED'] as const;

export type InvoiceStatus = (typeof invoiceStatusValues)[number];

export type InvoicePatient = {
  id: string;
  firstName?: string;
  lastName?: string;
};

export type Invoice = {
  id: string;
  patientId: string;
  amount: number;
  invoiceDate: string;
  status: InvoiceStatus | string;
  description: string | null;
  patient?: InvoicePatient | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

export type InvoiceStats = {
  totalRevenue: number;
};

export type InvoiceListParams = {
  patientId?: string;
  status?: InvoiceStatus | '';
};

export type CreateInvoiceDTO = {
  patientId: string;
  amount: number;
  invoiceDate: string;
  description?: string;
};

export type UpdateInvoiceDTO = {
  patientId?: string;
  amount?: number;
  invoiceDate?: string;
  description?: string | null;
  status?: InvoiceStatus;
};
