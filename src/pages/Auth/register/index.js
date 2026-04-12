import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import Input from '@/ui/atoms/Input';
import Card from '@/ui/atoms/Card';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { register } from '@/domain/auth/auth.thunks';
const Register = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { loading, error, user, tokens } = useAppSelector((s) => s.auth);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    useEffect(() => {
        if (user && tokens?.accessToken) {
            navigate('/app', { replace: true });
        }
    }, [navigate, tokens?.accessToken, user]);
    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(register({
                firstName,
                lastName,
                email,
                password,
                phoneNumber: phoneNumber || undefined,
            })).unwrap();
            navigate('/app', { replace: true });
        }
        catch {
            return;
        }
    };
    return (_jsx("div", { className: "min-h-screen grid place-items-center p-4", children: _jsx(Card, { title: "Create account", description: "Register a new account and continue into the app.", className: "w-full max-w-md", children: _jsxs("form", { onSubmit: onSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [_jsx(Input, { label: "First name", value: firstName, onChange: (e) => setFirstName(e.target.value), autoComplete: "given-name", required: true }), _jsx(Input, { label: "Last name", value: lastName, onChange: (e) => setLastName(e.target.value), autoComplete: "family-name", required: true })] }), _jsx(Input, { type: "email", label: "Email", value: email, onChange: (e) => setEmail(e.target.value), autoComplete: "email", required: true }), _jsx(Input, { type: "password", label: "Password", value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "new-password", required: true }), _jsx(Input, { type: "tel", label: "Phone number (optional)", value: phoneNumber, onChange: (e) => setPhoneNumber(e.target.value), autoComplete: "tel" }), error ? _jsx("p", { className: "text-sm text-danger", children: error }) : null, _jsx(Button, { type: "submit", loading: loading, className: "w-full", disabled: !firstName || !lastName || !email || !password, children: "Register" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Already registered?", ' ', _jsx(Link, { to: "/login", className: "text-primary hover:underline", children: "Sign in" })] })] }) }) }));
};
export default Register;
