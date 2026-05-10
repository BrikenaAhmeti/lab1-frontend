import { jsx as _jsx } from "react/jsx-runtime";
import { z } from 'zod';
import Badge from '@/ui/atoms/Badge';
import { lt } from './copy';
import { createCrudService } from './lib/api';
import { formatCurrency, formatDate, formatPersonName, getStatusVariant, getValue, stripEmptyValues } from './lib/utils';
const requiredText = 'This field is required.';
const positiveNumberText = 'Enter a value greater than zero.';
const listPageSizeOptions = [10, 20, 50];
const requiredString = () => z.string().trim().min(1, requiredText);
const positiveNumber = () => z.coerce.number().gt(0, positiveNumberText);
function option(value, en, de) {
    return {
        value,
        label: lt(en, de),
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
    option('MALE', 'Male', 'Männlich'),
    option('FEMALE', 'Female', 'Weiblich'),
    option('OTHER', 'Other', 'Andere'),
];
const appointmentStatuses = [
    option('Scheduled', 'Scheduled', 'Geplant'),
    option('Completed', 'Completed', 'Abgeschlossen'),
    option('Cancelled', 'Cancelled', 'Storniert'),
];
const roomTypes = [
    option('GENERAL', 'General', 'Allgemein'),
    option('ICU', 'ICU', 'Intensivstation'),
    option('SURGERY', 'Surgery', 'Chirurgie'),
    option('EMERGENCY', 'Emergency', 'Notaufnahme'),
    option('PEDIATRIC', 'Pediatric', 'Pädiatrie'),
];
const roomStatuses = [
    option('AVAILABLE', 'Available', 'Verfügbar'),
    option('OCCUPIED', 'Occupied', 'Belegt'),
    option('UNDER_MAINTENANCE', 'Under maintenance', 'In Wartung'),
];
const admissionStatuses = [
    option('ACTIVE', 'Active', 'Aktiv'),
    option('DISCHARGED', 'Discharged', 'Entlassen'),
];
const invoiceStatuses = [
    option('PENDING', 'Pending', 'Ausstehend'),
    option('PAID', 'Paid', 'Bezahlt'),
    option('CANCELLED', 'Cancelled', 'Storniert'),
];
const nurseShifts = [
    option('Morning', 'Morning', 'Frühschicht'),
    option('Evening', 'Evening', 'Spätschicht'),
    option('Night', 'Night', 'Nachtschicht'),
];
function getDepartmentName(item) {
    return String(getValue(item, 'department.name', 'departmentName'));
}
function getPatientName(item) {
    const patient = getValue(item, 'patient');
    return formatPersonName(patient) || String(getValue(item, 'patientName'));
}
function getDoctorName(item) {
    const doctor = getValue(item, 'doctor');
    return formatPersonName(doctor) || String(getValue(item, 'doctorName'));
}
function renderStatus(value) {
    const text = String(value || '');
    return _jsx(Badge, { variant: getStatusVariant(text), children: text || 'N/A' });
}
function withAdmissionPayload(values) {
    return stripEmptyValues(values);
}
function stripForCreate(values, fieldsToOmit) {
    const payload = { ...values };
    fieldsToOmit.forEach((field) => {
        delete payload[field];
    });
    return stripEmptyValues(payload);
}
function allowListParams(...allowedParams) {
    return { allowedListParams: allowedParams };
}
export const moduleOrder = [
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
export const referenceConfigs = {
    patients: {
        key: 'patients',
        endpoint: '/api/patients',
        params: { page: 1, limit: 100, sortBy: 'createdAt', order: 'DESC' },
        getLabel: (item) => formatPersonName(item),
    },
    departments: {
        key: 'departments',
        endpoint: '/api/departments/all',
        params: { sortBy: 'name', order: 'ASC' },
        getLabel: (item) => String(getValue(item, 'name')),
    },
    doctors: {
        key: 'doctors',
        endpoint: '/api/doctors',
        params: { page: 1, limit: 100, sortBy: 'lastName', order: 'ASC' },
        getLabel: (item) => formatPersonName(item),
    },
    rooms: {
        key: 'rooms',
        endpoint: '/api/rooms/available',
        fallbackPaths: ['/api/rooms'],
        params: { page: 1, limit: 100, sortBy: 'roomNumber', order: 'ASC' },
        getLabel: (item) => `${getValue(item, 'roomNumber')} - ${getDepartmentName(item)}`,
    },
    medicalRecords: {
        key: 'medicalRecords',
        endpoint: '/api/medical-records',
        params: { page: 1, limit: 100, sortBy: 'date', order: 'DESC' },
        getLabel: (item) => `${getPatientName(item) || getValue(item, 'patientId')} - ${getValue(item, 'date', 'recordDate')}`,
    },
    admissions: {
        key: 'admissions',
        endpoint: '/api/admissions',
        params: { page: 1, limit: 100, sortBy: 'admissionDate', order: 'DESC' },
        getLabel: (item) => `${getPatientName(item) || getValue(item, 'patientId')} - ${getValue(item, 'room.roomNumber', 'roomId')}`,
    },
};
export const moduleConfigs = {
    patients: {
        key: 'patients',
        path: 'patients',
        label: lt('Patients', 'Patienten'),
        singular: lt('Patient', 'Patient'),
        description: lt('Manage patient profiles with search, filtering, sorting, and pagination.', 'Verwalten Sie Patientenprofile mit Suche, Filtern, Sortierung und Paginierung.'),
        endpoint: '/api/patients',
        service: createCrudService('/api/patients', allowListParams('page', 'limit', 'sortBy', 'order', 'search', 'bloodGroup', 'gender')),
        sortOptions: [
            option('createdAt', 'Created at', 'Erstellt am'),
            option('firstName', 'First name', 'Vorname'),
            option('lastName', 'Last name', 'Nachname'),
            option('dateOfBirth', 'Date of birth', 'Geburtsdatum'),
        ],
        defaultSortBy: 'createdAt',
        defaultOrder: 'DESC',
        listPageSizeOptions,
        permissions: {
            create: ['ADMIN', 'RECEPTIONIST'],
            edit: ['ADMIN', 'RECEPTIONIST'],
            delete: ['ADMIN'],
        },
        filters: [
            { name: 'search', label: lt('Search patient', 'Patient suchen'), type: 'text', placeholder: lt('First or last name', 'Vor- oder Nachname') },
            { name: 'bloodGroup', label: lt('Blood type', 'Blutgruppe'), type: 'select', options: bloodGroups },
            { name: 'gender', label: lt('Gender', 'Geschlecht'), type: 'select', options: genders },
        ],
        fields: [
            { name: 'firstName', label: lt('First name', 'Vorname'), type: 'text' },
            { name: 'lastName', label: lt('Last name', 'Nachname'), type: 'text' },
            { name: 'dateOfBirth', label: lt('Date of birth', 'Geburtsdatum'), type: 'date' },
            { name: 'gender', label: lt('Gender', 'Geschlecht'), type: 'select', options: genders },
            { name: 'phoneNumber', label: lt('Phone number', 'Telefonnummer'), type: 'text' },
            { name: 'bloodType', label: lt('Blood type', 'Blutgruppe'), type: 'select', options: bloodGroups },
            { name: 'address', label: lt('Address', 'Adresse'), type: 'textarea' },
        ],
        columns: [
            { key: 'name', label: lt('Patient', 'Patient'), render: (item) => formatPersonName(item) },
            { key: 'dateOfBirth', label: lt('Birth date', 'Geburtsdatum'), render: (item, language) => formatDate(String(getValue(item, 'dateOfBirth')), language) },
            { key: 'gender', label: lt('Gender', 'Geschlecht'), render: (item) => String(getValue(item, 'gender')) },
            { key: 'bloodType', label: lt('Blood type', 'Blutgruppe'), render: (item) => String(getValue(item, 'bloodType')) },
            { key: 'phoneNumber', label: lt('Phone number', 'Telefonnummer'), render: (item) => String(getValue(item, 'phoneNumber')) },
        ],
        schema: z.object({
            firstName: requiredString(),
            lastName: requiredString(),
            dateOfBirth: requiredString(),
            gender: requiredString(),
            phoneNumber: requiredString(),
            bloodType: requiredString(),
            address: requiredString(),
        }),
        getItemTitle: (item) => formatPersonName(item),
    },
    doctors: {
        key: 'doctors',
        path: 'doctors',
        label: lt('Doctors', 'Ärzte'),
        singular: lt('Doctor', 'Arzt'),
        description: lt('Manage doctors, their departments, and specializations.', 'Verwalten Sie Ärzte, ihre Abteilungen und Fachgebiete.'),
        endpoint: '/api/doctors',
        service: createCrudService('/api/doctors', allowListParams('page', 'limit', 'sortBy', 'order', 'departmentId', 'specialization')),
        sortOptions: [
            option('createdAt', 'Created at', 'Erstellt am'),
            option('firstName', 'First name', 'Vorname'),
            option('lastName', 'Last name', 'Nachname'),
            option('specialization', 'Specialization', 'Fachgebiet'),
        ],
        defaultSortBy: 'createdAt',
        defaultOrder: 'DESC',
        listPageSizeOptions,
        permissions: {
            create: ['ADMIN'],
            edit: ['ADMIN'],
            delete: ['ADMIN'],
        },
        filters: [
            { name: 'departmentId', label: lt('Department', 'Abteilung'), type: 'select', source: 'departments' },
            { name: 'specialization', label: lt('Specialization', 'Fachgebiet'), type: 'text', placeholder: lt('Cardiology', 'Kardiologie') },
        ],
        fields: [
            { name: 'userId', label: lt('User ID', 'Benutzer-ID'), type: 'text', modes: ['edit'] },
            { name: 'firstName', label: lt('First name', 'Vorname'), type: 'text' },
            { name: 'lastName', label: lt('Last name', 'Nachname'), type: 'text' },
            { name: 'specialization', label: lt('Specialization', 'Fachgebiet'), type: 'text' },
            { name: 'departmentId', label: lt('Department', 'Abteilung'), type: 'select', source: 'departments' },
            { name: 'phoneNumber', label: lt('Phone number', 'Telefonnummer'), type: 'text' },
        ],
        columns: [
            { key: 'name', label: lt('Doctor', 'Arzt'), render: (item) => formatPersonName(item) },
            { key: 'specialization', label: lt('Specialization', 'Fachgebiet'), render: (item) => String(getValue(item, 'specialization')) },
            { key: 'departmentId', label: lt('Department', 'Abteilung'), render: (item) => getDepartmentName(item) },
            { key: 'phoneNumber', label: lt('Phone number', 'Telefonnummer'), render: (item) => String(getValue(item, 'phoneNumber')) },
        ],
        schema: z.object({
            userId: z.string().optional(),
            firstName: requiredString(),
            lastName: requiredString(),
            specialization: requiredString(),
            departmentId: requiredString(),
            phoneNumber: requiredString(),
        }),
        cleanPayload: (values, mode) => (mode === 'create' ? stripForCreate(values, ['userId']) : stripEmptyValues(values)),
        getItemTitle: (item) => formatPersonName(item),
    },
    departments: {
        key: 'departments',
        path: 'departments',
        label: lt('Departments', 'Abteilungen'),
        singular: lt('Department', 'Abteilung'),
        description: lt('Manage hospital departments and their locations.', 'Verwalten Sie Krankenhausabteilungen und ihre Standorte.'),
        endpoint: '/api/departments',
        service: createCrudService('/api/departments', allowListParams('page', 'limit', 'sortBy', 'order')),
        sortOptions: [
            option('createdAt', 'Created at', 'Erstellt am'),
            option('name', 'Name', 'Name'),
            option('location', 'Location', 'Standort'),
        ],
        defaultSortBy: 'createdAt',
        defaultOrder: 'DESC',
        listPageSizeOptions,
        permissions: {
            create: ['ADMIN'],
            edit: ['ADMIN'],
            delete: ['ADMIN'],
        },
        filters: [],
        fields: [
            { name: 'name', label: lt('Name', 'Name'), type: 'text' },
            { name: 'location', label: lt('Location', 'Standort'), type: 'text' },
            { name: 'description', label: lt('Description', 'Beschreibung'), type: 'textarea' },
        ],
        columns: [
            { key: 'name', label: lt('Department', 'Abteilung'), render: (item) => String(getValue(item, 'name')) },
            { key: 'location', label: lt('Location', 'Standort'), render: (item) => String(getValue(item, 'location')) },
            { key: 'description', label: lt('Description', 'Beschreibung'), render: (item) => String(getValue(item, 'description')) },
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
        label: lt('Appointments', 'Termine'),
        singular: lt('Appointment', 'Termin'),
        description: lt('Manage appointment scheduling with date, patient, doctor, and status filters.', 'Verwalten Sie Termine mit Filtern für Datum, Patient, Arzt und Status.'),
        endpoint: '/api/appointments',
        service: createCrudService('/api/appointments', allowListParams('page', 'limit', 'date', 'doctorId', 'patientId', 'status', 'from', 'to')),
        sortOptions: [
            option('createdAt', 'Created at', 'Erstellt am'),
            option('date', 'Date', 'Datum'),
            option('time', 'Time', 'Uhrzeit'),
            option('status', 'Status', 'Status'),
        ],
        defaultSortBy: 'createdAt',
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
            { name: 'date', label: lt('Date', 'Datum'), type: 'date' },
            { name: 'doctorId', label: lt('Doctor', 'Arzt'), type: 'select', source: 'doctors' },
            { name: 'patientId', label: lt('Patient', 'Patient'), type: 'select', source: 'patients' },
            { name: 'status', label: lt('Status', 'Status'), type: 'select', options: appointmentStatuses },
            { name: 'from', label: lt('From', 'Von'), type: 'date' },
            { name: 'to', label: lt('To', 'Bis'), type: 'date' },
        ],
        fields: [
            { name: 'patientId', label: lt('Patient', 'Patient'), type: 'select', source: 'patients' },
            { name: 'doctorId', label: lt('Doctor', 'Arzt'), type: 'select', source: 'doctors' },
            { name: 'date', label: lt('Date', 'Datum'), type: 'date' },
            { name: 'time', label: lt('Time', 'Uhrzeit'), type: 'time' },
            { name: 'status', label: lt('Status', 'Status'), type: 'select', options: appointmentStatuses, modes: ['edit'] },
            { name: 'notes', label: lt('Notes', 'Notizen'), type: 'textarea' },
        ],
        columns: [
            { key: 'date', label: lt('Date', 'Datum'), render: (item, language) => formatDate(String(getValue(item, 'date', 'appointmentDate')), language) },
            { key: 'time', label: lt('Time', 'Uhrzeit'), render: (item) => String(getValue(item, 'time', 'appointmentTime')) },
            { key: 'patient', label: lt('Patient', 'Patient'), render: (item) => getPatientName(item) || String(getValue(item, 'patientId')) },
            { key: 'doctor', label: lt('Doctor', 'Arzt'), render: (item) => getDoctorName(item) || String(getValue(item, 'doctorId')) },
            { key: 'status', label: lt('Status', 'Status'), render: (item) => renderStatus(getValue(item, 'status')) },
        ],
        schema: z.object({
            patientId: requiredString(),
            doctorId: requiredString(),
            date: requiredString(),
            time: requiredString(),
            status: z.string().optional(),
            notes: z.string().optional(),
        }),
        cleanPayload: (values, mode) => (mode === 'create' ? stripForCreate(values, ['status']) : stripEmptyValues(values)),
        getItemTitle: (item) => `${getPatientName(item) || getValue(item, 'patientId')} - ${getValue(item, 'date', 'appointmentDate')}`,
    },
    'medical-records': {
        key: 'medical-records',
        path: 'medical-records',
        label: lt('Medical records', 'Krankenakten'),
        singular: lt('Medical record', 'Krankenakte'),
        description: lt('Manage diagnosis, treatment, and prescription summaries.', 'Verwalten Sie Diagnosen, Behandlungen und Rezeptzusammenfassungen.'),
        endpoint: '/api/medical-records',
        service: createCrudService('/api/medical-records', allowListParams('page', 'limit', 'patientId')),
        sortOptions: [
            option('createdAt', 'Created at', 'Erstellt am'),
            option('date', 'Record date', 'Akten-Datum'),
            option('diagnosis', 'Diagnosis', 'Diagnose'),
        ],
        defaultSortBy: 'date',
        defaultOrder: 'DESC',
        listPageSizeOptions,
        permissions: {
            create: ['ADMIN', 'DOCTOR'],
            edit: ['ADMIN', 'DOCTOR'],
            delete: ['ADMIN', 'DOCTOR'],
        },
        filters: [
            { name: 'patientId', label: lt('Patient', 'Patient'), type: 'select', source: 'patients' },
        ],
        fields: [
            { name: 'patientId', label: lt('Patient', 'Patient'), type: 'select', source: 'patients' },
            { name: 'doctorId', label: lt('Doctor', 'Arzt'), type: 'select', source: 'doctors' },
            { name: 'date', label: lt('Record date', 'Akten-Datum'), type: 'date' },
            { name: 'diagnosis', label: lt('Diagnosis', 'Diagnose'), type: 'textarea' },
            { name: 'treatment', label: lt('Treatment', 'Behandlung'), type: 'textarea' },
            { name: 'prescriptionsText', label: lt('Prescription summary', 'Rezeptzusammenfassung'), type: 'textarea' },
        ],
        columns: [
            { key: 'patient', label: lt('Patient', 'Patient'), render: (item) => getPatientName(item) || String(getValue(item, 'patientId')) },
            { key: 'doctor', label: lt('Doctor', 'Arzt'), render: (item) => getDoctorName(item) || String(getValue(item, 'doctorId')) },
            { key: 'diagnosis', label: lt('Diagnosis', 'Diagnose'), render: (item) => String(getValue(item, 'diagnosis')) },
            { key: 'date', label: lt('Record date', 'Akten-Datum'), render: (item, language) => formatDate(String(getValue(item, 'date', 'recordDate')), language) },
        ],
        schema: z.object({
            patientId: requiredString(),
            doctorId: requiredString(),
            date: requiredString(),
            diagnosis: requiredString(),
            treatment: requiredString(),
            prescriptionsText: z.string().optional(),
        }),
        cleanPayload: (values) => stripEmptyValues(values),
        getItemTitle: (item) => `${getPatientName(item)} - ${getValue(item, 'date', 'recordDate')}`,
    },
    prescriptions: {
        key: 'prescriptions',
        path: 'prescriptions',
        label: lt('Prescriptions', 'Rezepte'),
        singular: lt('Prescription', 'Rezept'),
        description: lt('Manage prescription details linked to medical records.', 'Verwalten Sie Rezeptdetails, die mit Krankenakten verknüpft sind.'),
        endpoint: '/api/prescriptions',
        service: createCrudService('/api/prescriptions', allowListParams('page', 'limit', 'medicalRecordId')),
        sortOptions: [
            option('createdAt', 'Created at', 'Erstellt am'),
            option('medicine', 'Medicine', 'Medikament'),
            option('dosage', 'Dosage', 'Dosierung'),
            option('duration', 'Duration', 'Dauer'),
        ],
        defaultSortBy: 'createdAt',
        defaultOrder: 'DESC',
        listPageSizeOptions,
        permissions: {
            create: ['ADMIN', 'DOCTOR'],
            edit: ['ADMIN', 'DOCTOR'],
            delete: ['ADMIN', 'DOCTOR'],
        },
        filters: [
            { name: 'medicalRecordId', label: lt('Medical record', 'Krankenakte'), type: 'select', source: 'medicalRecords' },
        ],
        fields: [
            { name: 'medicalRecordId', label: lt('Medical record', 'Krankenakte'), type: 'select', source: 'medicalRecords' },
            { name: 'medicine', label: lt('Medicine', 'Medikament'), type: 'text' },
            { name: 'dosage', label: lt('Dosage', 'Dosierung'), type: 'text' },
            { name: 'duration', label: lt('Duration', 'Dauer'), type: 'text' },
            { name: 'instructions', label: lt('Instructions', 'Anweisungen'), type: 'textarea' },
        ],
        columns: [
            { key: 'medicine', label: lt('Medicine', 'Medikament'), render: (item) => String(getValue(item, 'medicine', 'medicationName')) },
            { key: 'dosage', label: lt('Dosage', 'Dosierung'), render: (item) => String(getValue(item, 'dosage')) },
            { key: 'duration', label: lt('Duration', 'Dauer'), render: (item) => String(getValue(item, 'duration', 'frequency')) },
            { key: 'medicalRecordId', label: lt('Medical record', 'Krankenakte'), render: (item) => String(getValue(item, 'medicalRecordId')) },
        ],
        schema: z.object({
            medicalRecordId: requiredString(),
            medicine: requiredString(),
            dosage: requiredString(),
            duration: requiredString(),
            instructions: z.string().optional(),
        }),
        cleanPayload: (values) => stripEmptyValues(values),
        getItemTitle: (item) => String(getValue(item, 'medicine', 'medicationName')),
    },
    rooms: {
        key: 'rooms',
        path: 'rooms',
        label: lt('Rooms', 'Zimmer'),
        singular: lt('Room', 'Zimmer'),
        description: lt('Manage room capacity, type, department, and availability.', 'Verwalten Sie Zimmerkapazität, Typ, Abteilung und Verfügbarkeit.'),
        endpoint: '/api/rooms',
        service: createCrudService('/api/rooms', allowListParams('page', 'limit', 'departmentId', 'type')),
        sortOptions: [
            option('createdAt', 'Created at', 'Erstellt am'),
            option('roomNumber', 'Room number', 'Zimmernummer'),
            option('type', 'Type', 'Typ'),
            option('status', 'Status', 'Status'),
            option('capacity', 'Capacity', 'Kapazität'),
        ],
        defaultSortBy: 'roomNumber',
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
            { name: 'departmentId', label: lt('Department', 'Abteilung'), type: 'select', source: 'departments' },
            { name: 'type', label: lt('Type', 'Typ'), type: 'select', options: roomTypes },
        ],
        fields: [
            { name: 'roomNumber', label: lt('Room number', 'Zimmernummer'), type: 'text' },
            { name: 'departmentId', label: lt('Department', 'Abteilung'), type: 'select', source: 'departments' },
            { name: 'type', label: lt('Type', 'Typ'), type: 'select', options: roomTypes },
            { name: 'status', label: lt('Status', 'Status'), type: 'select', options: roomStatuses },
            { name: 'capacity', label: lt('Capacity', 'Kapazität'), type: 'number', step: '1' },
        ],
        columns: [
            { key: 'roomNumber', label: lt('Room', 'Zimmer'), render: (item) => String(getValue(item, 'roomNumber')) },
            { key: 'departmentId', label: lt('Department', 'Abteilung'), render: (item) => getDepartmentName(item) },
            { key: 'type', label: lt('Type', 'Typ'), render: (item) => String(getValue(item, 'type')) },
            { key: 'status', label: lt('Status', 'Status'), render: (item) => renderStatus(getValue(item, 'status')) },
            { key: 'capacity', label: lt('Capacity', 'Kapazität'), render: (item) => String(getValue(item, 'capacity')) },
        ],
        schema: z.object({
            roomNumber: requiredString(),
            departmentId: requiredString(),
            type: requiredString(),
            status: requiredString(),
            capacity: positiveNumber(),
        }),
        cleanPayload: (values) => stripEmptyValues(values),
        getItemTitle: (item) => String(getValue(item, 'roomNumber')),
    },
    admissions: {
        key: 'admissions',
        path: 'admissions',
        label: lt('Admissions', 'Aufnahmen'),
        singular: lt('Admission', 'Aufnahme'),
        description: lt('Manage active and completed patient admissions.', 'Verwalten Sie aktive und abgeschlossene Patientenaufnahmen.'),
        endpoint: '/api/admissions',
        service: createCrudService('/api/admissions', allowListParams('page', 'limit', 'status', 'patientId', 'roomId')),
        sortOptions: [
            option('createdAt', 'Created at', 'Erstellt am'),
            option('admissionDate', 'Admission date', 'Aufnahmedatum'),
            option('dischargeDate', 'Discharge date', 'Entlassungsdatum'),
            option('status', 'Status', 'Status'),
        ],
        defaultSortBy: 'admissionDate',
        defaultOrder: 'DESC',
        listPageSizeOptions,
        permissions: {
            create: ['ADMIN', 'RECEPTIONIST', 'NURSE'],
            edit: ['ADMIN', 'RECEPTIONIST', 'NURSE'],
            delete: ['ADMIN', 'RECEPTIONIST', 'NURSE'],
        },
        actions: {
            edit: false,
            delete: false,
        },
        filters: [
            { name: 'status', label: lt('Status', 'Status'), type: 'select', options: admissionStatuses },
            { name: 'patientId', label: lt('Patient', 'Patient'), type: 'select', source: 'patients' },
            { name: 'roomId', label: lt('Room', 'Zimmer'), type: 'select', source: 'rooms' },
        ],
        fields: [
            { name: 'patientId', label: lt('Patient', 'Patient'), type: 'select', source: 'patients' },
            { name: 'roomId', label: lt('Room', 'Zimmer'), type: 'select', source: 'rooms' },
            { name: 'admissionDate', label: lt('Admission date', 'Aufnahmedatum'), type: 'date' },
        ],
        columns: [
            { key: 'patient', label: lt('Patient', 'Patient'), render: (item) => getPatientName(item) || String(getValue(item, 'patientId')) },
            { key: 'room', label: lt('Room', 'Zimmer'), render: (item) => String(getValue(item, 'room.roomNumber', 'roomNumber', 'roomId')) },
            { key: 'admissionDate', label: lt('Admission date', 'Aufnahmedatum'), render: (item, language) => formatDate(String(getValue(item, 'admissionDate')), language) },
            { key: 'status', label: lt('Status', 'Status'), render: (item) => renderStatus(getValue(item, 'status')) },
        ],
        schema: z.object({
            patientId: requiredString(),
            roomId: requiredString(),
            admissionDate: z.string().optional(),
        }),
        cleanPayload: (values) => withAdmissionPayload(values),
        getItemTitle: (item) => `${getPatientName(item)} - ${getValue(item, 'room.roomNumber', 'roomNumber')}`,
    },
    invoices: {
        key: 'invoices',
        path: 'invoices',
        label: lt('Invoices', 'Rechnungen'),
        singular: lt('Invoice', 'Rechnung'),
        description: lt('Manage invoice amounts, payment status, and patient billing.', 'Verwalten Sie Rechnungsbeträge, Zahlungsstatus und Patientenabrechnung.'),
        endpoint: '/api/invoices',
        service: createCrudService('/api/invoices', allowListParams('page', 'limit', 'patientId', 'status')),
        sortOptions: [
            option('createdAt', 'Created at', 'Erstellt am'),
            option('date', 'Invoice date', 'Rechnungsdatum'),
            option('amount', 'Amount', 'Betrag'),
            option('status', 'Status', 'Status'),
        ],
        defaultSortBy: 'date',
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
            { name: 'patientId', label: lt('Patient', 'Patient'), type: 'select', source: 'patients' },
            { name: 'status', label: lt('Status', 'Status'), type: 'select', options: invoiceStatuses },
        ],
        fields: [
            { name: 'patientId', label: lt('Patient', 'Patient'), type: 'select', source: 'patients' },
            { name: 'amount', label: lt('Amount', 'Betrag'), type: 'number', step: '0.01' },
            { name: 'date', label: lt('Invoice date', 'Rechnungsdatum'), type: 'date' },
            { name: 'status', label: lt('Status', 'Status'), type: 'select', options: invoiceStatuses, modes: ['edit'] },
            { name: 'description', label: lt('Description', 'Beschreibung'), type: 'textarea' },
        ],
        columns: [
            { key: 'patient', label: lt('Patient', 'Patient'), render: (item) => getPatientName(item) || String(getValue(item, 'patientId')) },
            { key: 'amount', label: lt('Amount', 'Betrag'), render: (item, language) => formatCurrency(Number(getValue(item, 'amount')), language) },
            { key: 'date', label: lt('Invoice date', 'Rechnungsdatum'), render: (item, language) => formatDate(String(getValue(item, 'date', 'invoiceDate')), language) },
            { key: 'status', label: lt('Status', 'Status'), render: (item) => renderStatus(getValue(item, 'status')) },
        ],
        schema: z.object({
            patientId: requiredString(),
            amount: positiveNumber(),
            date: requiredString(),
            status: z.string().optional(),
            description: z.string().optional(),
        }),
        cleanPayload: (values, mode) => (mode === 'create' ? stripForCreate(values, ['status']) : stripEmptyValues(values)),
        getItemTitle: (item) => String(getValue(item, 'id')),
    },
    nurses: {
        key: 'nurses',
        path: 'nurses',
        label: lt('Nurses', 'Pflegekräfte'),
        singular: lt('Nurse', 'Pflegekraft'),
        description: lt('Manage nurses by department and shift.', 'Verwalten Sie Pflegekräfte nach Abteilung und Schicht.'),
        endpoint: '/api/nurses',
        service: createCrudService('/api/nurses', allowListParams('page', 'limit', 'departmentId')),
        sortOptions: [
            option('createdAt', 'Created at', 'Erstellt am'),
            option('firstName', 'First name', 'Vorname'),
            option('lastName', 'Last name', 'Nachname'),
            option('shift', 'Shift', 'Schicht'),
        ],
        defaultSortBy: 'createdAt',
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
            { name: 'departmentId', label: lt('Department', 'Abteilung'), type: 'select', source: 'departments' },
        ],
        fields: [
            { name: 'firstName', label: lt('First name', 'Vorname'), type: 'text' },
            { name: 'lastName', label: lt('Last name', 'Nachname'), type: 'text' },
            { name: 'departmentId', label: lt('Department', 'Abteilung'), type: 'select', source: 'departments' },
            { name: 'shift', label: lt('Shift', 'Schicht'), type: 'select', options: nurseShifts },
        ],
        columns: [
            { key: 'name', label: lt('Nurse', 'Pflegekraft'), render: (item) => formatPersonName(item) },
            { key: 'departmentId', label: lt('Department', 'Abteilung'), render: (item) => getDepartmentName(item) },
            { key: 'shift', label: lt('Shift', 'Schicht'), render: (item) => String(getValue(item, 'shift')) },
        ],
        schema: z.object({
            firstName: requiredString(),
            lastName: requiredString(),
            departmentId: requiredString(),
            shift: requiredString(),
        }),
        cleanPayload: (values) => stripEmptyValues(values),
        getItemTitle: (item) => formatPersonName(item),
    },
};
