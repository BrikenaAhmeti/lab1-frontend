import { jsx as _jsx } from "react/jsx-runtime";
import i18n from 'i18next';
const langs = [
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
];
const LanguageSwitch = () => {
    return (_jsx("div", { className: "flex items-center gap-2", children: langs.map(l => (_jsx("button", { onClick: () => i18n.changeLanguage(l.code), className: "px-2 py-1 border rounded text-sm", "aria-label": `Change language to ${l.label}`, children: l.label }, l.code))) }));
};
export default LanguageSwitch;
