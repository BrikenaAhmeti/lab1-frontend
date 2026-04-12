import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
const getStoredRoles = () => {
    const role = localStorage.getItem('role');
    return role ? [role] : [];
};
const normalizeRole = (role) => role.trim().toUpperCase();
export function GuestOnly() {
    const { user, tokens, initialized } = useAppSelector((s) => s.auth);
    if (!initialized)
        return null;
    const isAuthed = !!(user && tokens?.accessToken);
    return isAuthed ? _jsx(Navigate, { to: "/app", replace: true }) : _jsx(Outlet, {});
}
export function RequireAuth() {
    const { user, tokens, initialized } = useAppSelector((s) => s.auth);
    const location = useLocation();
    if (!initialized)
        return null;
    const isAuthed = !!(user && tokens?.accessToken);
    return isAuthed ? _jsx(Outlet, {}) : _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
}
export function RequireRole({ allow }) {
    const { user, initialized } = useAppSelector((s) => s.auth);
    if (!initialized)
        return null;
    const allowedRoles = allow.map(normalizeRole);
    const userRoles = [...(user?.roles ?? []), ...getStoredRoles()].map(normalizeRole);
    const hasRole = userRoles.some((role) => allowedRoles.includes(role));
    if (!userRoles.length)
        return _jsx(Navigate, { to: "/login", replace: true });
    return hasRole ? _jsx(Outlet, {}) : _jsx(Navigate, { to: "/403", replace: true });
}
export function RequireFinishedGetStarted() {
    const { finishedGetStarted, initialized } = useAppSelector((s) => s.auth);
    if (!initialized)
        return null;
    return finishedGetStarted ? _jsx(Outlet, {}) : _jsx(Navigate, { to: "/choose", replace: true });
}
