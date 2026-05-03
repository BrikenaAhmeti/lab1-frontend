import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateDepartment, useDepartment, useUpdateDepartment, } from '@/domain/departments/departments.hooks';
import { getDepartmentApiMessage, getDepartmentApiStatus, } from '@/domain/departments/departments.utils';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Textarea from '@/ui/atoms/Textarea';
import DepartmentStateCard from './state-card';
const emptyForm = {
    name: '',
    location: '',
    description: '',
};
function validateForm(values, t) {
    const errors = {};
    if (!values.name.trim())
        errors.name = t('validation.required');
    if (!values.location.trim())
        errors.location = t('validation.required');
    return errors;
}
export default function DepartmentFormPage() {
    const { t } = useTranslation('departments');
    const navigate = useNavigate();
    const { id = '' } = useParams();
    const isEdit = !!id;
    const departmentQuery = useDepartment(id);
    const createDepartment = useCreateDepartment();
    const updateDepartment = useUpdateDepartment();
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const status = getDepartmentApiStatus(departmentQuery.error);
    const saving = createDepartment.isPending || updateDepartment.isPending;
    useEffect(() => {
        if (!isEdit || !departmentQuery.data) {
            return;
        }
        setForm({
            name: departmentQuery.data.name,
            location: departmentQuery.data.location,
            description: departmentQuery.data.description ?? '',
        });
    }, [departmentQuery.data, isEdit]);
    const handleChange = (name, value) => {
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: '' }));
        setFormError('');
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = validateForm(form, t);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            return;
        }
        const payload = {
            name: form.name.trim(),
            location: form.location.trim(),
            description: form.description.trim() || undefined,
        };
        try {
            if (isEdit) {
                await updateDepartment.mutateAsync({ id, payload });
            }
            else {
                await createDepartment.mutateAsync(payload);
            }
            navigate('/app/departments', {
                replace: true,
                state: { success: isEdit ? t('messages.updated') : t('messages.created') },
            });
        }
        catch (error) {
            setFormError(getDepartmentApiMessage(error, t('errors.save')));
        }
    };
    if (isEdit && departmentQuery.isLoading) {
        return (_jsx(DepartmentStateCard, { title: t('states.loadingDepartmentTitle'), description: t('states.loadingDepartmentDescription') }));
    }
    if (isEdit && status === 401) {
        return (_jsx(DepartmentStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    if (isEdit && status === 403) {
        return (_jsx(DepartmentStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    if (isEdit && status === 404) {
        return (_jsx(DepartmentStateCard, { title: t('details.notFoundTitle'), description: t('details.notFoundDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/departments'), children: t('actions.back') }) }));
    }
    if (isEdit && departmentQuery.error) {
        return (_jsx(DepartmentStateCard, { title: t('states.errorTitle'), description: getDepartmentApiMessage(departmentQuery.error, t('errors.details')), children: _jsx(Button, { variant: "outline", onClick: () => departmentQuery.refetch(), children: t('actions.retry') }) }));
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: isEdit ? t('form.editTitle') : t('form.createTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: isEdit ? t('form.editDescription') : t('form.createDescription') })] }), _jsx(Button, { variant: "outline", onClick: () => navigate(isEdit ? `/app/departments/${id}` : '/app/departments'), children: t('actions.cancel') })] }), _jsx(Card, { title: t('form.formTitle'), description: t('form.formDescription'), children: _jsxs("form", { className: "space-y-4", noValidate: true, onSubmit: handleSubmit, children: [formError ? (_jsx("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: formError })) : null, _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsx(Input, { required: true, name: "name", label: t('fields.name'), value: form.name, error: errors.name, onChange: (event) => handleChange('name', event.target.value) }), _jsx(Input, { required: true, name: "location", label: t('fields.location'), value: form.location, error: errors.location, onChange: (event) => handleChange('location', event.target.value) }), _jsx("div", { className: "md:col-span-2", children: _jsx(Textarea, { rows: 5, name: "description", label: t('fields.description'), value: form.description, placeholder: t('form.descriptionPlaceholder'), onChange: (event) => handleChange('description', event.target.value) }) })] }), _jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => navigate('/app/departments'), children: t('actions.back') }), _jsx(Button, { type: "submit", loading: saving, children: isEdit ? t('actions.update') : t('actions.save') })] })] }) })] }));
}
