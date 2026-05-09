import { jsx as _jsx } from "react/jsx-runtime";
import clsx from 'clsx';
export default function ListSkeleton({ items = 3, itemClassName, className, }) {
    return (_jsx("div", { "aria-hidden": "true", className: clsx('space-y-3', className), children: Array.from({ length: items }).map((_, index) => (_jsx("div", { className: clsx('h-16 animate-pulse rounded-2xl bg-muted', itemClassName) }, index))) }));
}
