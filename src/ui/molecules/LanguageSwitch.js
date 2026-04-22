import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
const langs = [
    { code: 'en', shortLabel: 'EN', labelKey: 'languageOptions.en' },
    { code: 'de', shortLabel: 'DE', labelKey: 'languageOptions.de' },
];
const resolveLanguage = () => {
    const current = (i18n.resolvedLanguage ?? i18n.language ?? 'en').toLowerCase();
    return current.startsWith('de') ? 'de' : 'en';
};
const LanguageSwitch = ({ compact = false }) => {
    const { t } = useTranslation('common');
    const [activeLanguage, setActiveLanguage] = useState(resolveLanguage);
    useEffect(() => {
        const onLanguageChanged = (lng) => setActiveLanguage(lng.toLowerCase().startsWith('de') ? 'de' : 'en');
        i18n.on('languageChanged', onLanguageChanged);
        return () => {
            i18n.off('languageChanged', onLanguageChanged);
        };
    }, []);
    return (_jsxs("label", { className: "block min-w-0", htmlFor: "sidebar-language", children: [!compact ? (_jsx("span", { className: "mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground", children: t('language') })) : (_jsx("span", { className: "sr-only", children: t('language') })), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "pointer-events-none absolute inset-y-0 left-2 flex items-center text-muted-foreground", children: _jsxs("svg", { viewBox: "0 0 24 24", className: "h-4 w-4 fill-none stroke-current stroke-[1.8]", children: [_jsx("circle", { cx: "12", cy: "12", r: "9" }), _jsx("path", { d: "M3 12h18" }), _jsx("path", { d: "M12 3a14 14 0 0 1 0 18" }), _jsx("path", { d: "M12 3a14 14 0 0 0 0 18" })] }) }), _jsx("select", { id: "sidebar-language", "aria-label": t('language'), className: clsx('h-9 w-full appearance-none rounded-xl border border-border/70 bg-background/90 pr-8 text-xs font-semibold text-foreground outline-none transition', compact ? 'pl-7' : 'pl-8', 'focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/35'), value: activeLanguage, onChange: (event) => i18n.changeLanguage(event.target.value), children: langs.map((language) => (_jsx("option", { value: language.code, children: compact ? language.shortLabel : `${language.shortLabel} - ${t(language.labelKey)}` }, language.code))) }), _jsx("span", { className: "pointer-events-none absolute inset-y-0 right-2 flex items-center text-muted-foreground", children: _jsx("svg", { viewBox: "0 0 20 20", className: "h-4 w-4 fill-current", children: _jsx("path", { d: "M5.5 7.5 10 12l4.5-4.5" }) }) })] })] }));
};
export default LanguageSwitch;
