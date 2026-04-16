import { jsx as _jsx } from "react/jsx-runtime";
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import i18n from 'i18next';
const langs = [
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
];
const resolveLanguage = () => {
    const current = (i18n.resolvedLanguage ?? i18n.language ?? 'en').toLowerCase();
    return current.startsWith('de') ? 'de' : 'en';
};
const LanguageSwitch = () => {
    const [activeLanguage, setActiveLanguage] = useState(resolveLanguage);
    useEffect(() => {
        const onLanguageChanged = (lng) => setActiveLanguage(lng.toLowerCase().startsWith('de') ? 'de' : 'en');
        i18n.on('languageChanged', onLanguageChanged);
        return () => {
            i18n.off('languageChanged', onLanguageChanged);
        };
    }, []);
    return (_jsx("div", { className: "inline-flex items-center rounded-xl border border-border/70 bg-card/80 p-1", children: langs.map((language) => (_jsx("button", { type: "button", onClick: () => i18n.changeLanguage(language.code), className: clsx('rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors', activeLanguage === language.code
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'), "aria-label": `Change language to ${language.label}`, children: language.label }, language.code))) }));
};
export default LanguageSwitch;
