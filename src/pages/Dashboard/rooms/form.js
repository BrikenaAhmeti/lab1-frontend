import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isAdminUser } from '@/domain/auth/role.utils';
import { useDepartments } from '@/domain/departments/departments.hooks';
import { useCreateRoom, useRoom, useUpdateRoom, } from '@/domain/rooms/rooms.hooks';
import { isKnownRoomStatus, isKnownRoomType, normalizeRoomStatus, normalizeRoomType, getRoomApiMessage, getRoomApiStatus, } from '@/domain/rooms/rooms.utils';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import RoomStateCard from './state-card';
const emptyForm = {
    roomNumber: '',
    departmentId: '',
    type: '',
    status: 'AVAILABLE',
    capacity: '',
};
function validateForm(values, t) {
    const errors = {};
    const capacity = Number(values.capacity);
    if (!values.roomNumber.trim())
        errors.roomNumber = t('validation.required');
    if (!values.departmentId.trim())
        errors.departmentId = t('validation.required');
    if (!values.type.trim())
        errors.type = t('validation.required');
    if (!values.capacity.trim()) {
        errors.capacity = t('validation.required');
    }
    else if (!Number.isFinite(capacity) || capacity <= 0) {
        errors.capacity = t('validation.capacity');
    }
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
export default function RoomFormPage() {
    const { t } = useTranslation('rooms');
    const navigate = useNavigate();
    const { id = '' } = useParams();
    const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
    const isAdmin = isAdminUser(roles);
    const isEdit = !!id;
    const roomQuery = useRoom(id);
    const departmentsQuery = useDepartments();
    const createRoom = useCreateRoom();
    const updateRoom = useUpdateRoom();
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const status = getRoomApiStatus(roomQuery.error);
    const saving = createRoom.isPending || updateRoom.isPending;
    useEffect(() => {
        if (!isEdit || !roomQuery.data) {
            return;
        }
        setForm({
            roomNumber: roomQuery.data.roomNumber,
            departmentId: roomQuery.data.departmentId,
            type: normalizeRoomType(roomQuery.data.type),
            status: normalizeRoomStatus(roomQuery.data.status),
            capacity: String(roomQuery.data.capacity ?? ''),
        });
    }, [isEdit, roomQuery.data]);
    const handleChange = (name, value) => {
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: '' }));
        setFormError('');
    };
    const getTypeLabel = (value) => {
        const normalized = normalizeRoomType(value);
        return isKnownRoomType(normalized) ? t(`types.${normalized}`) : value;
    };
    const getStatusLabel = (value) => {
        const normalized = normalizeRoomStatus(value);
        return isKnownRoomStatus(normalized) ? t(`statuses.${normalized}`) : value;
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = validateForm(form, t);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            return;
        }
        const payload = {
            roomNumber: form.roomNumber.trim(),
            departmentId: form.departmentId.trim(),
            type: normalizeRoomType(form.type),
            status: normalizeRoomStatus(form.status),
            capacity: Number(form.capacity),
        };
        try {
            if (isEdit) {
                await updateRoom.mutateAsync({ id, payload });
            }
            else {
                await createRoom.mutateAsync(payload);
            }
            navigate('/app/rooms', {
                replace: true,
                state: { success: isEdit ? t('messages.updated') : t('messages.created') },
            });
        }
        catch (error) {
            setFormError(getRoomApiMessage(error, t('errors.save')));
        }
    };
    if (!isAdmin) {
        return (_jsx(RoomStateCard, { title: t('states.manageForbiddenTitle'), description: t('states.manageForbiddenDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/rooms'), children: t('actions.back') }) }));
    }
    if (isEdit && roomQuery.isLoading) {
        return (_jsx(RoomStateCard, { title: t('states.loadingRoomTitle'), description: t('states.loadingRoomDescription') }));
    }
    if (isEdit && status === 401) {
        return (_jsx(RoomStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    if (isEdit && status === 403) {
        return (_jsx(RoomStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    if (isEdit && status === 404) {
        return (_jsx(RoomStateCard, { title: t('details.notFoundTitle'), description: t('details.notFoundDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/rooms'), children: t('actions.back') }) }));
    }
    if (isEdit && roomQuery.error) {
        return (_jsx(RoomStateCard, { title: t('states.errorTitle'), description: getRoomApiMessage(roomQuery.error, t('errors.details')), children: _jsx(Button, { variant: "outline", onClick: () => roomQuery.refetch(), children: t('actions.retry') }) }));
    }
    if (departmentsQuery.isLoading) {
        return (_jsx(RoomStateCard, { title: t('states.loadingOptionsTitle'), description: t('states.loadingOptionsDescription') }));
    }
    if (departmentsQuery.error) {
        return (_jsx(RoomStateCard, { title: t('states.errorTitle'), description: getRoomApiMessage(departmentsQuery.error, t('errors.departments')), children: _jsx(Button, { variant: "outline", onClick: () => departmentsQuery.refetch(), children: t('actions.retry') }) }));
    }
    const departmentOptions = (departmentsQuery.data ?? []).map((department) => ({
        value: department.id,
        label: getDepartmentLabel(department.name, department.location),
    }));
    const typeOptions = [
        { value: 'GENERAL', label: t('types.GENERAL') },
        { value: 'ICU', label: t('types.ICU') },
        { value: 'SURGERY', label: t('types.SURGERY') },
        { value: 'EMERGENCY', label: t('types.EMERGENCY') },
        { value: 'PEDIATRIC', label: t('types.PEDIATRIC') },
    ];
    const statusOptions = [
        { value: 'AVAILABLE', label: t('statuses.AVAILABLE') },
        { value: 'OCCUPIED', label: t('statuses.OCCUPIED') },
        { value: 'UNDER_MAINTENANCE', label: t('statuses.UNDER_MAINTENANCE') },
    ];
    const departmentSelectOptions = withFallbackOption(departmentOptions, form.departmentId, roomQuery.data?.department
        ? getDepartmentLabel(roomQuery.data.department.name, roomQuery.data.department.location)
        : form.departmentId);
    const typeSelectOptions = withFallbackOption(typeOptions, form.type, getTypeLabel(form.type));
    const statusSelectOptions = withFallbackOption(statusOptions, form.status, getStatusLabel(form.status));
    if (!isEdit && !departmentSelectOptions.length) {
        return (_jsx(RoomStateCard, { title: t('states.emptyDepartmentsTitle'), description: t('states.emptyDepartmentsDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/departments'), children: t('actions.viewDepartments') }) }));
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: isEdit ? t('form.editTitle') : t('form.createTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: isEdit ? t('form.editDescription') : t('form.createDescription') })] }), _jsx(Button, { variant: "outline", onClick: () => navigate('/app/rooms'), children: t('actions.cancel') })] }), _jsx(Card, { title: t('form.formTitle'), description: t('form.formDescription'), children: _jsxs("form", { className: "space-y-4", noValidate: true, onSubmit: handleSubmit, children: [formError ? (_jsx("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: formError })) : null, _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsx(Input, { required: true, name: "roomNumber", label: t('fields.roomNumber'), value: form.roomNumber, error: errors.roomNumber, onChange: (event) => handleChange('roomNumber', event.target.value) }), _jsxs(Select, { required: true, name: "departmentId", label: t('fields.department'), value: form.departmentId, error: errors.departmentId, onChange: (event) => handleChange('departmentId', event.target.value), children: [_jsx("option", { value: "", children: t('form.departmentPlaceholder') }), departmentSelectOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), _jsxs(Select, { required: true, name: "type", label: t('fields.type'), value: form.type, error: errors.type, onChange: (event) => handleChange('type', event.target.value), children: [_jsx("option", { value: "", children: t('form.typePlaceholder') }), typeSelectOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), _jsx(Select, { name: "status", label: t('fields.status'), value: form.status, onChange: (event) => handleChange('status', event.target.value), children: statusSelectOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) }), _jsx(Input, { required: true, min: 1, type: "number", inputMode: "numeric", name: "capacity", label: t('fields.capacity'), value: form.capacity, error: errors.capacity, onChange: (event) => handleChange('capacity', event.target.value) })] }), _jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => navigate('/app/rooms'), children: t('actions.back') }), _jsx(Button, { type: "submit", loading: saving, children: isEdit ? t('actions.update') : t('actions.save') })] })] }) })] }));
}
