import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
export default function Card({ title, description, footer, children, className }) {
    return (_jsxs("article", { className: clsx('ds-shell p-5 md:p-6', className), children: [(title || description) && (_jsxs("header", { className: "mb-4", children: [title && _jsx("h3", { className: "text-base font-semibold text-foreground", children: title }), description && _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: description })] })), _jsx("div", { children: children }), footer && _jsx("footer", { className: "mt-4 border-t border-border pt-4", children: footer })] }));
}
