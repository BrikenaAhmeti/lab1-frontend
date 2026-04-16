import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { formatMoney } from '@/config/currencies';
import { useUsers } from '@/hooks/useUsers';
import Badge from '@/ui/atoms/Badge';
import Card from '@/ui/atoms/Card';
const metrics = [
    {
        title: 'Daily Appointments',
        value: '34',
        change: '+8% vs yesterday',
    },
    {
        title: 'Available Rooms',
        value: '18',
        change: '12 ICU, 6 General',
    },
    {
        title: 'Admitted Patients',
        value: '76',
        change: '+4 active admissions',
    },
];
const Home = () => {
    const { data, isLoading, error } = useUsers();
    const users = Array.isArray(data)
        ? data
        : [];
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: "Hospital Dashboard" }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Monitor appointments, room utilization, admissions, and operational flow." })] }), _jsx(Badge, { variant: "secondary", className: "mt-1", children: "Daily Operations" })] }), _jsx("div", { className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3", children: metrics.map((metric) => (_jsxs(Card, { className: "h-full", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: metric.title }), _jsx("p", { className: "mt-2 text-3xl font-bold text-foreground", children: metric.value }), _jsx("p", { className: "mt-1 text-xs font-medium text-primary", children: metric.change })] }, metric.title))) }), _jsxs("div", { className: "grid gap-4 xl:grid-cols-2", children: [_jsxs(Card, { title: "Revenue Snapshot", description: "Billing activity aligned with today's admissions.", children: [_jsx("p", { className: "text-3xl font-bold text-foreground", children: formatMoney(12345.67) }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Invoices and patient admissions are synchronized." })] }), _jsxs(Card, { title: "Staff Directory Snapshot", description: "Pulled from your users endpoint through TanStack Query.", children: [isLoading ? _jsx("p", { className: "text-sm text-muted-foreground", children: "Loading users..." }) : null, error ? _jsx("p", { className: "text-sm text-danger", children: "Unable to load users right now." }) : null, !isLoading && !error && users.length === 0 ? (_jsx("p", { className: "text-sm text-muted-foreground", children: "No users found yet." })) : null, !isLoading && !error && users.length > 0 ? (_jsx("ul", { className: "space-y-2", children: users.slice(0, 8).map((userItem) => (_jsx("li", { className: "rounded-lg border border-border/70 bg-surface/70 px-3 py-2 text-sm", children: userItem.name || 'Unnamed user' }, userItem.id))) })) : null] })] })] }));
};
export default Home;
