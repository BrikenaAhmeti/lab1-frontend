import { jsx as _jsx } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import { commonCopy } from '../copy';
import EmptyState from '../components/EmptyState';
import { useLanguage } from '../contexts/LanguageContext';
export default function AccessDeniedPage() {
    const { t } = useLanguage();
    return (_jsx("div", { className: "space-y-6", children: _jsx(EmptyState, { tone: "locked", title: t(commonCopy.forbiddenTitle), description: t(commonCopy.accessDeniedDescription), action: _jsx(Link, { to: "/dashboard", children: _jsx(Button, { children: t(commonCopy.backToDashboard) }) }) }) }));
}
