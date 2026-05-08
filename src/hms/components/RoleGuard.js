import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useAuth } from '../contexts/AuthContext';
export default function RoleGuard({ allow, children, }) {
    const { can } = useAuth();
    if (!can(allow)) {
        return null;
    }
    return _jsx(_Fragment, { children: children });
}
