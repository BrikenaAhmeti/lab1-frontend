import { z } from 'zod';
import Badge from '@/ui/atoms/Badge';
import { lt } from './copy';
import { createCrudService } from './lib/api';
import { formatCurrency, formatDate, formatPersonName, getStatusVariant, getValue, stripEmptyValues } from './lib/utils';
import type { ModuleConfig, ModuleKey, OptionConfig, ReferenceConfig } from './types';

const requiredText = 'This field is required.';
const positiveNumberText = 'Enter a value greater than zero.';
const listPageSizeOptions = [10, 20, 50];

const requiredString = () => z.string().trim().min(1, requiredText);
const positiveNumber = () => z.coerce.number().gt(0, positiveNumberText);

function option(value: string, en: string, sq: string): OptionConfig {
  return {
    value,
    label: lt(en, sq),
  };
}

const bloodGroups = [
  option('A+', 'A+', 'A+'),
  option('A-', 'A-', 'A-'),
  option('B+', 'B+', 'B+'),
  option('B-', 'B-', 'B-'),
  option('AB+', 'AB+', 'AB+'),
  option('AB-', 'AB-', 'AB-'),
  option('O+', 'O+', 'O+'),
  option('O-', 'O-', 'O-'),
];

const genders = [
  option('MALE', 'Male', 'Mashkull'),
  option('FEMALE', 'Female', 'Femër'),
  option('OTHER', 'Other', 'Tjetër'),
];

const appointmentStatuses = [
  option('Scheduled', 'Scheduled', 'I planifikuar'),
  option('Completed', 'Completed', 'I përfunduar'),
  option('Cancelled', 'Cancelled', 'I anuluar'),
];

const roomTypes = [
  option('GENERAL', 'General', 'E përgjithshme'),
  option('ICU', 'ICU', 'Intensivë'),
  option('SURGERY', 'Surgery', 'Kirurgji'),
  option('EMERGENCY', 'Emergency', 'Urgjencë'),
  option('PEDIATRIC', 'Pediatric', 'Pediatri'),
];

const roomStatuses = [
  option('AVAILABLE', 'Available', 'E lirë'),
  option('OCCUPIED', 'Occupied', 'E zënë'),
  option('UNDER_MAINTENANCE', 'Under maintenance', 'Në mirëmbajtje'),
];

const admissionStatuses = [
  option('ACTIVE', 'Active', 'Aktive'),
  option('DISCHARGED', 'Discharged', 'E liruar'),
];

const invoiceStatuses = [
  option('PENDING', 'Pending', 'Në pritje'),
  option('PAID', 'Paid', 'E paguar'),
  option('CANCELLED', 'Cancelled', 'E anuluar'),
];

const nurseShifts = [
  option('Morning', 'Morning', 'Paradite'),
  option('Evening', 'Evening', 'Pasdite'),
  option('Night', 'Night', 'Natë'),
];

function getDepartmentName(item: any) {
  return String(getValue(item, 'department.name', 'departmentName', 'department_name'));
}

function getPatientName(item: any) {
  const patient = getValue(item, 'patient');
  return formatPersonName(patient) || String(getValue(item, 'patient_name', 'patientName'));
}

function getDoctorName(item: any) {
  const doctor = getValue(item, 'doctor');
  return formatPersonName(doctor) || String(getValue(item, 'doctor_name', 'doctorName'));
}

function renderStatus(value: any) {
  const text = String(value || '');
  return <Badge variant={getStatusVariant(text) as any}>{text || 'N/A'}</Badge>;
}

function withAdmissionPayload(values: any) {
  const payload = stripEmptyValues(values);

  if (payload.admission_date) {
    payload.admitted_at = payload.admission_date;
  }

  return payload;
}

export const moduleOrder: ModuleKey[] = [
  'patients',
  'doctors',
  'departments',
  'appointments',
  'medical-records',
  'prescriptions',
  'rooms',
  'admissions',
  'invoices',
  'nurses',
];

export const referenceConfigs: Record<string, ReferenceConfig> = {
  patients: {
    key: 'patients',
    endpoint: '/api/patients',
    params: { page: 1, limit: 200, sortBy: 'created_at', order: 'DESC' },
    getLabel: (item) => formatPersonName(item),
  },
  departments: {
    key: 'departments',
    endpoint: '/api/departments',
    params: { page: 1, limit: 200, sortBy: 'name', order: 'ASC' },
    getLabel: (item) => String(getValue(item, 'name')),
  },
  doctors: {
    key: 'doctors',
    endpoint: '/api/doctors',
    params: { page: 1, limit: 200, sortBy: 'last_name', order: 'ASC' },
    getLabel: (item) => formatPersonName(item),
  },
  rooms: {
    key: 'rooms',
    endpoint: '/api/rooms/available',
    fallbackPaths: ['/api/rooms'],
    params: { page: 1, limit: 200, sortBy: 'room_number', order: 'ASC' },
    getLabel: (item) => `${getValue(item, 'room_number', 'roomNumber')} - ${getDepartmentName(item)}`,
  },
  medicalRecords: {
    key: 'medicalRecords',
    endpoint: '/api/medical-records',
    params: { page: 1, limit: 200, sortBy: 'record_date', order: 'DESC' },
    getLabel: (item) =>
      `${getPatientName(item) || getValue(item, 'patient_id', 'patientId')} - ${getValue(item, 'record_date', 'recordDate')}`,
  },
  admissions: {
    key: 'admissions',
    endpoint: '/api/admissions',
    params: { page: 1, limit: 200, sortBy: 'admission_date', order: 'DESC' },
    getLabel: (item) =>
      `${getPatientName(item) || getValue(item, 'patient_id', 'patientId')} - ${getValue(item, 'room.room_number', 'roomNumber', 'room_id')}`,
  },
};

export const moduleConfigs: Record<ModuleKey, ModuleConfig> = {
  patients: {
    key: 'patients',
    path: 'patients',
    label: lt('Patients', 'Pacientët'),
    singular: lt('Patient', 'Pacienti'),
    description: lt(
      'Manage patient profiles with search, filtering, sorting, and pagination.',
      'Menaxhoni profilet e pacientëve me kërkim, filtra, renditje dhe paginim.'
    ),
    endpoint: '/api/patients',
    service: createCrudService('/api/patients'),
    sortOptions: [
      option('created_at', 'Created at', 'Data e krijimit'),
      option('first_name', 'First name', 'Emri'),
      option('last_name', 'Last name', 'Mbiemri'),
      option('date_of_birth', 'Date of birth', 'Data e lindjes'),
    ],
    defaultSortBy: 'created_at',
    defaultOrder: 'DESC',
    listPageSizeOptions,
    permissions: {
      create: ['ADMIN', 'RECEPTIONIST'],
      edit: ['ADMIN', 'RECEPTIONIST'],
      delete: ['ADMIN'],
    },
    filters: [
      { name: 'search', label: lt('Search patient', 'Kërko pacientin'), type: 'text', placeholder: lt('First or last name', 'Emri ose mbiemri') },
      { name: 'bloodGroup', label: lt('Blood group', 'Grupi i gjakut'), type: 'select', options: bloodGroups },
      { name: 'gender', label: lt('Gender', 'Gjinia'), type: 'select', options: genders },
    ],
    fields: [
      { name: 'first_name', label: lt('First name', 'Emri'), type: 'text' },
      { name: 'last_name', label: lt('Last name', 'Mbiemri'), type: 'text' },
      { name: 'date_of_birth', label: lt('Date of birth', 'Data e lindjes'), type: 'date' },
      { name: 'gender', label: lt('Gender', 'Gjinia'), type: 'select', options: genders },
      { name: 'phone', label: lt('Phone', 'Telefoni'), type: 'text' },
      { name: 'blood_group', label: lt('Blood group', 'Grupi i gjakut'), type: 'select', options: bloodGroups },
      { name: 'address', label: lt('Address', 'Adresa'), type: 'textarea' },
    ],
    columns: [
      { key: 'name', label: lt('Patient', 'Pacienti'), render: (item) => formatPersonName(item) },
      { key: 'date_of_birth', label: lt('Birth date', 'Data e lindjes'), render: (item, language) => formatDate(String(getValue(item, 'date_of_birth', 'dateOfBirth')), language) },
      { key: 'gender', label: lt('Gender', 'Gjinia'), render: (item) => String(getValue(item, 'gender')) },
      { key: 'blood_group', label: lt('Blood group', 'Grupi i gjakut'), render: (item) => String(getValue(item, 'blood_group', 'bloodType')) },
      { key: 'phone', label: lt('Phone', 'Telefoni'), render: (item) => String(getValue(item, 'phone', 'phoneNumber')) },
    ],
    schema: z.object({
      first_name: requiredString(),
      last_name: requiredString(),
      date_of_birth: requiredString(),
      gender: requiredString(),
      phone: requiredString(),
      blood_group: requiredString(),
      address: requiredString(),
    }),
    getItemTitle: (item) => formatPersonName(item),
  },
  doctors: {
    key: 'doctors',
    path: 'doctors',
    label: lt('Doctors', 'Mjekët'),
    singular: lt('Doctor', 'Mjeku'),
    description: lt(
      'Manage doctors, their departments, and specializations.',
      'Menaxhoni mjekët, departamentet dhe specializimet e tyre.'
    ),
    endpoint: '/api/doctors',
    service: createCrudService('/api/doctors'),
    sortOptions: [
      option('created_at', 'Created at', 'Data e krijimit'),
      option('first_name', 'First name', 'Emri'),
      option('last_name', 'Last name', 'Mbiemri'),
      option('specialization', 'Specialization', 'Specializimi'),
    ],
    defaultSortBy: 'created_at',
    defaultOrder: 'DESC',
    listPageSizeOptions,
    permissions: {
      create: ['ADMIN'],
      edit: ['ADMIN'],
      delete: ['ADMIN'],
    },
    filters: [
      { name: 'departmentId', label: lt('Department', 'Departamenti'), type: 'select', source: 'departments' },
      { name: 'specialization', label: lt('Specialization', 'Specializimi'), type: 'text', placeholder: lt('Cardiology', 'Kardiologji') },
    ],
    fields: [
      { name: 'user_id', label: lt('User ID', 'ID e përdoruesit'), type: 'text' },
      { name: 'first_name', label: lt('First name', 'Emri'), type: 'text' },
      { name: 'last_name', label: lt('Last name', 'Mbiemri'), type: 'text' },
      { name: 'specialization', label: lt('Specialization', 'Specializimi'), type: 'text' },
      { name: 'department_id', label: lt('Department', 'Departamenti'), type: 'select', source: 'departments' },
      { name: 'phone', label: lt('Phone', 'Telefoni'), type: 'text' },
    ],
    columns: [
      { key: 'name', label: lt('Doctor', 'Mjeku'), render: (item) => formatPersonName(item) },
      { key: 'specialization', label: lt('Specialization', 'Specializimi'), render: (item) => String(getValue(item, 'specialization')) },
      { key: 'department_id', label: lt('Department', 'Departamenti'), render: (item) => getDepartmentName(item) },
      { key: 'phone', label: lt('Phone', 'Telefoni'), render: (item) => String(getValue(item, 'phone', 'phoneNumber')) },
    ],
    schema: z.object({
      user_id: requiredString(),
      first_name: requiredString(),
      last_name: requiredString(),
      specialization: requiredString(),
      department_id: requiredString(),
      phone: requiredString(),
    }),
    getItemTitle: (item) => formatPersonName(item),
  },
  departments: {
    key: 'departments',
    path: 'departments',
    label: lt('Departments', 'Departamentet'),
    singular: lt('Department', 'Departamenti'),
    description: lt(
      'Manage hospital departments and their locations.',
      'Menaxhoni departamentet e spitalit dhe vendndodhjet e tyre.'
    ),
    endpoint: '/api/departments',
    service: createCrudService('/api/departments'),
    sortOptions: [
      option('created_at', 'Created at', 'Data e krijimit'),
      option('name', 'Name', 'Emri'),
      option('location', 'Location', 'Lokacioni'),
    ],
    defaultSortBy: 'created_at',
    defaultOrder: 'DESC',
    listPageSizeOptions,
    permissions: {
      create: ['ADMIN'],
      edit: ['ADMIN'],
      delete: ['ADMIN'],
    },
    filters: [
      { name: 'search', label: lt('Search department', 'Kërko departamentin'), type: 'text', placeholder: lt('Name or location', 'Emri ose lokacioni') },
    ],
    fields: [
      { name: 'name', label: lt('Name', 'Emri'), type: 'text' },
      { name: 'location', label: lt('Location', 'Lokacioni'), type: 'text' },
      { name: 'description', label: lt('Description', 'Përshkrimi'), type: 'textarea' },
    ],
    columns: [
      { key: 'name', label: lt('Department', 'Departamenti'), render: (item) => String(getValue(item, 'name')) },
      { key: 'location', label: lt('Location', 'Lokacioni'), render: (item) => String(getValue(item, 'location')) },
      { key: 'description', label: lt('Description', 'Përshkrimi'), render: (item) => String(getValue(item, 'description')) },
    ],
    schema: z.object({
      name: requiredString(),
      location: requiredString(),
      description: z.string().optional(),
    }),
    cleanPayload: (values) => stripEmptyValues(values),
    getItemTitle: (item) => String(getValue(item, 'name')),
  },
  appointments: {
    key: 'appointments',
    path: 'appointments',
    label: lt('Appointments', 'Terminet'),
    singular: lt('Appointment', 'Termini'),
    description: lt(
      'Manage appointment scheduling with date, patient, doctor, and status filters.',
      'Menaxhoni terminet me filtra për datë, pacient, mjek dhe status.'
    ),
    endpoint: '/api/appointments',
    service: createCrudService('/api/appointments'),
    sortOptions: [
      option('created_at', 'Created at', 'Data e krijimit'),
      option('date', 'Date', 'Data'),
      option('time', 'Time', 'Koha'),
      option('status', 'Status', 'Statusi'),
    ],
    defaultSortBy: 'created_at',
    defaultOrder: 'DESC',
    listPageSizeOptions,
    permissions: {
      create: ['ADMIN', 'RECEPTIONIST'],
      edit: ['ADMIN', 'RECEPTIONIST'],
      delete: ['ADMIN', 'RECEPTIONIST'],
    },
    createDefaults: {
      status: 'Scheduled',
    },
    filters: [
      { name: 'date', label: lt('Date', 'Data'), type: 'date' },
      { name: 'doctorId', label: lt('Doctor', 'Mjeku'), type: 'select', source: 'doctors' },
      { name: 'patientId', label: lt('Patient', 'Pacienti'), type: 'select', source: 'patients' },
      { name: 'status', label: lt('Status', 'Statusi'), type: 'select', options: appointmentStatuses },
      { name: 'from', label: lt('From', 'Nga'), type: 'date' },
      { name: 'to', label: lt('To', 'Deri'), type: 'date' },
    ],
    fields: [
      { name: 'patient_id', label: lt('Patient', 'Pacienti'), type: 'select', source: 'patients' },
      { name: 'doctor_id', label: lt('Doctor', 'Mjeku'), type: 'select', source: 'doctors' },
      { name: 'date', label: lt('Date', 'Data'), type: 'date' },
      { name: 'time', label: lt('Time', 'Koha'), type: 'time' },
      { name: 'status', label: lt('Status', 'Statusi'), type: 'select', options: appointmentStatuses },
      { name: 'notes', label: lt('Notes', 'Shënime'), type: 'textarea' },
    ],
    columns: [
      { key: 'date', label: lt('Date', 'Data'), render: (item, language) => formatDate(String(getValue(item, 'date', 'appointmentDate')), language) },
      { key: 'time', label: lt('Time', 'Koha'), render: (item) => String(getValue(item, 'time', 'appointmentTime')) },
      { key: 'patient', label: lt('Patient', 'Pacienti'), render: (item) => getPatientName(item) || String(getValue(item, 'patient_id', 'patientId')) },
      { key: 'doctor', label: lt('Doctor', 'Mjeku'), render: (item) => getDoctorName(item) || String(getValue(item, 'doctor_id', 'doctorId')) },
      { key: 'status', label: lt('Status', 'Statusi'), render: (item) => renderStatus(getValue(item, 'status')) },
    ],
    schema: z.object({
      patient_id: requiredString(),
      doctor_id: requiredString(),
      date: requiredString(),
      time: requiredString(),
      status: requiredString(),
      notes: z.string().optional(),
    }),
    cleanPayload: (values) => stripEmptyValues(values),
    getItemTitle: (item) =>
      `${getPatientName(item) || getValue(item, 'patient_id', 'patientId')} - ${getValue(item, 'date', 'appointmentDate')}`,
  },
  'medical-records': {
    key: 'medical-records',
    path: 'medical-records',
    label: lt('Medical records', 'Kartelat mjekësore'),
    singular: lt('Medical record', 'Kartela mjekësore'),
    description: lt(
      'Manage diagnosis, treatment, and prescription summaries.',
      'Menaxhoni diagnozën, trajtimin dhe përmbledhjet e recetave.'
    ),
    endpoint: '/api/medical-records',
    service: createCrudService('/api/medical-records'),
    sortOptions: [
      option('created_at', 'Created at', 'Data e krijimit'),
      option('record_date', 'Record date', 'Data e kartelës'),
      option('diagnosis', 'Diagnosis', 'Diagnoza'),
    ],
    defaultSortBy: 'record_date',
    defaultOrder: 'DESC',
    listPageSizeOptions,
    permissions: {
      create: ['ADMIN', 'DOCTOR'],
      edit: ['ADMIN', 'DOCTOR'],
      delete: ['ADMIN', 'DOCTOR'],
    },
    filters: [
      { name: 'patientId', label: lt('Patient', 'Pacienti'), type: 'select', source: 'patients' },
      { name: 'doctorId', label: lt('Doctor', 'Mjeku'), type: 'select', source: 'doctors' },
    ],
    fields: [
      { name: 'patient_id', label: lt('Patient', 'Pacienti'), type: 'select', source: 'patients' },
      { name: 'doctor_id', label: lt('Doctor', 'Mjeku'), type: 'select', source: 'doctors' },
      { name: 'record_date', label: lt('Record date', 'Data e kartelës'), type: 'date' },
      { name: 'diagnosis', label: lt('Diagnosis', 'Diagnoza'), type: 'textarea' },
      { name: 'treatment', label: lt('Treatment', 'Trajtimi'), type: 'textarea' },
      { name: 'prescriptions_text', label: lt('Prescription summary', 'Përmbledhja e recetës'), type: 'textarea' },
    ],
    columns: [
      { key: 'patient', label: lt('Patient', 'Pacienti'), render: (item) => getPatientName(item) || String(getValue(item, 'patient_id', 'patientId')) },
      { key: 'doctor', label: lt('Doctor', 'Mjeku'), render: (item) => getDoctorName(item) || String(getValue(item, 'doctor_id', 'doctorId')) },
      { key: 'diagnosis', label: lt('Diagnosis', 'Diagnoza'), render: (item) => String(getValue(item, 'diagnosis')) },
      { key: 'record_date', label: lt('Record date', 'Data e kartelës'), render: (item, language) => formatDate(String(getValue(item, 'record_date', 'recordDate')), language) },
    ],
    schema: z.object({
      patient_id: requiredString(),
      doctor_id: requiredString(),
      record_date: requiredString(),
      diagnosis: requiredString(),
      treatment: requiredString(),
      prescriptions_text: z.string().optional(),
    }),
    cleanPayload: (values) => stripEmptyValues(values),
    getItemTitle: (item) => `${getPatientName(item)} - ${getValue(item, 'record_date', 'recordDate')}`,
  },
  prescriptions: {
    key: 'prescriptions',
    path: 'prescriptions',
    label: lt('Prescriptions', 'Recetat'),
    singular: lt('Prescription', 'Receta'),
    description: lt(
      'Manage prescription details linked to medical records.',
      'Menaxhoni detajet e recetave të lidhura me kartelat mjekësore.'
    ),
    endpoint: '/api/prescriptions',
    service: createCrudService('/api/prescriptions'),
    sortOptions: [
      option('created_at', 'Created at', 'Data e krijimit'),
      option('medicine', 'Medicine', 'Ilaçi'),
      option('dosage', 'Dosage', 'Dozimi'),
      option('duration', 'Duration', 'Kohëzgjatja'),
    ],
    defaultSortBy: 'created_at',
    defaultOrder: 'DESC',
    listPageSizeOptions,
    permissions: {
      create: ['ADMIN', 'DOCTOR'],
      edit: ['ADMIN', 'DOCTOR'],
      delete: ['ADMIN', 'DOCTOR'],
    },
    filters: [
      { name: 'medicalRecordId', label: lt('Medical record', 'Kartela mjekësore'), type: 'select', source: 'medicalRecords' },
    ],
    fields: [
      { name: 'medical_record_id', label: lt('Medical record', 'Kartela mjekësore'), type: 'select', source: 'medicalRecords' },
      { name: 'medicine', label: lt('Medicine', 'Ilaçi'), type: 'text' },
      { name: 'dosage', label: lt('Dosage', 'Dozimi'), type: 'text' },
      { name: 'duration', label: lt('Duration', 'Kohëzgjatja'), type: 'text' },
      { name: 'instructions', label: lt('Instructions', 'Udhëzimet'), type: 'textarea' },
    ],
    columns: [
      { key: 'medicine', label: lt('Medicine', 'Ilaçi'), render: (item) => String(getValue(item, 'medicine', 'medication_name')) },
      { key: 'dosage', label: lt('Dosage', 'Dozimi'), render: (item) => String(getValue(item, 'dosage')) },
      { key: 'duration', label: lt('Duration', 'Kohëzgjatja'), render: (item) => String(getValue(item, 'duration', 'frequency')) },
      { key: 'medical_record_id', label: lt('Medical record', 'Kartela mjekësore'), render: (item) => String(getValue(item, 'medical_record_id', 'medicalRecordId')) },
    ],
    schema: z.object({
      medical_record_id: requiredString(),
      medicine: requiredString(),
      dosage: requiredString(),
      duration: requiredString(),
      instructions: z.string().optional(),
    }),
    cleanPayload: (values) => stripEmptyValues(values),
    getItemTitle: (item) => String(getValue(item, 'medicine', 'medication_name')),
  },
  rooms: {
    key: 'rooms',
    path: 'rooms',
    label: lt('Rooms', 'Dhomat'),
    singular: lt('Room', 'Dhoma'),
    description: lt(
      'Manage room capacity, type, department, and availability.',
      'Menaxhoni kapacitetin, llojin, departamentin dhe disponueshmërinë e dhomave.'
    ),
    endpoint: '/api/rooms',
    service: createCrudService('/api/rooms'),
    sortOptions: [
      option('created_at', 'Created at', 'Data e krijimit'),
      option('room_number', 'Room number', 'Numri i dhomës'),
      option('type', 'Type', 'Lloji'),
      option('status', 'Status', 'Statusi'),
      option('capacity', 'Capacity', 'Kapaciteti'),
    ],
    defaultSortBy: 'room_number',
    defaultOrder: 'ASC',
    listPageSizeOptions,
    permissions: {
      create: ['ADMIN'],
      edit: ['ADMIN'],
      delete: ['ADMIN'],
    },
    createDefaults: {
      status: 'AVAILABLE',
    },
    filters: [
      { name: 'departmentId', label: lt('Department', 'Departamenti'), type: 'select', source: 'departments' },
      { name: 'type', label: lt('Type', 'Lloji'), type: 'select', options: roomTypes },
      { name: 'status', label: lt('Status', 'Statusi'), type: 'select', options: roomStatuses },
    ],
    fields: [
      { name: 'room_number', label: lt('Room number', 'Numri i dhomës'), type: 'text' },
      { name: 'department_id', label: lt('Department', 'Departamenti'), type: 'select', source: 'departments' },
      { name: 'type', label: lt('Type', 'Lloji'), type: 'select', options: roomTypes },
      { name: 'status', label: lt('Status', 'Statusi'), type: 'select', options: roomStatuses },
      { name: 'capacity', label: lt('Capacity', 'Kapaciteti'), type: 'number', step: '1' },
    ],
    columns: [
      { key: 'room_number', label: lt('Room', 'Dhoma'), render: (item) => String(getValue(item, 'room_number', 'roomNumber')) },
      { key: 'department', label: lt('Department', 'Departamenti'), render: (item) => getDepartmentName(item) },
      { key: 'type', label: lt('Type', 'Lloji'), render: (item) => String(getValue(item, 'type')) },
      { key: 'status', label: lt('Status', 'Statusi'), render: (item) => renderStatus(getValue(item, 'status')) },
      { key: 'capacity', label: lt('Capacity', 'Kapaciteti'), render: (item) => String(getValue(item, 'capacity')) },
    ],
    schema: z.object({
      room_number: requiredString(),
      department_id: requiredString(),
      type: requiredString(),
      status: requiredString(),
      capacity: positiveNumber(),
    }),
    cleanPayload: (values) => stripEmptyValues(values),
    getItemTitle: (item) => String(getValue(item, 'room_number', 'roomNumber')),
  },
  admissions: {
    key: 'admissions',
    path: 'admissions',
    label: lt('Admissions', 'Pranimet'),
    singular: lt('Admission', 'Pranimi'),
    description: lt(
      'Manage active and completed patient admissions.',
      'Menaxhoni pranimet aktive dhe të përfunduara të pacientëve.'
    ),
    endpoint: '/api/admissions',
    service: createCrudService('/api/admissions'),
    sortOptions: [
      option('created_at', 'Created at', 'Data e krijimit'),
      option('admission_date', 'Admission date', 'Data e pranimit'),
      option('discharge_date', 'Discharge date', 'Data e lirimit'),
      option('status', 'Status', 'Statusi'),
    ],
    defaultSortBy: 'admission_date',
    defaultOrder: 'DESC',
    listPageSizeOptions,
    permissions: {
      create: ['ADMIN', 'RECEPTIONIST', 'NURSE'],
      edit: ['ADMIN', 'RECEPTIONIST', 'NURSE'],
      delete: ['ADMIN', 'RECEPTIONIST', 'NURSE'],
    },
    createDefaults: {
      status: 'ACTIVE',
    },
    filters: [
      { name: 'status', label: lt('Status', 'Statusi'), type: 'select', options: admissionStatuses },
      { name: 'patientId', label: lt('Patient', 'Pacienti'), type: 'select', source: 'patients' },
      { name: 'roomId', label: lt('Room', 'Dhoma'), type: 'select', source: 'rooms' },
    ],
    fields: [
      { name: 'patient_id', label: lt('Patient', 'Pacienti'), type: 'select', source: 'patients' },
      { name: 'room_id', label: lt('Room', 'Dhoma'), type: 'select', source: 'rooms' },
      { name: 'admission_date', label: lt('Admission date', 'Data e pranimit'), type: 'date' },
      { name: 'discharge_date', label: lt('Discharge date', 'Data e lirimit'), type: 'date' },
      { name: 'status', label: lt('Status', 'Statusi'), type: 'select', options: admissionStatuses },
    ],
    columns: [
      { key: 'patient', label: lt('Patient', 'Pacienti'), render: (item) => getPatientName(item) || String(getValue(item, 'patient_id', 'patientId')) },
      { key: 'room', label: lt('Room', 'Dhoma'), render: (item) => String(getValue(item, 'room.room_number', 'room_number', 'roomNumber', 'room_id')) },
      { key: 'admission_date', label: lt('Admission date', 'Data e pranimit'), render: (item, language) => formatDate(String(getValue(item, 'admission_date', 'admitted_at', 'admissionDate', 'admittedAt')), language) },
      { key: 'status', label: lt('Status', 'Statusi'), render: (item) => renderStatus(getValue(item, 'status')) },
    ],
    schema: z.object({
      patient_id: requiredString(),
      room_id: requiredString(),
      admission_date: requiredString(),
      discharge_date: z.string().optional(),
      status: requiredString(),
    }),
    cleanPayload: (values) => withAdmissionPayload(values),
    getItemTitle: (item) => `${getPatientName(item)} - ${getValue(item, 'room.room_number', 'roomNumber')}`,
  },
  invoices: {
    key: 'invoices',
    path: 'invoices',
    label: lt('Invoices', 'Faturat'),
    singular: lt('Invoice', 'Fatura'),
    description: lt(
      'Manage invoice amounts, payment status, and patient billing.',
      'Menaxhoni vlerat e faturave, statusin e pagesës dhe faturimin e pacientëve.'
    ),
    endpoint: '/api/invoices',
    service: createCrudService('/api/invoices'),
    sortOptions: [
      option('created_at', 'Created at', 'Data e krijimit'),
      option('invoice_date', 'Invoice date', 'Data e faturës'),
      option('amount', 'Amount', 'Shuma'),
      option('status', 'Status', 'Statusi'),
    ],
    defaultSortBy: 'invoice_date',
    defaultOrder: 'DESC',
    listPageSizeOptions,
    permissions: {
      create: ['ADMIN', 'RECEPTIONIST'],
      edit: ['ADMIN', 'RECEPTIONIST'],
      delete: ['ADMIN', 'RECEPTIONIST'],
    },
    createDefaults: {
      status: 'PENDING',
    },
    filters: [
      { name: 'patientId', label: lt('Patient', 'Pacienti'), type: 'select', source: 'patients' },
      { name: 'status', label: lt('Status', 'Statusi'), type: 'select', options: invoiceStatuses },
    ],
    fields: [
      { name: 'patient_id', label: lt('Patient', 'Pacienti'), type: 'select', source: 'patients' },
      { name: 'amount', label: lt('Amount', 'Shuma'), type: 'number', step: '0.01' },
      { name: 'invoice_date', label: lt('Invoice date', 'Data e faturës'), type: 'date' },
      { name: 'status', label: lt('Status', 'Statusi'), type: 'select', options: invoiceStatuses },
      { name: 'description', label: lt('Description', 'Përshkrimi'), type: 'textarea' },
    ],
    columns: [
      { key: 'patient', label: lt('Patient', 'Pacienti'), render: (item) => getPatientName(item) || String(getValue(item, 'patient_id', 'patientId')) },
      { key: 'amount', label: lt('Amount', 'Shuma'), render: (item, language) => formatCurrency(Number(getValue(item, 'amount')), language) },
      { key: 'invoice_date', label: lt('Invoice date', 'Data e faturës'), render: (item, language) => formatDate(String(getValue(item, 'invoice_date', 'invoiceDate')), language) },
      { key: 'status', label: lt('Status', 'Statusi'), render: (item) => renderStatus(getValue(item, 'status')) },
    ],
    schema: z.object({
      patient_id: requiredString(),
      amount: positiveNumber(),
      invoice_date: requiredString(),
      status: requiredString(),
      description: z.string().optional(),
    }),
    cleanPayload: (values) => stripEmptyValues(values),
    getItemTitle: (item) => String(getValue(item, 'id')),
  },
  nurses: {
    key: 'nurses',
    path: 'nurses',
    label: lt('Nurses', 'Infermierët'),
    singular: lt('Nurse', 'Infermieri'),
    description: lt(
      'Manage nurses by department and shift.',
      'Menaxhoni infermierët sipas departamentit dhe ndërrimit.'
    ),
    endpoint: '/api/nurses',
    service: createCrudService('/api/nurses'),
    sortOptions: [
      option('created_at', 'Created at', 'Data e krijimit'),
      option('first_name', 'First name', 'Emri'),
      option('last_name', 'Last name', 'Mbiemri'),
      option('shift', 'Shift', 'Ndërrimi'),
    ],
    defaultSortBy: 'created_at',
    defaultOrder: 'DESC',
    listPageSizeOptions,
    permissions: {
      create: ['ADMIN'],
      edit: ['ADMIN'],
      delete: ['ADMIN'],
    },
    createDefaults: {
      shift: 'Morning',
    },
    filters: [
      { name: 'departmentId', label: lt('Department', 'Departamenti'), type: 'select', source: 'departments' },
      { name: 'shift', label: lt('Shift', 'Ndërrimi'), type: 'select', options: nurseShifts },
    ],
    fields: [
      { name: 'first_name', label: lt('First name', 'Emri'), type: 'text' },
      { name: 'last_name', label: lt('Last name', 'Mbiemri'), type: 'text' },
      { name: 'department_id', label: lt('Department', 'Departamenti'), type: 'select', source: 'departments' },
      { name: 'shift', label: lt('Shift', 'Ndërrimi'), type: 'select', options: nurseShifts },
    ],
    columns: [
      { key: 'name', label: lt('Nurse', 'Infermieri'), render: (item) => formatPersonName(item) },
      { key: 'department', label: lt('Department', 'Departamenti'), render: (item) => getDepartmentName(item) },
      { key: 'shift', label: lt('Shift', 'Ndërrimi'), render: (item) => String(getValue(item, 'shift')) },
    ],
    schema: z.object({
      first_name: requiredString(),
      last_name: requiredString(),
      department_id: requiredString(),
      shift: requiredString(),
    }),
    cleanPayload: (values) => stripEmptyValues(values),
    getItemTitle: (item) => formatPersonName(item),
  },
};
