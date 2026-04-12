import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
export default function Select({ label, hint, error, className, id, children, ...rest }) {
    const fieldId = id ?? rest.name;
    return (_jsxs("label", { className: "block space-y-1.5", htmlFor: fieldId, children: [label && _jsx("span", { className: "text-sm font-medium text-foreground", children: label }), _jsx("select", { id: fieldId, className: clsx('ds-field appearance-none', error && 'border-danger focus-visible:ring-danger/35', className), ...rest, children: children }), error ? (_jsx("span", { className: "text-xs text-danger", children: error })) : hint ? (_jsx("span", { className: "text-xs text-muted-foreground", children: hint })) : null] }));
}
