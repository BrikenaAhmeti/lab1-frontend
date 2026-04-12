import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DashboardLayout from '@/ui/layouts/DashboardLayout';
import { formatMoney } from '@/config/currencies';
import { useUsers } from '@/hooks/useUsers';
const Home = () => {
    const { data, isLoading, error } = useUsers();
    return (_jsxs(DashboardLayout, { children: [_jsx("h1", { className: "text-2xl font-semibold mb-4", children: "Overview" }), _jsxs("div", { className: "rounded-xl border p-4 mb-4", children: ["Revenue Today: ", formatMoney(12345.67)] }), _jsxs("div", { className: "rounded-xl border p-4", children: [_jsx("h2", { className: "font-semibold mb-2", children: "Users (fetched via TanStack Query)" }), isLoading && _jsx("div", { children: "Loading..." }), error && _jsx("div", { children: "Error loading users" }), !isLoading && !error && (_jsx("ul", { className: "list-disc ml-6", children: data?.map((u) => _jsx("li", { children: u.name }, u.id)) }))] })] }));
};
export default Home;
