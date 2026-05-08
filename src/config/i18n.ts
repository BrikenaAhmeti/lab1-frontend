import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enCommon from '@/locales/en/common.json';
import deCommon from '@/locales/de/common.json';
import enTransactions from '@/locales/en/transactions.json';
import deTransactions from '@/locales/de/transactions.json';
import enPatients from '@/locales/en/patients.json';
import dePatients from '@/locales/de/patients.json';
import enDoctors from '@/locales/en/doctors.json';
import deDoctors from '@/locales/de/doctors.json';
import enDepartments from '@/locales/en/departments.json';
import deDepartments from '@/locales/de/departments.json';
import enNurses from '@/locales/en/nurses.json';
import deNurses from '@/locales/de/nurses.json';
import enAppointments from '@/locales/en/appointments.json';
import deAppointments from '@/locales/de/appointments.json';
import enMedicalRecords from '@/locales/en/medical-records.json';
import deMedicalRecords from '@/locales/de/medical-records.json';
import enPrescriptions from '@/locales/en/prescriptions.json';
import dePrescriptions from '@/locales/de/prescriptions.json';
import enRooms from '@/locales/en/rooms.json';
import deRooms from '@/locales/de/rooms.json';
import enAdmissions from '@/locales/en/admissions.json';
import deAdmissions from '@/locales/de/admissions.json';
import enInvoices from '@/locales/en/invoices.json';
import deInvoices from '@/locales/de/invoices.json';
import enDashboard from '@/locales/en/dashboard.json';
import deDashboard from '@/locales/de/dashboard.json';

const resources = {
  en: {
    common: enCommon,
    transactions: enTransactions,
    patients: enPatients,
    doctors: enDoctors,
    departments: enDepartments,
    nurses: enNurses,
    appointments: enAppointments,
    medicalRecords: enMedicalRecords,
    prescriptions: enPrescriptions,
    rooms: enRooms,
    admissions: enAdmissions,
    invoices: enInvoices,
    dashboard: enDashboard,
  },
  de: {
    common: deCommon,
    transactions: deTransactions,
    patients: dePatients,
    doctors: deDoctors,
    departments: deDepartments,
    nurses: deNurses,
    appointments: deAppointments,
    medicalRecords: deMedicalRecords,
    prescriptions: dePrescriptions,
    rooms: deRooms,
    admissions: deAdmissions,
    invoices: deInvoices,
    dashboard: deDashboard,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'de'],
    ns: ['common', 'transactions', 'patients', 'doctors', 'departments', 'nurses', 'appointments', 'medicalRecords', 'prescriptions', 'rooms', 'admissions', 'invoices', 'dashboard'],
    defaultNS: 'common',
    load: 'languageOnly',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.resolvedLanguage ?? 'en';
  i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
  });
}

export default i18n;
