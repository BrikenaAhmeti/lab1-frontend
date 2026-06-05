import type { ReactNode } from 'react';

export type Language = 'en' | 'de';

export type LocalizedText = Record<Language, string>;

export type SortOrder = 'ASC' | 'DESC';

export type ModuleKey =
  | 'patients'
  | 'doctors'
  | 'departments'
  | 'appointments'
  | 'medical-records'
  | 'prescriptions'
  | 'rooms'
  | 'admissions'
  | 'invoices'
  | 'nurses'
  | 'receptionists';

export type ReferenceKey =
  | 'patients'
  | 'departments'
  | 'users'
  | 'doctors'
  | 'rooms'
  | 'medicalRecords'
  | 'admissions';

export type User = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  fullName?: string;
  roles: string[];
  [key: string]: any;
};

export type AuthPayload = {
  user?: any;
  accessToken: string;
  refreshToken?: string;
};

export type PaginatedResponse<T = any> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CrudService = {
  list: (params?: Record<string, any>) => Promise<PaginatedResponse>;
  get: (id: string) => Promise<any>;
  create: (payload: any) => Promise<any>;
  update: (id: string, payload: any) => Promise<any>;
  remove: (id: string) => Promise<void>;
};

export type OptionConfig = {
  value: string;
  label: LocalizedText;
};

export type ColumnConfig = {
  key: string;
  label: LocalizedText;
  className?: string;
  render?: (item: any, language: Language) => ReactNode;
};

export type FilterFieldType = 'text' | 'select' | 'date';

export type FilterConfig = {
  name: string;
  label: LocalizedText;
  type: FilterFieldType;
  placeholder?: LocalizedText;
  options?: OptionConfig[];
  source?: ReferenceKey;
};

export type FormFieldType = 'text' | 'textarea' | 'date' | 'time' | 'number' | 'select' | 'password';

export type FormFieldConfig = {
  name: string;
  label: LocalizedText;
  type: FormFieldType;
  valuePaths?: string[];
  placeholder?: LocalizedText;
  hint?: LocalizedText;
  options?: OptionConfig[];
  source?: ReferenceKey;
  step?: string;
  modes?: Array<'create' | 'edit'>;
  showWhen?: (values: Record<string, any>, mode: 'create' | 'edit') => boolean;
};

export type ModuleConfig = {
  key: ModuleKey;
  path: string;
  label: LocalizedText;
  description: LocalizedText;
  singular: LocalizedText;
  endpoint: string;
  service: CrudService;
  sortOptions: OptionConfig[];
  defaultSortBy: string;
  defaultOrder?: SortOrder;
  filters: FilterConfig[];
  fields: FormFieldConfig[];
  columns: ColumnConfig[];
  schema?: any;
  getSchema?: (mode: 'create' | 'edit') => any;
  listPageSizeOptions?: number[];
  permissions?: {
    create?: string[];
    edit?: string[];
    delete?: string[];
  };
  actions?: {
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
  };
  createDefaults?: Record<string, any>;
  cleanPayload?: (values: any, mode: 'create' | 'edit') => any;
  getItemTitle?: (item: any) => string;
  getInitialValues?: (item: any, mode: 'create' | 'edit') => Record<string, any>;
  getPasswordUserId?: (item: any) => string;
};

export type ReferenceConfig = {
  key: ReferenceKey;
  endpoint: string;
  fallbackPaths?: string[];
  params?: Record<string, any>;
  getLabel: (item: any) => string;
};

export type ReferenceOption = {
  value: string;
  label: string;
};
