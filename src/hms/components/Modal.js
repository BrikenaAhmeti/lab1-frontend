import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import Button from '@/ui/atoms/Button';
import { commonCopy } from '../copy';
import { useLanguage } from '../contexts/LanguageContext';
export default function Modal({ open, title, description, onClose, children }) {
    const { t } = useLanguage();
    useEffect(() => {
        if (!open) {
            return undefined;
        }
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [onClose, open]);
    if (!open) {
        return null;
    }
    return (_jsxs("div", { className: "fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 px-4 py-6", children: [_jsx("button", { type: "button", "aria-label": t(commonCopy.close), className: "absolute inset-0", onClick: onClose }), _jsxs("div", { className: "relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-border bg-card p-6 shadow-panel", children: [_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-foreground", children: title }), description ? _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: description }) : null] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: t(commonCopy.close) })] }), _jsx("div", { className: "mt-6", children: children })] })] }));
}
