import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function EmptyState({ title, description, action }) {
    return (_jsxs("div", { className: "rounded-3xl border border-dashed border-border bg-background/60 px-6 py-10 text-center", children: [_jsx("h3", { className: "text-lg font-semibold text-foreground", children: title }), _jsx("p", { className: "mx-auto mt-2 max-w-md text-sm text-muted-foreground", children: description }), action ? _jsx("div", { className: "mt-4 flex justify-center", children: action }) : null] }));
}
