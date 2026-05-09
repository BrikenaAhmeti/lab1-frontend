import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Button from '@/ui/atoms/Button';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import Textarea from '@/ui/atoms/Textarea';
import { commonCopy } from '../copy';
import { useLanguage } from '../contexts/LanguageContext';
import { getErrorMessage, getFieldInputValue } from '../lib/utils';
import EmptyState from './EmptyState';
import ListSkeleton from './ListSkeleton';
import Modal from './Modal';
function getDefaultValues(config, item) {
    const defaults = { ...(config.createDefaults || {}) };
    config.fields.forEach((field) => {
        defaults[field.name] = item ? getFieldInputValue(item, field) : defaults[field.name] ?? '';
    });
    return defaults;
}
export default function EntityFormModal({ open, mode, config, item, references, loading, error, saving, onClose, onRetry, onSubmit, }) {
    const { t } = useLanguage();
    const form = useForm({
        resolver: zodResolver(config.schema),
        defaultValues: getDefaultValues(config, item),
    });
    useEffect(() => {
        form.reset(getDefaultValues(config, item));
    }, [config, form, item, open]);
    const title = mode === 'create' ? t(commonCopy.createRecord) : t(commonCopy.editRecord);
    const description = t(config.singular);
    return (_jsx(Modal, { open: open, title: `${title}: ${description}`, onClose: onClose, children: loading ? (_jsx(ListSkeleton, { items: 4, itemClassName: "h-14" })) : error ? (_jsx(EmptyState, { compact: true, tone: "error", title: t(commonCopy.errorTitle), description: getErrorMessage(error, t), action: onRetry ? (_jsx(Button, { variant: "outline", onClick: onRetry, children: t(commonCopy.retry) })) : null })) : (_jsxs("form", { className: "space-y-4", onSubmit: form.handleSubmit(async (values) => onSubmit(values)), children: [_jsx("div", { className: "grid gap-4 md:grid-cols-2", children: config.fields.map((field) => {
                        const error = String(form.formState.errors[field.name]?.message || '');
                        const options = field.source
                            ? references[field.source] || []
                            : (field.options || []).map((option) => ({
                                value: option.value,
                                label: t(option.label),
                            }));
                        if (field.type === 'textarea') {
                            return (_jsx("div", { className: "md:col-span-2", children: _jsx(Textarea, { label: t(field.label), error: error, placeholder: field.placeholder ? t(field.placeholder) : '', ...form.register(field.name) }) }, field.name));
                        }
                        if (field.type === 'select') {
                            return (_jsxs(Select, { label: t(field.label), error: error, ...form.register(field.name), children: [_jsx("option", { value: "", children: t(commonCopy.search) }), options.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }, field.name));
                        }
                        return (_jsx(Input, { type: field.type, step: field.step, label: t(field.label), error: error, placeholder: field.placeholder ? t(field.placeholder) : '', ...form.register(field.name) }, field.name));
                    }) }), _jsxs("div", { className: "flex flex-wrap justify-end gap-3", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: t(commonCopy.cancel) }), _jsx(Button, { type: "submit", loading: saving, children: mode === 'create' ? t(commonCopy.create) : t(commonCopy.update) })] })] })) }));
}
