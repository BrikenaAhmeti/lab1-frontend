import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { commonCopy } from '../copy';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
export default function PrivateRoute() {
    const location = useLocation();
    const { ready, isAuthenticated } = useAuth();
    const { t } = useLanguage();
    if (!ready) {
        return (_jsx("div", { className: "grid min-h-screen place-items-center px-4 text-sm text-muted-foreground", children: t(commonCopy.loadingSession) }));
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true, state: { from: location.pathname } });
    }
    return _jsx(Outlet, {});
}
