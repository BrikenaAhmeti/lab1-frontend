import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
export default function Textarea({ label, hint, error, className, id, ...rest }) {
    const fieldId = id ?? rest.name;
    return (_jsxs("label", { className: "block space-y-1.5", htmlFor: fieldId, children: [label && _jsx("span", { className: "text-sm font-medium text-foreground", children: label }), _jsx("textarea", { id: fieldId, className: clsx('ds-field min-h-24 resize-y', error && 'border-danger focus-visible:ring-danger/35', className), ...rest }), error ? (_jsx("span", { className: "text-xs text-danger", children: error })) : hint ? (_jsx("span", { className: "text-xs text-muted-foreground", children: hint })) : null] }));
}
