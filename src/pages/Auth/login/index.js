import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import Button from '@/ui/atoms/Button';
import { useAppDispatch } from '@/app/hooks';
import { setSession } from '@/domain/auth/authSlice';
import { api } from '@/libs/axios/client';
const Login = () => {
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('password');
    const [loading, setLoading] = useState(false);
    const dispatch = useAppDispatch();
    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.core.post('/auth/login', { email, password });
            dispatch(setSession(data)); // expects { user, tokens }
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen grid place-items-center", children: _jsxs("form", { onSubmit: onSubmit, className: "w-full max-w-sm bg-white dark:bg-gray-950 p-6 rounded-xl shadow", children: [_jsx("h1", { className: "text-xl font-semibold mb-4", children: "Login" }), _jsx("input", { className: "w-full mb-3 rounded border px-3 py-2 bg-transparent", value: email, onChange: e => setEmail(e.target.value) }), _jsx("input", { className: "w-full mb-4 rounded border px-3 py-2 bg-transparent", type: "password", value: password, onChange: e => setPassword(e.target.value) }), _jsx(Button, { type: "submit", loading: loading, children: "Sign in" })] }) }));
};
export default Login;
