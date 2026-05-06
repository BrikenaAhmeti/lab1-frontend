import { api } from '@/libs/axios/client';
import type {
  CreateMedicalRecordDTO,
  MedicalRecord,
  MedicalRecordsListParams,
  Prescription,
  UpdateMedicalRecordDTO,
} from './medical-records.types';

const BASE = '/api/medical-records';

function buildMedicalRecordsQuery(params: MedicalRecordsListParams = {}) {
  const query = new URLSearchParams();

  if (params.patientId?.trim()) {
    query.set('patientId', params.patientId.trim());
  }

  const value = query.toString();
  return value ? `?${value}` : '';
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
    prescriptionsText: normalizeNullableText(
      getValue(record, ['prescriptionsText', 'prescriptions_text', 'recetat'])
    ),
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
    medicine: normalizeText(getValue(prescription, ['medicine'])),
    dosage: normalizeText(getValue(prescription, ['dosage'])),
    duration: normalizeText(getValue(prescription, ['duration'])),
    instructions: normalizeNullableText(getValue(prescription, ['instructions'])),
    createdAt: normalizeText(getValue(prescription, ['createdAt', 'created_at'])),
    updatedAt: normalizeText(getValue(prescription, ['updatedAt', 'updated_at'])),
  };
}

export const MedicalRecordsApi = {
  list: (params: MedicalRecordsListParams = {}) =>
    api.core
      .get<unknown>(`${BASE}${buildMedicalRecordsQuery(params)}`)
      .then((r) => normalizeList(r.data, normalizeMedicalRecord)),

  get: (id: string) =>
    api.core.get<unknown>(`${BASE}/${id}`).then((r) => normalizeMedicalRecord(r.data)),

  listPrescriptions: (id: string) =>
    api.core
      .get<unknown>(`${BASE}/${id}/prescriptions`)
      .then((r) => normalizeList(r.data, normalizePrescription)),

  create: (payload: CreateMedicalRecordDTO) =>
    api.core.post<unknown>(BASE, payload).then((r) => normalizeMedicalRecord(r.data)),

  update: (id: string, payload: UpdateMedicalRecordDTO) =>
    api.core.put<unknown>(`${BASE}/${id}`, payload).then((r) => normalizeMedicalRecord(r.data)),

  remove: (id: string) =>
    api.core.delete<void>(`${BASE}/${id}`).then(() => undefined),
};
