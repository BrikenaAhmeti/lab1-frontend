import { api } from '@/libs/axios/client';
import type {
  CreatePatientDTO,
  Patient,
  PatientBloodType,
  PatientGender,
  PatientsListParams,
  PatientsListResponse,
  UpdatePatientDTO,
} from './patients.types';

const BASE = '/api/patients';
const patientGenders: PatientGender[] = ['MALE', 'FEMALE', 'OTHER'];
const patientBloodTypes: PatientBloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function getValue(source: unknown, keys: string[]) {
  if (typeof source !== 'object' || source === null) {
    return undefined;
  }

  for (const key of keys) {
    if (key in source) {
      return (source as Record<string, unknown>)[key];
    }
  }

  return undefined;
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function normalizePositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeDate(value: unknown) {
  const text = normalizeText(value);

  return text.includes('T') ? text.split('T')[0] : text;
}

function normalizeNullableText(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const text = normalizeText(value).trim();

  return text || null;
}

function normalizeGender(value: unknown): PatientGender {
  const normalized = normalizeText(value).trim().toUpperCase();

  return patientGenders.includes(normalized as PatientGender)
    ? normalized as PatientGender
    : 'OTHER';
}

function normalizeBloodType(value: unknown): PatientBloodType {
  const normalized = normalizeText(value).trim().toUpperCase();

  return patientBloodTypes.includes(normalized as PatientBloodType)
    ? normalized as PatientBloodType
    : 'O+';
}

function getObjectList(value: unknown, key: 'items' | 'data') {
  if (typeof value !== 'object' || value === null || !(key in value)) {
    return null;
  }

  const nestedValue = (value as Record<'items' | 'data', unknown>)[key];
  return Array.isArray(nestedValue) ? nestedValue : null;
}

function normalizePatient(value: unknown): Patient {
  const patient = typeof value === 'object' && value !== null ? value : {};

  return {
    id: normalizeText(getValue(patient, ['id'])),
    userId: normalizeNullableText(getValue(patient, ['userId', 'user_id'])),
    firstName: normalizeText(getValue(patient, ['firstName', 'first_name'])),
    lastName: normalizeText(getValue(patient, ['lastName', 'last_name'])),
    dateOfBirth: normalizeDate(getValue(patient, ['dateOfBirth', 'date_of_birth'])),
    gender: normalizeGender(getValue(patient, ['gender'])),
    phoneNumber: normalizeText(getValue(patient, ['phoneNumber', 'phone_number'])),
    address: normalizeText(getValue(patient, ['address'])),
    bloodType: normalizeBloodType(getValue(patient, ['bloodType', 'blood_type'])),
  };
}

function normalizePatientList(value: unknown, params: PatientsListParams): PatientsListResponse {
  const list = Array.isArray(value)
    ? value
    : getObjectList(value, 'items') ?? getObjectList(value, 'data') ?? [];
  const items = list.map(normalizePatient);
  const page = normalizePositiveInteger(getValue(value, ['page']), params.page ?? 1);
  const limit = normalizePositiveInteger(getValue(value, ['limit']), params.limit ?? 10);
  const total = normalizePositiveInteger(getValue(value, ['total']), items.length);
  const totalPages = normalizePositiveInteger(
    getValue(value, ['totalPages', 'total_pages']),
    Math.max(1, Math.ceil(total / limit))
  );

  return {
    items,
    data: items,
    page,
    limit,
    total,
    totalPages,
  };
}

function buildPatientsQuery(params: PatientsListParams) {
  const query = new URLSearchParams();

  query.set('page', String(params.page ?? 1));
  query.set('limit', String(params.limit ?? 10));

  if (params.search?.trim()) {
    query.set('search', params.search.trim());
  }

  return query.toString();
}

export const PatientsApi = {
  list: (params: PatientsListParams = {}) =>
    api.core
      .get<unknown>(`${BASE}?${buildPatientsQuery(params)}`)
      .then((r) => normalizePatientList(r.data, params)),

  get: (id: string) =>
    api.core.get<unknown>(`${BASE}/${id}`).then((r) => normalizePatient(r.data)),

  create: (payload: CreatePatientDTO) =>
    api.core.post<unknown>(BASE, payload).then((r) => normalizePatient(r.data)),

  update: (id: string, payload: UpdatePatientDTO) =>
    api.core.put<unknown>(`${BASE}/${id}`, payload).then((r) => normalizePatient(r.data)),

  remove: (id: string) =>
    api.core.delete<void>(`${BASE}/${id}`).then(() => undefined),
};
