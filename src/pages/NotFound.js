import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
const NotFound = () => {
    return (_jsx("main", { className: "grid min-h-screen place-items-center p-4", children: _jsx(Card, { title: "Page Not Found", description: "The page you are looking for does not exist or may have been moved.", className: "w-full max-w-lg", children: _jsxs("div", { className: "mt-2 flex flex-wrap gap-2", children: [_jsx(Link, { to: "/app", children: _jsx(Button, { children: "Go to Dashboard" }) }), _jsx(Link, { to: "/login", children: _jsx(Button, { variant: "outline", children: "Go to Login" }) })] }) }) }));
};
export default NotFound;
