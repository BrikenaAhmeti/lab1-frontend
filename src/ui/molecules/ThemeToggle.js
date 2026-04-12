import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useThemeMode } from '@/hooks/useThemeMode';
export default function ThemeToggle() {
    const { mode, cycle, setMode } = useThemeMode();
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: cycle, className: "px-3 py-1 rounded border bg-gray-100 dark:bg-gray-800", title: "Cycle theme: light \u2192 dark \u2192 system", children: ["Theme: ", mode] }), _jsxs("div", { className: "hidden sm:flex gap-1", children: [_jsx("button", { className: "px-2 py-1 rounded border", onClick: () => setMode('light'), children: "Light" }), _jsx("button", { className: "px-2 py-1 rounded border", onClick: () => setMode('dark'), children: "Dark" }), _jsx("button", { className: "px-2 py-1 rounded border", onClick: () => setMode('system'), children: "System" })] })] }));
}
