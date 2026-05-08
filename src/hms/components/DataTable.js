import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { commonCopy } from '../copy';
import { useLanguage } from '../contexts/LanguageContext';
function DataTable({ rows, columns, loading = false, actions }) {
    const { language, t } = useLanguage();
    if (loading) {
        return (_jsx("div", { className: "space-y-3", children: Array.from({ length: 5 }).map((_, index) => (_jsx("div", { className: "h-14 animate-pulse rounded-2xl bg-muted" }, index))) }));
    }
    return (_jsx("div", { className: "overflow-hidden rounded-3xl border border-border bg-card", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-border text-left text-sm", children: [_jsx("thead", { className: "bg-muted/60 text-muted-foreground", children: _jsxs("tr", { children: [columns.map((column) => (_jsx("th", { className: "px-4 py-3 font-semibold", children: t(column.label) }, column.key))), actions ? _jsx("th", { className: "px-4 py-3 font-semibold", children: t(commonCopy.actions) }) : null] }) }), _jsx("tbody", { className: "divide-y divide-border/80", children: rows.map((item) => (_jsxs("tr", { className: "align-top", children: [columns.map((column) => (_jsx("td", { className: `px-4 py-3 text-foreground ${column.className || ''}`, children: column.render ? column.render(item, language) : String(item[column.key] ?? '') }, column.key))), actions ? _jsx("td", { className: "px-4 py-3", children: actions(item) }) : null] }, String(item.id)))) })] }) }) }));
}
export default memo(DataTable);
