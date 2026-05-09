import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
function Illustration({ tone }) {
    const shellClassName = tone === 'error'
        ? 'border-danger/20 bg-danger/5'
        : tone === 'locked'
            ? 'border-border bg-muted/55'
            : 'border-border bg-background/80';
    const accentClassName = tone === 'error'
        ? 'bg-danger/20'
        : tone === 'locked'
            ? 'bg-foreground/10'
            : 'bg-primary/12';
    const barClassNames = tone === 'error'
        ? ['bg-danger/35', 'bg-danger/55', 'bg-danger/25']
        : tone === 'locked'
            ? ['bg-muted-foreground/30', 'bg-foreground/20', 'bg-muted-foreground/20']
            : ['bg-primary/20', 'bg-secondary/45', 'bg-primary/35'];
    return (_jsxs("div", { "aria-hidden": "true", className: clsx('relative mx-auto mb-5 grid h-24 w-24 place-items-center rounded-[28px] border', shellClassName), children: [_jsx("div", { className: clsx('absolute inset-3 rounded-[22px]', accentClassName) }), _jsxs("div", { className: "relative flex items-end gap-2", children: [_jsx("span", { className: clsx('h-8 w-3 rounded-full', barClassNames[0]) }), _jsx("span", { className: clsx('h-12 w-3 rounded-full', barClassNames[1]) }), _jsx("span", { className: clsx('h-6 w-3 rounded-full', barClassNames[2]) })] })] }));
}
export default function EmptyState({ title, description, action, tone = 'empty', compact = false, }) {
    return (_jsxs("div", { className: clsx('rounded-3xl border px-6 text-center', compact ? 'py-8' : 'py-10', tone === 'empty' && 'border-dashed border-border bg-background/60', tone === 'error' && 'border-danger/20 bg-danger/5', tone === 'locked' && 'border-border bg-muted/35'), children: [_jsx(Illustration, { tone: tone }), _jsx("h3", { className: "text-lg font-semibold text-foreground", children: title }), _jsx("p", { className: "mx-auto mt-2 max-w-md text-sm text-muted-foreground", children: description }), action ? _jsx("div", { className: "mt-5 flex justify-center", children: action }) : null] }));
}
