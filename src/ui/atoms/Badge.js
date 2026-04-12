import { jsx as _jsx } from "react/jsx-runtime";
import clsx from 'clsx';
export default function Badge({ children, variant = 'default', className, }) {
    return (_jsx("span", { className: clsx('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', variant === 'default' && 'bg-primary/15 text-primary', variant === 'secondary' && 'bg-secondary/20 text-secondary-foreground', variant === 'success' && 'bg-success/15 text-success', variant === 'warning' && 'bg-warning/15 text-attention', variant === 'danger' && 'bg-danger/15 text-danger', className), children: children }));
}
