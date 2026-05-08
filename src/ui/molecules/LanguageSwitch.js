import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
import { commonCopy } from '@/hms/copy';
import { useLanguage } from '@/hms/contexts/LanguageContext';
const langs = [
    { code: 'en', shortLabel: 'EN', label: 'English' },
    { code: 'sq', shortLabel: 'SQ', label: 'Shqip' },
];
const LanguageSwitch = ({ compact = false }) => {
    const { language, setLanguage, t } = useLanguage();
    return (_jsxs("label", { className: "block min-w-0", htmlFor: "sidebar-language", children: [!compact ? (_jsx("span", { className: "mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground", children: t(commonCopy.language) })) : (_jsx("span", { className: "sr-only", children: t(commonCopy.language) })), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "pointer-events-none absolute inset-y-0 left-2 flex items-center text-muted-foreground", children: _jsxs("svg", { viewBox: "0 0 24 24", className: "h-4 w-4 fill-none stroke-current stroke-[1.8]", children: [_jsx("circle", { cx: "12", cy: "12", r: "9" }), _jsx("path", { d: "M3 12h18" }), _jsx("path", { d: "M12 3a14 14 0 0 1 0 18" }), _jsx("path", { d: "M12 3a14 14 0 0 0 0 18" })] }) }), _jsx("select", { id: "sidebar-language", "aria-label": t(commonCopy.language), className: clsx('h-9 w-full appearance-none rounded-xl border border-border/70 bg-background/90 pr-8 text-xs font-semibold text-foreground outline-none transition', compact ? 'pl-7' : 'pl-8', 'focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring/35'), value: language, onChange: (event) => setLanguage(event.target.value), children: langs.map((item) => (_jsx("option", { value: item.code, children: compact ? item.shortLabel : `${item.shortLabel} - ${item.label}` }, item.code))) }), _jsx("span", { className: "pointer-events-none absolute inset-y-0 right-2 flex items-center text-muted-foreground", children: _jsx("svg", { viewBox: "0 0 20 20", className: "h-4 w-4 fill-current", children: _jsx("path", { d: "M5.5 7.5 10 12l4.5-4.5" }) }) })] })] }));
};
export default LanguageSwitch;
