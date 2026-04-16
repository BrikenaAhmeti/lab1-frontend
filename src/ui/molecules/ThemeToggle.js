import { jsx as _jsx } from "react/jsx-runtime";
import clsx from 'clsx';
import { useThemeMode } from '@/hooks/useThemeMode';
const themeModes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
];
export default function ThemeToggle() {
    const { mode, setMode } = useThemeMode();
    return (_jsx("div", { className: "inline-flex items-center rounded-xl border border-border/70 bg-card/80 p-1", children: themeModes.map((theme) => (_jsx("button", { type: "button", onClick: () => setMode(theme.value), className: clsx('rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors', mode === theme.value
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'), "aria-label": `Switch theme to ${theme.label}`, children: theme.label }, theme.value))) }));
}
