import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '@/hooks/useThemeMode';
export default function ThemeToggle({ compact = false }) {
    const { t } = useTranslation('common');
    const { mode, setMode } = useThemeMode();
    const isDark = mode === 'dark' ||
        (mode === 'system' &&
            typeof document !== 'undefined' &&
            document.documentElement.classList.contains('dark'));
    const themeLabel = t(isDark ? 'themeOptions.dark' : 'themeOptions.light');
    return (_jsxs("div", { className: "min-w-0", children: [!compact ? (_jsx("span", { className: "mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground", children: t('theme') })) : (_jsx("span", { className: "sr-only", children: t('theme') })), _jsxs("button", { type: "button", "aria-label": `${t('theme')}: ${themeLabel}`, "aria-pressed": isDark, className: clsx('flex h-9 w-full items-center justify-between rounded-xl border border-border/70 bg-background/90 text-left transition hover:border-primary/30 hover:bg-muted/35', compact ? 'gap-1 px-2' : 'px-2.5'), onClick: () => setMode(isDark ? 'light' : 'dark'), children: [_jsxs("span", { className: clsx('inline-flex min-w-0 items-center text-xs font-semibold text-foreground', compact ? 'gap-1.5' : 'gap-2'), children: [_jsx("svg", { viewBox: "0 0 24 24", className: "h-4 w-4 fill-none stroke-current stroke-[1.8]", children: isDark ? (_jsx("path", { d: "M20 15.5A8.5 8.5 0 1 1 8.5 4 7 7 0 0 0 20 15.5Z" })) : (_jsxs(_Fragment, { children: [_jsx("circle", { cx: "12", cy: "12", r: "4" }), _jsx("path", { d: "M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" })] })) }), _jsx("span", { className: "truncate", children: themeLabel })] }), _jsx("span", { className: clsx('relative rounded-full transition-colors', compact ? 'h-[18px] w-8' : 'h-5 w-10', isDark ? 'bg-primary' : 'bg-muted'), children: _jsx("span", { className: clsx('absolute rounded-full bg-background shadow-sm transition-transform', compact ? 'top-[2px] h-3.5 w-3.5' : 'top-0.5 h-4 w-4', isDark ? (compact ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0.5') }) })] })] }));
}
