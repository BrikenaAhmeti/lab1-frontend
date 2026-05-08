import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import PrivateRoute from './components/PrivateRoute';
import { commonCopy } from './copy';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import { moduleConfigs, moduleOrder } from './modules';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import ModulePage from './pages/ModulePage';
function HomeRedirect() {
    const { ready, isAuthenticated } = useAuth();
    if (!ready) {
        return null;
    }
    return _jsx(Navigate, { to: isAuthenticated ? '/dashboard' : '/login', replace: true });
}
function GuestRoute() {
    const { ready, isAuthenticated } = useAuth();
    if (!ready) {
        return null;
    }
    return isAuthenticated ? _jsx(Navigate, { to: "/dashboard", replace: true }) : _jsx(Outlet, {});
}
function NotFoundPage() {
    const { t } = useLanguage();
    return (_jsx("div", { className: "grid min-h-screen place-items-center px-4", children: _jsxs("div", { className: "rounded-3xl border border-border bg-card px-6 py-10 text-center shadow-soft", children: [_jsx("h1", { className: "text-2xl font-bold text-foreground", children: "404" }), _jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: t(commonCopy.emptyDescription) })] }) }));
}
export default function AppRouter() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomeRedirect, {}) }), _jsx(Route, { element: _jsx(GuestRoute, {}), children: _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }) }), _jsx(Route, { element: _jsx(PrivateRoute, {}), children: _jsxs(Route, { element: _jsx(AppLayout, {}), children: [_jsx(Route, { path: "/dashboard", element: _jsx(DashboardPage, {}) }), moduleOrder.map((key) => (_jsx(Route, { path: `/${moduleConfigs[key].path}`, element: _jsx(ModulePage, { moduleKey: key }) }, key)))] }) }), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }));
}
