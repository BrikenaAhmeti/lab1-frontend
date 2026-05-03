import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isAdminUser } from '@/domain/auth/role.utils';
import { useDepartments } from '@/domain/departments/departments.hooks';
import { useCreateDoctor, useDoctor, useUpdateDoctor } from '@/domain/doctors/doctors.hooks';
import { doctorPhonePattern, getDoctorApiMessage, getDoctorApiStatus } from '@/domain/doctors/doctors.utils';
import { useUsers } from '@/hooks/useUsers';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import DoctorStateCard from './state-card';
const emptyForm = {
    userId: '',
    firstName: '',
    lastName: '',
    specialization: '',
    departmentId: '',
    phoneNumber: '',
};
function validateForm(values, t) {
    const errors = {};
    const phoneNumber = values.phoneNumber.trim();
    if (!values.userId.trim())
        errors.userId = t('validation.required');
    if (!values.firstName.trim())
        errors.firstName = t('validation.required');
    if (!values.lastName.trim())
        errors.lastName = t('validation.required');
    if (!values.specialization.trim())
        errors.specialization = t('validation.required');
    if (!values.departmentId.trim())
        errors.departmentId = t('validation.required');
    if (!phoneNumber)
        errors.phoneNumber = t('validation.required');
    if (phoneNumber && !doctorPhonePattern.test(phoneNumber)) {
        errors.phoneNumber = t('validation.phoneNumber');
    }
    return errors;
}
function getUserLabel(user) {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    if (fullName && user.email) {
        return `${fullName} (${user.email})`;
    }
    return fullName || user.email || user.id;
}
function getDepartmentLabel(department) {
    return department.location?.trim()
        ? `${department.name} (${department.location})`
        : department.name;
}
function withFallbackOption(options, value, label) {
    if (!value || options.some((option) => option.value === value)) {
        return options;
    }
    return [{ value, label }, ...options];
}
export default function DoctorFormPage() {
    const { t } = useTranslation('doctors');
    const navigate = useNavigate();
    const { id = '' } = useParams();
    const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
    const isAdmin = isAdminUser(roles);
    const isEdit = !!id;
    const doctorQuery = useDoctor(id);
    const departmentsQuery = useDepartments();
    const usersQuery = useUsers({ enabled: isAdmin });
    const createDoctor = useCreateDoctor();
    const updateDoctor = useUpdateDoctor();
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const status = getDoctorApiStatus(doctorQuery.error);
    const saving = createDoctor.isPending || updateDoctor.isPending;
    useEffect(() => {
        if (!isEdit || !doctorQuery.data) {
            return;
        }
        setForm({
            userId: doctorQuery.data.userId,
            firstName: doctorQuery.data.firstName,
            lastName: doctorQuery.data.lastName,
            specialization: doctorQuery.data.specialization,
            departmentId: doctorQuery.data.departmentId,
            phoneNumber: doctorQuery.data.phoneNumber,
        });
    }, [doctorQuery.data, isEdit]);
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
            userId: form.userId.trim(),
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            specialization: form.specialization.trim(),
            departmentId: form.departmentId.trim(),
            phoneNumber: form.phoneNumber.trim(),
        };
        try {
            const doctor = isEdit
                ? await updateDoctor.mutateAsync({ id, payload })
                : await createDoctor.mutateAsync(payload);
            navigate(`/app/doctors/${doctor.id}`, {
                replace: true,
                state: { success: isEdit ? t('messages.updated') : t('messages.created') },
            });
        }
        catch (error) {
            setFormError(getDoctorApiMessage(error, t('errors.save')));
        }
    };
    if (isEdit && doctorQuery.isLoading) {
        return (_jsx(DoctorStateCard, { title: t('states.loadingDoctorTitle'), description: t('states.loadingDoctorDescription') }));
    }
    if (isEdit && status === 401) {
        return (_jsx(DoctorStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    if (isEdit && status === 403) {
        return (_jsx(DoctorStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    if (isEdit && status === 404) {
        return (_jsx(DoctorStateCard, { title: t('details.notFoundTitle'), description: t('details.notFoundDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/doctors'), children: t('actions.back') }) }));
    }
    if (isEdit && doctorQuery.error) {
        return (_jsx(DoctorStateCard, { title: t('states.errorTitle'), description: getDoctorApiMessage(doctorQuery.error, t('errors.details')), children: _jsx(Button, { variant: "outline", onClick: () => doctorQuery.refetch(), children: t('actions.retry') }) }));
    }
    if (!isEdit && !isAdmin) {
        return (_jsx(DoctorStateCard, { title: t('states.createForbiddenTitle'), description: t('states.createForbiddenDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/doctors'), children: t('actions.back') }) }));
    }
    if (departmentsQuery.isLoading || (isAdmin && usersQuery.isLoading)) {
        return (_jsx(DoctorStateCard, { title: t('states.loadingOptionsTitle'), description: t('states.loadingOptionsDescription') }));
    }
    if (departmentsQuery.error) {
        return (_jsx(DoctorStateCard, { title: t('states.errorTitle'), description: getDoctorApiMessage(departmentsQuery.error, t('errors.departments')), children: _jsx(Button, { variant: "outline", onClick: () => departmentsQuery.refetch(), children: t('actions.retry') }) }));
    }
    if (!isEdit && isAdmin && usersQuery.error) {
        return (_jsx(DoctorStateCard, { title: t('states.errorTitle'), description: getDoctorApiMessage(usersQuery.error, t('errors.users')), children: _jsx(Button, { variant: "outline", onClick: () => usersQuery.refetch(), children: t('actions.retry') }) }));
    }
    const departmentOptions = (departmentsQuery.data ?? []).map((department) => ({
        value: department.id,
        label: getDepartmentLabel(department),
    }));
    const userOptions = (usersQuery.data ?? []).map((user) => ({
        value: user.id,
        label: getUserLabel(user),
    }));
    const selectedDepartmentLabel = doctorQuery.data?.department
        ? getDepartmentLabel(doctorQuery.data.department)
        : form.departmentId;
    const selectedUserLabel = form.userId;
    const departmentSelectOptions = withFallbackOption(departmentOptions, form.departmentId, selectedDepartmentLabel);
    const userSelectOptions = withFallbackOption(userOptions, form.userId, selectedUserLabel);
    const canChooseUser = isAdmin && !usersQuery.error;
    if (!isEdit && !departmentSelectOptions.length) {
        return (_jsx(DoctorStateCard, { title: t('states.emptyDepartmentsTitle'), description: t('states.emptyDepartmentsDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/departments'), children: t('actions.viewDepartments') }) }));
    }
    if (!isEdit && isAdmin && !userSelectOptions.length) {
        return (_jsx(DoctorStateCard, { title: t('states.emptyUsersTitle'), description: t('states.emptyUsersDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/doctors'), children: t('actions.back') }) }));
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: isEdit ? t('form.editTitle') : t('form.createTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: isEdit ? t('form.editDescription') : t('form.createDescription') })] }), _jsx(Button, { variant: "outline", onClick: () => navigate(isEdit ? `/app/doctors/${id}` : '/app/doctors'), children: t('actions.cancel') })] }), _jsx(Card, { title: t('form.formTitle'), description: t('form.formDescription'), children: _jsxs("form", { className: "space-y-4", noValidate: true, onSubmit: handleSubmit, children: [formError ? (_jsx("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: formError })) : null, _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [canChooseUser ? (_jsxs(Select, { required: true, name: "userId", label: t('fields.userId'), value: form.userId, error: errors.userId, onChange: (event) => handleChange('userId', event.target.value), children: [_jsx("option", { value: "", children: t('form.userPlaceholder') }), userSelectOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] })) : (_jsx(Input, { required: true, disabled: true, readOnly: true, name: "userId", label: t('fields.userId'), value: form.userId, hint: t('form.userReadOnlyHint') })), _jsxs(Select, { required: true, name: "departmentId", label: t('fields.department'), value: form.departmentId, error: errors.departmentId, onChange: (event) => handleChange('departmentId', event.target.value), children: [_jsx("option", { value: "", children: t('form.departmentPlaceholder') }), departmentSelectOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), _jsx(Input, { required: true, name: "firstName", label: t('fields.firstName'), value: form.firstName, error: errors.firstName, onChange: (event) => handleChange('firstName', event.target.value) }), _jsx(Input, { required: true, name: "lastName", label: t('fields.lastName'), value: form.lastName, error: errors.lastName, onChange: (event) => handleChange('lastName', event.target.value) }), _jsx(Input, { required: true, name: "specialization", label: t('fields.specialization'), value: form.specialization, error: errors.specialization, onChange: (event) => handleChange('specialization', event.target.value) }), _jsx(Input, { required: true, type: "tel", name: "phoneNumber", label: t('fields.phoneNumber'), value: form.phoneNumber, error: errors.phoneNumber, placeholder: "+38344111222", onChange: (event) => handleChange('phoneNumber', event.target.value) })] }), _jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => navigate(isEdit ? `/app/doctors/${id}` : '/app/doctors'), children: t('actions.back') }), _jsx(Button, { type: "submit", loading: saving, children: isEdit ? t('actions.update') : t('actions.save') })] })] }) })] }));
}
