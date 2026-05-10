import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import i18n from '@/config/i18n';
import { pickText } from '../copy';
const LANGUAGE_KEY = 'language';
const LanguageContext = createContext(null);
function getInitialLanguage() {
    const storedLanguage = localStorage.getItem(LANGUAGE_KEY);
    if (storedLanguage === 'de' || storedLanguage === 'en') {
        return storedLanguage;
    }
    return i18n.resolvedLanguage === 'de' ? 'de' : 'en';
}
export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(getInitialLanguage);
    useEffect(() => {
        localStorage.setItem(LANGUAGE_KEY, language);
        document.documentElement.lang = language;
        void i18n.changeLanguage(language);
    }, [language]);
    return (_jsx(LanguageContext.Provider, { value: {
            language,
            setLanguage,
            t: (value) => pickText(language, value),
        }, children: children }));
}
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used inside LanguageProvider');
    }
    return context;
}
