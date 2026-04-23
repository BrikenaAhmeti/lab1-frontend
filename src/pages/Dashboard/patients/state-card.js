import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function PatientStateCard({ title, description, children }) {
    return (_jsxs("div", { className: "max-w-3xl rounded-2xl border border-border/70 bg-card/85 p-5 shadow-panel backdrop-blur-sm md:p-6", children: [_jsx("h2", { className: "text-base font-semibold text-foreground", children: title }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: description }), children ? _jsx("div", { className: "mt-4", children: children }) : null] }));
}
