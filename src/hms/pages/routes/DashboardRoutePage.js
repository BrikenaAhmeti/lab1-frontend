import { jsx as _jsx } from "react/jsx-runtime";
import RouteGuard from '../../components/RouteGuard';
import DashboardPage from '../DashboardPage';
export default function DashboardRoutePage() {
    return (_jsx(RouteGuard, { module: "dashboard", action: "VIEW", children: _jsx(DashboardPage, {}) }));
}
