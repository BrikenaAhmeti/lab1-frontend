import { lt } from './copy';
import type { LocalizedText, ModuleKey } from './types';

type ModuleRouteMeta = {
  path: string;
  label: LocalizedText;
};

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

export const moduleRouteMeta: Record<ModuleKey, ModuleRouteMeta> = {
  patients: {
    path: 'patients',
    label: lt('Patients', 'Patienten'),
  },
  doctors: {
    path: 'doctors',
    label: lt('Doctors', 'Ärzte'),
  },
  departments: {
    path: 'departments',
    label: lt('Departments', 'Abteilungen'),
  },
  appointments: {
    path: 'appointments',
    label: lt('Appointments', 'Termine'),
  },
  'medical-records': {
    path: 'medical-records',
    label: lt('Medical records', 'Krankenakten'),
  },
  prescriptions: {
    path: 'prescriptions',
    label: lt('Prescriptions', 'Rezepte'),
  },
  rooms: {
    path: 'rooms',
    label: lt('Rooms', 'Zimmer'),
  },
  admissions: {
    path: 'admissions',
    label: lt('Admissions', 'Aufnahmen'),
  },
  invoices: {
    path: 'invoices',
    label: lt('Invoices', 'Rechnungen'),
  },
  nurses: {
    path: 'nurses',
    label: lt('Nurses', 'Pflegekräfte'),
  },
};
