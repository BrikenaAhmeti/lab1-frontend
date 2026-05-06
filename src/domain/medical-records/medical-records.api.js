import { api } from '@/libs/axios/client';
const BASE = '/api/medical-records';
function buildMedicalRecordsQuery(params = {}) {
    const query = new URLSearchParams();
    if (params.patientId?.trim()) {
        query.set('patientId', params.patientId.trim());
    }
    const value = query.toString();
    return value ? `?${value}` : '';
}
function getObjectList(value, key) {
    if (typeof value !== 'object' || value === null || !(key in value)) {
        return null;
    }
    const nestedValue = value[key];
    return Array.isArray(nestedValue) ? nestedValue : null;
}
function normalizeList(value, normalizeItem) {
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
function getValue(source, keys) {
    if (typeof source !== 'object' || source === null) {
        return undefined;
    }
    for (const key of keys) {
        if (key in source) {
            return source[key];
        }
    }
    return undefined;
}
function normalizeText(value) {
    return typeof value === 'string' ? value : value == null ? '' : String(value);
}
function normalizeNullableText(value) {
    if (value == null) {
        return null;
    }
    const text = normalizeText(value).trim();
    return text ? text : null;
}
function normalizePatient(value) {
    const patient = typeof value === 'object' && value !== null ? value : {};
    return {
        id: normalizeText(getValue(patient, ['id'])),
        firstName: normalizeText(getValue(patient, ['firstName', 'first_name'])),
        lastName: normalizeText(getValue(patient, ['lastName', 'last_name'])),
    };
}
function normalizeDoctor(value) {
    const doctor = typeof value === 'object' && value !== null ? value : {};
    return {
        id: normalizeText(getValue(doctor, ['id'])),
        firstName: normalizeText(getValue(doctor, ['firstName', 'first_name'])),
        lastName: normalizeText(getValue(doctor, ['lastName', 'last_name'])),
        specialization: normalizeText(getValue(doctor, ['specialization'])),
    };
}
function normalizeMedicalRecord(value) {
    const record = typeof value === 'object' && value !== null ? value : {};
    const patient = normalizePatient(getValue(record, ['patient']));
    const doctor = normalizeDoctor(getValue(record, ['doctor']));
    return {
        id: normalizeText(getValue(record, ['id'])),
        patientId: normalizeText(getValue(record, ['patientId', 'patient_id'])) || patient.id,
        doctorId: normalizeText(getValue(record, ['doctorId', 'doctor_id'])) || doctor.id,
        diagnosis: normalizeText(getValue(record, ['diagnosis', 'diagnoza'])),
        treatment: normalizeText(getValue(record, ['treatment', 'trajtimi'])),
        prescriptionsText: normalizeNullableText(getValue(record, ['prescriptionsText', 'prescriptions_text', 'recetat'])),
        recordDate: normalizeText(getValue(record, ['recordDate', 'date', 'data'])),
        patient,
        doctor,
        createdAt: normalizeText(getValue(record, ['createdAt', 'created_at'])),
        updatedAt: normalizeText(getValue(record, ['updatedAt', 'updated_at'])),
    };
}
function normalizePrescription(value) {
    const prescription = typeof value === 'object' && value !== null ? value : {};
    return {
        id: normalizeText(getValue(prescription, ['id'])),
        medicalRecordId: normalizeText(getValue(prescription, ['medicalRecordId', 'medical_record_id'])),
        medicine: normalizeText(getValue(prescription, ['medicine'])),
        dosage: normalizeText(getValue(prescription, ['dosage'])),
        duration: normalizeText(getValue(prescription, ['duration'])),
        instructions: normalizeNullableText(getValue(prescription, ['instructions'])),
        createdAt: normalizeText(getValue(prescription, ['createdAt', 'created_at'])),
        updatedAt: normalizeText(getValue(prescription, ['updatedAt', 'updated_at'])),
    };
}
export const MedicalRecordsApi = {
    list: (params = {}) => api.core
        .get(`${BASE}${buildMedicalRecordsQuery(params)}`)
        .then((r) => normalizeList(r.data, normalizeMedicalRecord)),
    get: (id) => api.core.get(`${BASE}/${id}`).then((r) => normalizeMedicalRecord(r.data)),
    listPrescriptions: (id) => api.core
        .get(`${BASE}/${id}/prescriptions`)
        .then((r) => normalizeList(r.data, normalizePrescription)),
    create: (payload) => api.core.post(BASE, payload).then((r) => normalizeMedicalRecord(r.data)),
    update: (id, payload) => api.core.put(`${BASE}/${id}`, payload).then((r) => normalizeMedicalRecord(r.data)),
    remove: (id) => api.core.delete(`${BASE}/${id}`).then(() => undefined),
};
