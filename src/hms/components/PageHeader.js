import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function PageHeader({ title, description, action }) {
    return (_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-4", children: [_jsxs("div", { className: "max-w-2xl", children: [_jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground md:text-3xl", children: title }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground md:text-base", children: description })] }), action ? _jsx("div", { className: "shrink-0", children: action }) : null] }));
}
