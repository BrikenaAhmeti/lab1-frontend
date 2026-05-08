import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
const ToastContext = createContext(null);
function getToastId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random()}`;
}
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const showToast = (message, tone = 'info') => {
        const id = getToastId();
        setToasts((current) => [...current, { id, message, tone }]);
        window.setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 3200);
    };
    return (_jsxs(ToastContext.Provider, { value: { showToast }, children: [children, _jsx("div", { className: "pointer-events-none fixed right-4 top-4 z-[70] flex w-full max-w-sm flex-col gap-3", children: toasts.map((toast) => (_jsx("div", { className: [
                        'pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-panel backdrop-blur',
                        toast.tone === 'success' && 'border-success/30 bg-success/15 text-success',
                        toast.tone === 'error' && 'border-danger/30 bg-danger/15 text-danger',
                        toast.tone === 'info' && 'border-border bg-card/95 text-foreground',
                    ]
                        .filter(Boolean)
                        .join(' '), children: toast.message }, toast.id))) })] }));
}
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used inside ToastProvider');
    }
    return context;
}
