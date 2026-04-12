import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import Input from '@/ui/atoms/Input';
import Card from '@/ui/atoms/Card';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { login } from '@/domain/auth/auth.thunks';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { loading, error, user, tokens } = useAppSelector((s) => s.auth);
    const destination = (location.state?.from?.pathname ?? '/app');
    useEffect(() => {
        if (user && tokens?.accessToken) {
            navigate('/app', { replace: true });
        }
    }, [navigate, tokens?.accessToken, user]);
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(login({ email, password })).unwrap();
            navigate(destination, { replace: true });
        }
        catch {
            return;
        }
    };
    return (_jsx("div", { className: "min-h-screen grid place-items-center p-4", children: _jsx(Card, { title: "Sign in", description: "Use your account credentials to access the dashboard.", className: "w-full max-w-md", children: _jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsx(Input, { type: "email", label: "Email", value: email, onChange: (e) => setEmail(e.target.value), autoComplete: "email", required: true }), _jsx(Input, { type: "password", label: "Password", value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "current-password", required: true }), error ? _jsx("p", { className: "text-sm text-danger", children: error }) : null, _jsx(Button, { type: "submit", loading: loading, className: "w-full", disabled: !email || !password, children: "Sign in" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["No account yet?", ' ', _jsx(Link, { to: "/register", className: "text-primary hover:underline", children: "Create one" })] })] }) }) }));
};
export default Login;
