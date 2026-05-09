import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import LanguageSwitch from '@/ui/molecules/LanguageSwitch';
import ThemeToggle from '@/ui/molecules/ThemeToggle';
import { commonCopy } from '../copy';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { formatPersonName } from '../lib/utils';
import { moduleOrder, moduleRouteMeta } from '../module-meta';
export default function AppLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout, logoutAll } = useAuth();
    const { t } = useLanguage();
    const fullName = formatPersonName(user);
    const closeSidebar = () => setIsSidebarOpen(false);
    return (_jsx("div", { className: "min-h-screen bg-background", children: _jsxs("div", { className: "mx-auto flex min-h-screen max-w-[1600px]", children: [_jsx("div", { className: clsx('fixed inset-0 z-40 bg-slate-950/45 transition md:hidden', isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'), onClick: closeSidebar }), _jsxs("aside", { className: clsx('fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-border bg-card px-4 py-5 transition-transform md:sticky md:translate-x-0', isSidebarOpen ? 'translate-x-0' : '-translate-x-full'), children: [_jsxs("div", { className: "rounded-3xl bg-primary px-4 py-4 text-primary-foreground shadow-soft", children: [_jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em]", children: "HMS" }), _jsx("h2", { className: "mt-2 text-xl font-bold", children: t(commonCopy.appName) }), _jsx("p", { className: "mt-1 text-sm text-primary-foreground/85", children: t(commonCopy.appSubtitle) })] }), _jsxs("nav", { className: "mt-6 flex-1 space-y-2 overflow-y-auto", children: [_jsx(NavLink, { to: "/dashboard", className: ({ isActive }) => clsx('block rounded-2xl px-4 py-3 text-sm font-medium transition', isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'), onClick: closeSidebar, children: t(commonCopy.dashboard) }), moduleOrder.map((key) => (_jsx(NavLink, { to: `/${moduleRouteMeta[key].path}`, className: ({ isActive }) => clsx('block rounded-2xl px-4 py-3 text-sm font-medium transition', isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'), onClick: closeSidebar, children: t(moduleRouteMeta[key].label) }, key)))] }), _jsxs("div", { className: "mt-6 space-y-3 rounded-3xl border border-border bg-background/70 p-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: fullName || t(commonCopy.appName) }), _jsx("p", { className: "mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground", children: (user?.roles || []).join(', ') || 'USER' })] }), _jsx(ThemeToggle, {}), _jsx(LanguageSwitch, {}), _jsx(Button, { variant: "outline", onClick: async () => {
                                        await logout();
                                        closeSidebar();
                                    }, children: t(commonCopy.signOut) }), _jsx(Button, { variant: "ghost", onClick: async () => {
                                        await logoutAll();
                                        closeSidebar();
                                    }, children: t(commonCopy.signOutAll) })] })] }), _jsxs("div", { className: "flex min-h-screen min-w-0 flex-1 flex-col md:pl-0", children: [_jsx("header", { className: "sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur", children: _jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Button, { variant: "outline", size: "sm", className: "md:hidden", onClick: () => setIsSidebarOpen((current) => !current), children: t(commonCopy.mobileMenu) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: t(commonCopy.appName) }), _jsx("p", { className: "text-xs text-muted-foreground", children: fullName || user?.email || 'User' })] })] }), _jsxs("div", { className: "hidden items-center gap-3 md:flex", children: [_jsx(ThemeToggle, { compact: true }), _jsx(LanguageSwitch, { compact: true })] })] }) }), _jsx("main", { className: "flex-1 px-4 py-6 md:px-6", children: _jsx("div", { className: "mx-auto max-w-7xl", children: _jsx(Outlet, {}) }) })] })] }) }));
}
