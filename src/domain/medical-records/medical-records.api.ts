import { api } from '@/libs/axios/client';
import type {
  CreatePrescriptionDTO,
  CreateMedicalRecordDTO,
  MedicalRecord,
  MedicalRecordsListParams,
  MedicalRecordsOrder,
  MedicalRecordsSortBy,
  PaginatedMedicalRecords,
  Prescription,
  UpdatePrescriptionDTO,
  UpdateMedicalRecordDTO,
} from './medical-records.types';

const BASE = '/api/medical-records';
const PRESCRIPTIONS_BASE = '/api/prescriptions';
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function normalizePositiveInteger(value: unknown, fallback: number) {
  const numberValue = Number(value);

  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : fallback;
}

function normalizeLimit(value: unknown) {
  return Math.min(normalizePositiveInteger(value, DEFAULT_LIMIT), MAX_LIMIT);
}

function normalizeSortBy(value: unknown): MedicalRecordsSortBy {
  return value === 'created_at' || value === 'date' ? value : 'date';
}

function normalizeOrder(value: unknown): MedicalRecordsOrder {
  return value === 'ASC' || value === 'DESC' ? value : 'DESC';
}

function buildMedicalRecordsQuery(params: MedicalRecordsListParams = {}) {
  const query = new URLSearchParams();

  if (params.patientId?.trim()) {
    query.set('patientId', params.patientId.trim());
  }

  query.set('page', String(normalizePositiveInteger(params.page, DEFAULT_PAGE)));
  query.set('limit', String(normalizeLimit(params.limit)));
  query.set('sortBy', normalizeSortBy(params.sortBy));
  query.set('order', normalizeOrder(params.order));

  return `?${query.toString()}`;
}

function getObjectList(value: unknown, key: 'items' | 'data') {
  if (typeof value !== 'object' || value === null || !(key in value)) {
    return null;
  }

  const nestedValue = (value as Record<'items' | 'data', unknown>)[key];
  return Array.isArray(nestedValue) ? nestedValue : null;
}

function normalizeList<T>(value: unknown, normalizeItem: (item: unknown) => T) {
  if (Array.isArray(value)) {
    return value.map(normalizeItem);
  }

  const items = getObjectList(value, 'items');

  if (items) {
    return items.map(normalizeItem);
  }

  const data = getObjectList(value, 'data');

  if (data) {
    return data.map(normalizeItem);
  }

  return [];
}

function normalizePaginatedMedicalRecords(
  value: unknown,
  params: MedicalRecordsListParams
): PaginatedMedicalRecords {
  const data = normalizeList(value, normalizeMedicalRecord);
  const page = normalizePositiveInteger(getValue(value, ['page']), params.page ?? DEFAULT_PAGE);
  const limit = normalizeLimit(getValue(value, ['limit']) ?? params.limit);
  const total = normalizePositiveInteger(getValue(value, ['total']), data.length);
  const totalPages = normalizePositiveInteger(
    getValue(value, ['totalPages', 'total_pages']),
    Math.max(1, Math.ceil(total / limit))
  );

  return {
    data,
    total,
    page,
    limit,
    totalPages,
  };
}

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

function normalizeNullableText(value: unknown) {
  if (value == null) {
    return null;
  }

  const text = normalizeText(value).trim();
  return text ? text : null;
}

function normalizePatient(value: unknown): MedicalRecord['patient'] {
  const patient = typeof value === 'object' && value !== null ? value : {};

  return {
    id: normalizeText(getValue(patient, ['id'])),
    firstName: normalizeText(getValue(patient, ['firstName', 'first_name'])),
    lastName: normalizeText(getValue(patient, ['lastName', 'last_name'])),
  };
}

function normalizeDoctor(value: unknown): MedicalRecord['doctor'] {
  const doctor = typeof value === 'object' && value !== null ? value : {};

  return {
    id: normalizeText(getValue(doctor, ['id'])),
    firstName: normalizeText(getValue(doctor, ['firstName', 'first_name'])),
    lastName: normalizeText(getValue(doctor, ['lastName', 'last_name'])),
    specialization: normalizeText(getValue(doctor, ['specialization'])),
  };
}

function normalizeMedicalRecord(value: unknown): MedicalRecord {
  const record = typeof value === 'object' && value !== null ? value : {};
  const patient = normalizePatient(getValue(record, ['patient']));
  const doctor = normalizeDoctor(getValue(record, ['doctor']));

  return {
    id: normalizeText(getValue(record, ['id'])),
    patientId: normalizeText(getValue(record, ['patientId', 'patient_id'])) || patient.id,
    doctorId: normalizeText(getValue(record, ['doctorId', 'doctor_id'])) || doctor.id,
    diagnosis: normalizeText(getValue(record, ['diagnosis', 'diagnoza'])),
    treatment: normalizeText(getValue(record, ['treatment', 'trajtimi'])),
    prescriptionsText:
      normalizeText(getValue(record, ['prescriptionsText', 'prescriptions_text', 'recetat'])) || null,
    recordDate: normalizeText(getValue(record, ['recordDate', 'date', 'data'])),
    patient,
    doctor,
    createdAt: normalizeText(getValue(record, ['createdAt', 'created_at'])),
    updatedAt: normalizeText(getValue(record, ['updatedAt', 'updated_at'])),
  };
}

function normalizePrescription(value: unknown): Prescription {
  const prescription = typeof value === 'object' && value !== null ? value : {};

  return {
    id: normalizeText(getValue(prescription, ['id'])),
    medicalRecordId: normalizeText(
      getValue(prescription, ['medicalRecordId', 'medical_record_id'])
    ),
    medicine: normalizeText(getValue(prescription, ['medicine', 'bari'])),
    dosage: normalizeText(getValue(prescription, ['dosage', 'dozimi'])),
    duration: normalizeText(getValue(prescription, ['duration', 'kohezgjatja'])),
    instructions: normalizeNullableText(getValue(prescription, ['instructions', 'udhezime'])),
    createdAt: normalizeText(getValue(prescription, ['createdAt', 'created_at'])),
    updatedAt: normalizeText(getValue(prescription, ['updatedAt', 'updated_at'])),
  };
}

export const MedicalRecordsApi = {
  list: (params: MedicalRecordsListParams = {}) =>
    api.core
      .get<unknown>(`${BASE}${buildMedicalRecordsQuery(params)}`)
      .then((r) => normalizePaginatedMedicalRecords(r.data, params)),

  get: (id: string) =>
    api.core.get<unknown>(`${BASE}/${id}`).then((r) => normalizeMedicalRecord(r.data)),

  listPrescriptions: (medicalRecordId: string) =>
    api.core
      .get<unknown>(`${BASE}/${encodeURIComponent(medicalRecordId)}/prescriptions`)
      .then((r) => normalizeList(r.data, normalizePrescription)),

  createPrescription: (payload: CreatePrescriptionDTO) =>
    api.core
      .post<unknown>(PRESCRIPTIONS_BASE, payload)
      .then((r) => normalizePrescription(r.data)),

  updatePrescription: (id: string, payload: UpdatePrescriptionDTO) =>
    api.core
      .put<unknown>(`${PRESCRIPTIONS_BASE}/${id}`, payload)
      .then((r) => normalizePrescription(r.data)),

  removePrescription: (id: string) =>
    api.core.delete<void>(`${PRESCRIPTIONS_BASE}/${id}`).then(() => undefined),

  create: (payload: CreateMedicalRecordDTO) =>
    api.core.post<unknown>(BASE, payload).then((r) => normalizeMedicalRecord(r.data)),

  update: (id: string, payload: UpdateMedicalRecordDTO) =>
    api.core.put<unknown>(`${BASE}/${id}`, payload).then((r) => normalizeMedicalRecord(r.data)),

  remove: (id: string) =>
    api.core.delete<void>(`${BASE}/${id}`).then(() => undefined),
};
