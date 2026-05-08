import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import PrivateRoute from './components/PrivateRoute';
import RouteSkeleton from './components/RouteSkeleton';
import { useAuth } from './contexts/AuthContext';
import { moduleOrder, moduleRouteMeta } from './module-meta';
const LoginPage = lazy(() => import('./pages/routes/LoginRoutePage'));
const DashboardPage = lazy(() => import('./pages/routes/DashboardRoutePage'));
const NotFoundPage = lazy(() => import('./pages/routes/NotFoundRoutePage'));
const moduleRoutePages = {
    patients: lazy(() => import('./pages/routes/PatientsRoutePage')),
    doctors: lazy(() => import('./pages/routes/DoctorsRoutePage')),
    departments: lazy(() => import('./pages/routes/DepartmentsRoutePage')),
    appointments: lazy(() => import('./pages/routes/AppointmentsRoutePage')),
    'medical-records': lazy(() => import('./pages/routes/MedicalRecordsRoutePage')),
    prescriptions: lazy(() => import('./pages/routes/PrescriptionsRoutePage')),
    rooms: lazy(() => import('./pages/routes/RoomsRoutePage')),
    admissions: lazy(() => import('./pages/routes/AdmissionsRoutePage')),
    invoices: lazy(() => import('./pages/routes/InvoicesRoutePage')),
    nurses: lazy(() => import('./pages/routes/NursesRoutePage')),
};
function renderLazyPage(PageComponent, variant = 'page') {
    return (_jsx(Suspense, { fallback: _jsx(RouteSkeleton, { variant: variant }), children: _jsx(PageComponent, {}) }));
}
function HomeRedirect() {
    const { ready, isAuthenticated } = useAuth();
    if (!ready) {
        return _jsx(RouteSkeleton, { variant: "fullscreen" });
    }
    return _jsx(Navigate, { to: isAuthenticated ? '/dashboard' : '/login', replace: true });
}
function GuestRoute() {
    const { ready, isAuthenticated } = useAuth();
    if (!ready) {
        return _jsx(RouteSkeleton, { variant: "fullscreen" });
    }
    return isAuthenticated ? _jsx(Navigate, { to: "/dashboard", replace: true }) : _jsx(Outlet, {});
}
export default function AppRouter() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomeRedirect, {}) }), _jsx(Route, { element: _jsx(GuestRoute, {}), children: _jsx(Route, { path: "/login", element: renderLazyPage(LoginPage, 'fullscreen') }) }), _jsx(Route, { element: _jsx(PrivateRoute, {}), children: _jsxs(Route, { element: _jsx(AppLayout, {}), children: [_jsx(Route, { path: "/dashboard", element: renderLazyPage(DashboardPage) }), moduleOrder.map((key) => (_jsx(Route, { path: `/${moduleRouteMeta[key].path}`, element: renderLazyPage(moduleRoutePages[key]) }, key)))] }) }), _jsx(Route, { path: "*", element: _jsx(Suspense, { fallback: _jsx(RouteSkeleton, { variant: "fullscreen" }), children: _jsx(NotFoundPage, {}) }) })] }));
}
