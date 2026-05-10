import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import i18n from '@/config/i18n';
import type { Language, LocalizedText } from '../types';
import { pickText } from '../copy';

const LANGUAGE_KEY = 'language';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (value: LocalizedText) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): Language {
  const storedLanguage = localStorage.getItem(LANGUAGE_KEY);

  if (storedLanguage === 'de' || storedLanguage === 'en') {
    return storedLanguage;
  }

  return i18n.resolvedLanguage === 'de' ? 'de' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
    void i18n.changeLanguage(language);
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: (value) => pickText(language, value),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
}
