import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import LanguageSwitch from '@/ui/molecules/LanguageSwitch';
import ThemeToggle from '@/ui/molecules/ThemeToggle';
import { commonCopy } from '../copy';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
const schema = z.object({
    identifier: z.string().trim().min(1, 'Please enter your email or username.'),
    password: z.string().trim().min(1, 'Please enter your password.'),
});
export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { ready, isAuthenticated, login, errorMessage } = useAuth();
    const { t } = useLanguage();
    const { showToast } = useToast();
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            identifier: '',
            password: '',
        },
    });
    const redirectTo = location.state?.from || '/dashboard';
    if (ready && isAuthenticated) {
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    }
    return (_jsx("main", { className: "min-h-screen px-4 py-8", children: _jsxs("div", { className: "mx-auto flex max-w-6xl flex-col gap-6 md:pt-8", children: [_jsxs("div", { className: "flex justify-end gap-3", children: [_jsx(ThemeToggle, { compact: true }), _jsx(LanguageSwitch, { compact: true })] }), _jsxs("div", { className: "grid gap-6 lg:grid-cols-[1.1fr_0.9fr]", children: [_jsxs("section", { className: "ds-shell flex min-h-[280px] flex-col justify-between overflow-hidden p-8", children: [_jsx("div", { className: "inline-flex w-fit rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary", children: "HMS" }), _jsxs("div", { className: "py-8", children: [_jsx("h1", { className: "max-w-xl text-4xl font-bold tracking-tight text-foreground md:text-5xl", children: t(commonCopy.appName) }), _jsx("p", { className: "mt-4 max-w-xl text-base text-muted-foreground md:text-lg", children: t(commonCopy.appSubtitle) })] }), _jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [_jsxs("div", { className: "rounded-2xl border border-border bg-background/65 p-4", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground", children: t(commonCopy.todayAppointments) }), _jsx("p", { className: "mt-2 text-2xl font-bold text-foreground", children: "Live" })] }), _jsxs("div", { className: "rounded-2xl border border-border bg-background/65 p-4", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground", children: t(commonCopy.availableRooms) }), _jsx("p", { className: "mt-2 text-2xl font-bold text-foreground", children: "Rooms" })] }), _jsxs("div", { className: "rounded-2xl border border-border bg-background/65 p-4", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground", children: t(commonCopy.activeAdmissions) }), _jsx("p", { className: "mt-2 text-2xl font-bold text-foreground", children: "Care" })] })] })] }), _jsx(Card, { title: t(commonCopy.loginTitle), description: t(commonCopy.loginDescription), children: _jsxs("form", { className: "space-y-4", onSubmit: form.handleSubmit(async (values) => {
                                    try {
                                        await login(values);
                                        showToast(t(commonCopy.loginSuccess), 'success');
                                        navigate(redirectTo, { replace: true });
                                    }
                                    catch (error) {
                                        showToast(errorMessage(error, t), 'error');
                                    }
                                }), children: [_jsx(Input, { label: t(commonCopy.identifier), error: String(form.formState.errors.identifier?.message || ''), ...form.register('identifier') }), _jsx(Input, { type: "password", label: t(commonCopy.password), error: String(form.formState.errors.password?.message || ''), ...form.register('password') }), _jsx(Button, { type: "submit", className: "w-full", loading: form.formState.isSubmitting, children: t(commonCopy.signIn) })] }) })] })] }) }));
}
