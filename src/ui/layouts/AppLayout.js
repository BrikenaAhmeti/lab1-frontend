import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/domain/auth/auth.thunks';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import LanguageSwitch from '@/ui/molecules/LanguageSwitch';
import ThemeToggle from '@/ui/molecules/ThemeToggle';
const navigationItems = [
    {
        to: '/app',
        label: 'Dashboard',
        description: 'Daily hospital activity',
        match: (pathname) => pathname === '/app',
    },
    {
        to: '/app/transactions',
        label: 'Transactions',
        description: 'Redux Toolkit workflow',
        match: (pathname) => pathname.startsWith('/app/transactions'),
    },
    {
        to: '/app/tan-transactions',
        label: 'Transactions Query',
        description: 'TanStack Query workflow',
        match: (pathname) => pathname.startsWith('/app/tan-transactions'),
    },
    {
        to: '/app/admin',
        label: 'Admin',
        description: 'Users and role controls',
        roles: ['ADMIN'],
        match: (pathname) => pathname.startsWith('/app/admin'),
    },
];
const upcomingModules = [
    'Patients',
    'Doctors',
    'Departments',
    'Appointments',
    'Medical Records',
    'Rooms',
    'Admissions',
    'Invoices',
    'Nurses',
];
const adminRoleSet = new Set(['ADMIN', 'ADMINS', 'SUPER-ADMINS', 'SUPER_ADMIN']);
function normalizeRole(role) {
    return role.trim().toUpperCase();
}
function canViewItem(roles, requiredRoles) {
    if (!requiredRoles?.length)
        return true;
    const required = requiredRoles.map(normalizeRole);
    return roles.some((role) => required.includes(role));
}
function getInitials(firstName, lastName) {
    const initialA = firstName?.trim().charAt(0) ?? '';
    const initialB = lastName?.trim().charAt(0) ?? '';
    const initials = `${initialA}${initialB}`.toUpperCase();
    return initials || 'MS';
}
export default function AppLayout() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAppSelector((s) => s.auth);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const roles = useMemo(() => {
        const storedRole = localStorage.getItem('role');
        const sourceRoles = user?.roles?.length ? user.roles : storedRole ? [storedRole] : [];
        return sourceRoles.map(normalizeRole);
    }, [user?.roles]);
    const visibleNavigation = useMemo(() => navigationItems.filter((item) => canViewItem(roles, item.roles)), [roles]);
    const activeNavigation = useMemo(() => visibleNavigation.find((item) => item.match(location.pathname)) ?? visibleNavigation[0], [location.pathname, visibleNavigation]);
    const showRightSidebar = roles.some((role) => adminRoleSet.has(role));
    const displayName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Hospital Staff';
    const userRole = roles[0] ?? 'STAFF';
    useEffect(() => {
        setMobileNavOpen(false);
    }, [location.pathname]);
    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login', { replace: true });
    };
    return (_jsxs("div", { className: "relative min-h-screen bg-background text-foreground", children: [_jsx("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--secondary)/0.15),transparent_48%),radial-gradient(circle_at_bottom_left,hsl(var(--primary)/0.18),transparent_45%)]" }), mobileNavOpen ? (_jsx("button", { type: "button", "aria-label": "Close navigation", className: "fixed inset-0 z-30 bg-foreground/30 backdrop-blur-[2px] lg:hidden", onClick: () => setMobileNavOpen(false) })) : null, _jsxs("div", { className: "relative flex min-h-screen", children: [_jsx("aside", { className: clsx('fixed inset-y-0 left-0 z-40 w-72 border-r border-border/70 bg-card/95 backdrop-blur transition-transform duration-200 lg:translate-x-0', mobileNavOpen ? 'translate-x-0' : '-translate-x-full'), children: _jsxs("div", { className: "flex h-full flex-col", children: [_jsx("div", { className: "border-b border-border/70 px-4 py-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "rounded-2xl border border-border/70 bg-background/70 p-2 shadow-soft", children: _jsx("img", { src: "/medsphere.png", alt: "Medsphere logo", className: "h-10 w-10 object-contain" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-bold tracking-[0.24em] text-primary", children: "MEDSPHERE" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Hospital Management" })] })] }) }), _jsxs("nav", { className: "flex-1 overflow-y-auto px-4 py-4", children: [_jsx("div", { className: "space-y-1.5", children: visibleNavigation.map((item) => (_jsxs(NavLink, { to: item.to, end: item.to === '/app', className: ({ isActive }) => clsx('block rounded-xl border px-3.5 py-2.5 transition-colors', isActive || item.match(location.pathname)
                                                    ? 'border-primary/35 bg-primary/10'
                                                    : 'border-transparent hover:border-border hover:bg-muted/60'), children: [_jsx("div", { className: "text-sm font-semibold text-foreground", children: item.label }), _jsx("div", { className: "mt-0.5 text-xs text-muted-foreground", children: item.description })] }, item.to))) }), _jsxs("section", { className: "mt-6 rounded-2xl border border-border/70 bg-surface/70 p-4", children: [_jsx("p", { className: "text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground", children: "Planned Modules" }), _jsx("ul", { className: "mt-3 space-y-2", children: upcomingModules.map((module) => (_jsxs("li", { className: "flex items-center justify-between gap-2 text-xs", children: [_jsx("span", { className: "text-muted-foreground", children: module }), _jsx(Badge, { variant: "secondary", className: "px-2 py-0.5", children: "Soon" })] }, module))) })] })] }), _jsx("div", { className: "border-t border-border/70 px-4 py-4", children: _jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-border/70 bg-surface/70 px-3 py-2.5", children: [_jsx("div", { className: "grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary", children: getInitials(user?.firstName, user?.lastName) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-sm font-semibold", children: displayName }), _jsx("p", { className: "truncate text-xs uppercase tracking-wide text-muted-foreground", children: userRole })] })] }) })] }) }), _jsxs("div", { className: clsx('flex min-h-screen w-full flex-col lg:pl-72', showRightSidebar && 'xl:pr-80'), children: [_jsx("header", { className: "sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur", children: _jsxs("div", { className: "flex items-center justify-between gap-4 px-4 py-3 md:px-6", children: [_jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [_jsx("button", { type: "button", "aria-label": mobileNavOpen ? 'Close navigation' : 'Open navigation', "aria-expanded": mobileNavOpen, className: "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-card text-foreground transition-colors hover:bg-muted/60 lg:hidden", onClick: () => setMobileNavOpen((state) => !state), children: _jsx("svg", { viewBox: "0 0 24 24", className: "h-5 w-5 fill-none stroke-current stroke-2", children: mobileNavOpen ? (_jsx("path", { d: "m5 5 14 14M19 5 5 19" })) : (_jsxs(_Fragment, { children: [_jsx("path", { d: "M4 7h16" }), _jsx("path", { d: "M4 12h16" }), _jsx("path", { d: "M4 17h16" })] })) }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "truncate text-lg font-bold", children: activeNavigation?.label ?? 'Dashboard' }), _jsx("p", { className: "truncate text-xs text-muted-foreground", children: activeNavigation?.description ?? 'Hospital system overview' })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(LanguageSwitch, {}), _jsx(ThemeToggle, {}), _jsx(Button, { size: "sm", variant: "outline", onClick: handleLogout, children: "Logout" })] })] }) }), _jsx("main", { className: "flex-1 px-4 py-5 md:px-6 md:py-6", children: _jsx(Outlet, {}) })] }), showRightSidebar ? (_jsxs("aside", { className: "fixed inset-y-0 right-0 hidden w-80 border-l border-border/70 bg-card/95 p-6 backdrop-blur xl:flex xl:flex-col", children: [_jsxs("div", { className: "rounded-2xl border border-border/70 bg-surface/70 p-4", children: [_jsx("p", { className: "text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground", children: "Admin Access" }), _jsx("p", { className: "mt-2 text-sm font-semibold text-foreground", children: "Security and permission monitoring enabled" })] }), _jsxs("div", { className: "mt-4 rounded-2xl border border-border/70 bg-surface/70 p-4", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: "Daily Focus" }), _jsxs("ul", { className: "mt-3 space-y-2 text-sm text-muted-foreground", children: [_jsx("li", { children: "Review high-risk admissions and room occupancy" }), _jsx("li", { children: "Validate open invoices and pending approvals" }), _jsx("li", { children: "Check staffing coverage by department" })] })] }), _jsxs("div", { className: "mt-4 rounded-2xl border border-border/70 bg-surface/70 p-4", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: "System Status" }), _jsxs("div", { className: "mt-3 flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Auth service" }), _jsx(Badge, { variant: "success", children: "Healthy" })] }), _jsxs("div", { className: "mt-2 flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "API sync" }), _jsx(Badge, { children: "Stable" })] })] })] })) : null] })] }));
}
