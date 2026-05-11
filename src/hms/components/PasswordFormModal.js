import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/ui/atoms/Button';
import Input from '@/ui/atoms/Input';
import { commonCopy } from '../copy';
import { useLanguage } from '../contexts/LanguageContext';
import Modal from './Modal';
function buildSchema(t, mode) {
    const requiredMessage = 'This field is required.';
    const passwordField = z
        .string()
        .min(6, t(commonCopy.passwordMinLength))
        .max(255, t(commonCopy.passwordMaxLength));
    return z
        .object({
        currentPassword: mode === 'change' ? z.string().min(1, requiredMessage) : z.string().optional(),
        password: passwordField,
        confirmPassword: z.string().min(1, requiredMessage),
    })
        .superRefine((values, context) => {
        if (values.password !== values.confirmPassword) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['confirmPassword'],
                message: t(commonCopy.passwordMismatch),
            });
        }
    });
}
export default function PasswordFormModal({ open, mode, title, description, saving = false, onClose, onSubmit, }) {
    const { t } = useLanguage();
    const form = useForm({
        resolver: zodResolver(buildSchema(t, mode)),
        defaultValues: {
            currentPassword: '',
            password: '',
            confirmPassword: '',
        },
    });
    useEffect(() => {
        if (open) {
            form.reset({
                currentPassword: '',
                password: '',
                confirmPassword: '',
            });
        }
    }, [form, open]);
    return (_jsx(Modal, { open: open, title: title, description: description, onClose: onClose, children: _jsxs("form", { className: "space-y-4", onSubmit: form.handleSubmit(async (values) => {
                await onSubmit({
                    currentPassword: values.currentPassword,
                    password: values.password,
                });
            }), children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [mode === 'change' ? (_jsx("div", { className: "md:col-span-2", children: _jsx(Input, { type: "password", autoComplete: "current-password", label: t(commonCopy.currentPassword), error: String(form.formState.errors.currentPassword?.message || ''), ...form.register('currentPassword') }) })) : null, _jsx(Input, { type: "password", autoComplete: mode === 'change' ? 'new-password' : 'off', label: t(mode === 'change' ? commonCopy.newPassword : commonCopy.password), hint: t(commonCopy.passwordMinLength), error: String(form.formState.errors.password?.message || ''), ...form.register('password') }), _jsx(Input, { type: "password", autoComplete: mode === 'change' ? 'new-password' : 'off', label: t(commonCopy.confirmPassword), error: String(form.formState.errors.confirmPassword?.message || ''), ...form.register('confirmPassword') })] }), _jsxs("div", { className: "flex flex-wrap justify-end gap-3", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: t(commonCopy.cancel) }), _jsx(Button, { type: "submit", loading: saving, children: t(mode === 'change' ? commonCopy.changePassword : commonCopy.resetPassword) })] })] }) }));
}
