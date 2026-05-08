import { lt } from './copy';
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
export const moduleRouteMeta = {
    patients: {
        path: 'patients',
        label: lt('Patients', 'Pacientet'),
    },
    doctors: {
        path: 'doctors',
        label: lt('Doctors', 'Mjeket'),
    },
    departments: {
        path: 'departments',
        label: lt('Departments', 'Departamentet'),
    },
    appointments: {
        path: 'appointments',
        label: lt('Appointments', 'Takimet'),
    },
    'medical-records': {
        path: 'medical-records',
        label: lt('Medical records', 'Kartelat mjekesore'),
    },
    prescriptions: {
        path: 'prescriptions',
        label: lt('Prescriptions', 'Recetat'),
    },
    rooms: {
        path: 'rooms',
        label: lt('Rooms', 'Dhomat'),
    },
    admissions: {
        path: 'admissions',
        label: lt('Admissions', 'Pranimet'),
    },
    invoices: {
        path: 'invoices',
        label: lt('Invoices', 'Faturat'),
    },
    nurses: {
        path: 'nurses',
        label: lt('Nurses', 'Infermieret'),
    },
};
