import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useDepartments } from '@/domain/departments/departments.hooks';
import { useCreateNurse, useNurse, useUpdateNurse } from '@/domain/nurses/nurses.hooks';
import { nurseShiftValues } from '@/domain/nurses/nurses.types';
import { getNurseApiMessage, getNurseApiStatus, isKnownNurseShift, normalizeNurseShift, } from '@/domain/nurses/nurses.utils';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import NurseStateCard from './state-card';
const emptyForm = {
    firstName: '',
    lastName: '',
    departmentId: '',
    shift: '',
};
function validateForm(values, t) {
    const errors = {};
    if (!values.firstName.trim())
        errors.firstName = t('validation.required');
    if (!values.lastName.trim())
        errors.lastName = t('validation.required');
    if (!values.departmentId.trim())
        errors.departmentId = t('validation.required');
    if (!values.shift.trim())
        errors.shift = t('validation.required');
    return errors;
}
function getDepartmentLabel(name, location) {
    return location.trim() ? `${name} (${location})` : name;
}
function withFallbackOption(options, value, label) {
    if (!value || options.some((option) => option.value === value)) {
        return options;
    }
    return [{ value, label }, ...options];
}
export default function NurseFormPage() {
    const { t } = useTranslation('nurses');
    const navigate = useNavigate();
    const { id = '' } = useParams();
    const isEdit = !!id;
    const nurseQuery = useNurse(id);
    const departmentsQuery = useDepartments();
    const createNurse = useCreateNurse();
    const updateNurse = useUpdateNurse();
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const status = getNurseApiStatus(nurseQuery.error);
    const saving = createNurse.isPending || updateNurse.isPending;
    useEffect(() => {
        if (!isEdit || !nurseQuery.data) {
            return;
        }
        setForm({
            firstName: nurseQuery.data.firstName,
            lastName: nurseQuery.data.lastName,
            departmentId: nurseQuery.data.departmentId,
            shift: normalizeNurseShift(nurseQuery.data.shift),
        });
    }, [isEdit, nurseQuery.data]);
    const handleChange = (name, value) => {
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: '' }));
        setFormError('');
    };
    const getShiftLabel = (value) => {
        const normalized = normalizeNurseShift(value);
        if (isKnownNurseShift(normalized)) {
            return t(`shifts.${normalized}`);
        }
        return value;
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = validateForm(form, t);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            return;
        }
        const payload = {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            departmentId: form.departmentId.trim(),
            shift: normalizeNurseShift(form.shift),
        };
        try {
            const nurse = isEdit
                ? await updateNurse.mutateAsync({ id, payload })
                : await createNurse.mutateAsync(payload);
            navigate(`/app/nurses/${nurse.id}`, {
                replace: true,
                state: { success: isEdit ? t('messages.updated') : t('messages.created') },
            });
        }
        catch (error) {
            setFormError(getNurseApiMessage(error, t('errors.save')));
        }
    };
    if (isEdit && nurseQuery.isLoading) {
        return (_jsx(NurseStateCard, { title: t('states.loadingNurseTitle'), description: t('states.loadingNurseDescription') }));
    }
    if (isEdit && status === 401) {
        return (_jsx(NurseStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    if (isEdit && status === 403) {
        return (_jsx(NurseStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    if (isEdit && status === 404) {
        return (_jsx(NurseStateCard, { title: t('details.notFoundTitle'), description: t('details.notFoundDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/nurses'), children: t('actions.back') }) }));
    }
    if (isEdit && nurseQuery.error) {
        return (_jsx(NurseStateCard, { title: t('states.errorTitle'), description: getNurseApiMessage(nurseQuery.error, t('errors.details')), children: _jsx(Button, { variant: "outline", onClick: () => nurseQuery.refetch(), children: t('actions.retry') }) }));
    }
    if (departmentsQuery.isLoading) {
        return (_jsx(NurseStateCard, { title: t('states.loadingOptionsTitle'), description: t('states.loadingOptionsDescription') }));
    }
    if (departmentsQuery.error) {
        return (_jsx(NurseStateCard, { title: t('states.errorTitle'), description: getNurseApiMessage(departmentsQuery.error, t('errors.departments')), children: _jsx(Button, { variant: "outline", onClick: () => departmentsQuery.refetch(), children: t('actions.retry') }) }));
    }
    const departmentOptions = (departmentsQuery.data ?? []).map((department) => ({
        value: department.id,
        label: getDepartmentLabel(department.name, department.location),
    }));
    const shiftOptions = nurseShiftValues.map((value) => ({
        value,
        label: t(`shifts.${value}`),
    }));
    const departmentSelectOptions = withFallbackOption(departmentOptions, form.departmentId, nurseQuery.data?.department
        ? getDepartmentLabel(nurseQuery.data.department.name, nurseQuery.data.department.location)
        : form.departmentId);
    const shiftSelectOptions = withFallbackOption(shiftOptions, form.shift, getShiftLabel(form.shift));
    if (!isEdit && !departmentSelectOptions.length) {
        return (_jsx(NurseStateCard, { title: t('states.emptyDepartmentsTitle'), description: t('states.emptyDepartmentsDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/departments'), children: t('actions.viewDepartments') }) }));
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: isEdit ? t('form.editTitle') : t('form.createTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: isEdit ? t('form.editDescription') : t('form.createDescription') })] }), _jsx(Button, { variant: "outline", onClick: () => navigate(isEdit ? `/app/nurses/${id}` : '/app/nurses'), children: t('actions.cancel') })] }), _jsx(Card, { title: t('form.formTitle'), description: t('form.formDescription'), children: _jsxs("form", { className: "space-y-4", noValidate: true, onSubmit: handleSubmit, children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsx(Input, { required: true, name: "firstName", label: t('fields.firstName'), value: form.firstName, error: errors.firstName, onChange: (event) => handleChange('firstName', event.target.value) }), _jsx(Input, { required: true, name: "lastName", label: t('fields.lastName'), value: form.lastName, error: errors.lastName, onChange: (event) => handleChange('lastName', event.target.value) }), _jsxs(Select, { required: true, name: "departmentId", label: t('fields.department'), value: form.departmentId, error: errors.departmentId, onChange: (event) => handleChange('departmentId', event.target.value), children: [_jsx("option", { value: "", children: t('form.departmentPlaceholder') }), departmentSelectOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), _jsxs(Select, { required: true, name: "shift", label: t('fields.shift'), value: form.shift, error: errors.shift, onChange: (event) => handleChange('shift', event.target.value), children: [_jsx("option", { value: "", children: t('form.shiftPlaceholder') }), shiftSelectOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] })] }), formError ? (_jsx("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: formError })) : null, _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { type: "submit", loading: saving, children: isEdit ? t('actions.update') : t('actions.save') }), _jsx(Button, { type: "button", variant: "outline", onClick: () => navigate(isEdit ? `/app/nurses/${id}` : '/app/nurses'), children: t('actions.cancel') })] })] }) })] }));
}
