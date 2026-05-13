import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useAuth } from '../contexts/AuthContext';
import { hasPermission } from '../permissions';
export default function PermissionGuard({ module, action, fallback = null, children, }) {
    const { user } = useAuth();
    if (!hasPermission({ userRoles: user?.roles, module, action })) {
        return _jsx(_Fragment, { children: fallback });
    }
    return _jsx(_Fragment, { children: children });
}
