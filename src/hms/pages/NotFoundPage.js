import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { commonCopy } from '../copy';
import { useLanguage } from '../contexts/LanguageContext';
export default function NotFoundPage() {
    const { t } = useLanguage();
    return (_jsx("div", { className: "grid min-h-screen place-items-center px-4", children: _jsxs("div", { className: "rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-soft", children: [_jsx("h1", { className: "text-2xl font-bold text-foreground", children: "404" }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: t(commonCopy.emptyDescription) })] }) }));
}
