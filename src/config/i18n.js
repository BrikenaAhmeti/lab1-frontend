import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enCommon from '@/locales/en/common.json';
import deCommon from '@/locales/de/common.json';
import enTransactions from '@/locales/en/transactions.json';
import deTransactions from '@/locales/de/transactions.json';
const resources = {
    en: {
        common: enCommon,
        transactions: enTransactions,
    },
    de: {
        common: deCommon,
        transactions: deTransactions,
    },
};
i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'de'],
    ns: ['common', 'transactions'],
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
