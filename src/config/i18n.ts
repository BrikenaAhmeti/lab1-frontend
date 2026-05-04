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

const resources = {
  en: {
    common: enCommon,
    transactions: enTransactions,
    patients: enPatients,
    doctors: enDoctors,
    departments: enDepartments,
    nurses: enNurses,
  },
  de: {
    common: deCommon,
    transactions: deTransactions,
    patients: dePatients,
    doctors: deDoctors,
    departments: deDepartments,
    nurses: deNurses,
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'de'],
    ns: ['common', 'transactions', 'patients', 'doctors', 'departments', 'nurses'],
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
