import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function TableSkeleton({ columns = 5, rows = 5, }) {
    const columnCount = Math.max(columns, 1);
    return (_jsx("div", { "aria-hidden": "true", className: "overflow-hidden rounded-3xl border border-border bg-card", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("div", { className: "min-w-[720px]", children: [_jsx("div", { className: "grid gap-4 border-b border-border bg-muted/60 px-4 py-3", style: { gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }, children: Array.from({ length: columnCount }).map((_, index) => (_jsx("div", { className: "h-4 w-3/4 animate-pulse rounded-full bg-muted" }, index))) }), _jsx("div", { className: "divide-y divide-border/80", children: Array.from({ length: rows }).map((_, rowIndex) => (_jsx("div", { className: "grid gap-4 px-4 py-4", style: { gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }, children: Array.from({ length: columnCount }).map((__, columnIndex) => (_jsx("div", { className: "h-4 animate-pulse rounded-full bg-muted", style: {
                                    width: `${Math.max(42, 78 - ((rowIndex + columnIndex) % 3) * 12)}%`,
                                } }, columnIndex))) }, rowIndex))) })] }) }) }));
}
