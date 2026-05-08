import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { memo } from 'react';
import Button from '@/ui/atoms/Button';
import Select from '@/ui/atoms/Select';
import { commonCopy } from '../copy';
import { useLanguage } from '../contexts/LanguageContext';
function Pagination({ page, totalPages, total, limit, limitOptions, onPageChange, onLimitChange, }) {
    const { t } = useLanguage();
    return (_jsxs("div", { className: "flex flex-col gap-4 rounded-3xl border border-border bg-card px-4 py-4 md:flex-row md:items-end md:justify-between", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-sm font-medium text-foreground", children: [t(commonCopy.totalRecords), ": ", total] }), _jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [t(commonCopy.pageSummary), " ", page, " / ", Math.max(totalPages, 1)] })] }), _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-end", children: [_jsx("div", { className: "w-full sm:w-40", children: _jsx(Select, { label: t(commonCopy.rowsPerPage), value: String(limit), onChange: (event) => onLimitChange(Number(event.target.value)), children: limitOptions.map((option) => (_jsx("option", { value: option, children: option }, option))) }) }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "outline", disabled: page <= 1, onClick: () => onPageChange(page - 1), children: t(commonCopy.previous) }), _jsx(Button, { variant: "outline", disabled: totalPages <= 1 || page >= totalPages, onClick: () => onPageChange(page + 1), children: t(commonCopy.next) })] })] })] }));
}
export default memo(Pagination);
