import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import RouteSkeleton from './RouteSkeleton';
import { useAuth } from '../contexts/AuthContext';
export default function PrivateRoute() {
    const location = useLocation();
    const { ready, isAuthenticated } = useAuth();
    if (!ready) {
        return _jsx(RouteSkeleton, { variant: "fullscreen" });
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: location.pathname } });
    }
    return _jsx(Outlet, {});
}
