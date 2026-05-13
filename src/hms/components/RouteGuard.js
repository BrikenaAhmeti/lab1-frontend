import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../permissions';
export default function RouteGuard({ module, action, children, }) {
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: location.pathname } });
    }
    if (!hasPermission({ userRoles: user?.roles, module, action })) {
        return _jsx(Navigate, { to: "/unauthorized", replace: true, state: { from: location.pathname } });
    }
    return _jsx(_Fragment, { children: children });
}
