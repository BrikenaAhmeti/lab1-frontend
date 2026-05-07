import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdmissions, useCreateAdmission, useDischargeAdmission, } from '@/domain/admissions/admissions.hooks';
import { admissionDatePattern, formatAdmissionDate, getAdmissionApiMessage, getAdmissionApiStatus, getAdmissionDateValue, getAdmissionPatientName, getAdmissionRoomLabel, getAdmissionStatusVariant, isKnownAdmissionStatus, normalizeAdmissionStatus, } from '@/domain/admissions/admissions.utils';
import { getPatientApiStatus } from '@/domain/patients/patients.utils';
import { usePatients } from '@/domain/patients/patients.hooks';
import { getRoomApiMessage, getRoomApiStatus, normalizeRoomStatus, } from '@/domain/rooms/rooms.utils';
import { useRooms } from '@/domain/rooms/rooms.hooks';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import AdmissionStateCard from './state-card';
const emptyForm = {
    patientId: '',
    roomId: '',
    admissionDate: '',
};
function validateForm(values, t) {
    const errors = {};
    if (!values.patientId.trim())
        errors.patientId = t('validation.required');
    if (!values.roomId.trim())
        errors.roomId = t('validation.required');
    if (values.admissionDate && !admissionDatePattern.test(values.admissionDate)) {
        errors.admissionDate = t('validation.date');
    }
    return errors;
}
function getDepartmentLabel(name, location) {
    return location.trim() ? `${name} (${location})` : name;
}
export default function AdmissionsPage() {
    const { t, i18n } = useTranslation('admissions');
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const status = normalizeAdmissionStatus(searchParams.get('status'));
    const [patientSearch, setPatientSearch] = useState('');
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');
    const admissionsQuery = useAdmissions({ status });
    const patientsQuery = usePatients({ page: 1, limit: 50, search: patientSearch });
    const roomsQuery = useRooms();
    const createAdmission = useCreateAdmission();
    const dischargeAdmission = useDischargeAdmission();
    const admissionsStatus = getAdmissionApiStatus(admissionsQuery.error);
    const patientsStatus = getPatientApiStatus(patientsQuery.error);
    const roomsStatus = getRoomApiStatus(roomsQuery.error);
    const saving = createAdmission.isPending;
    const statuses = [admissionsStatus, patientsStatus, roomsStatus];
    const hasStatusFilter = !!status;
    useEffect(() => {
        if (!form.roomId || !roomsQuery.data?.some((room) => room.id === form.roomId)) {
            return;
        }
        const selectedRoom = roomsQuery.data.find((room) => room.id === form.roomId);
        if (!selectedRoom) {
            return;
        }
        const isUnavailable = normalizeRoomStatus(selectedRoom.status) === 'UNDER_MAINTENANCE'
            || selectedRoom.availableCapacity <= 0;
        if (!isUnavailable) {
            return;
        }
        setForm((current) => ({ ...current, roomId: '' }));
    }, [form.roomId, roomsQuery.data]);
    const updateParams = (values) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(values).forEach(([key, value]) => {
            if (value && value.trim()) {
                next.set(key, value);
            }
            else {
                next.delete(key);
            }
        });
        setSearchParams(next);
    };
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
        setActionError('');
        setActionSuccess('');
        try {
            await createAdmission.mutateAsync({
                patientId: form.patientId.trim(),
                roomId: form.roomId.trim(),
                admissionDate: form.admissionDate || undefined,
            });
            setForm(emptyForm);
            setPatientSearch('');
            setFormError('');
            setActionSuccess(t('messages.created'));
        }
        catch (error) {
            setFormError(getAdmissionApiMessage(error, t('errors.save')));
        }
    };
    const handleDischarge = async (id) => {
        if (!window.confirm(t('details.dischargeConfirm'))) {
            return;
        }
        setActionError('');
        setActionSuccess('');
        try {
            await dischargeAdmission.mutateAsync(id);
            setActionSuccess(t('messages.discharged'));
        }
        catch (error) {
            setActionError(getAdmissionApiMessage(error, t('errors.discharge')));
        }
    };
    if (statuses.includes(401)) {
        return (_jsx(AdmissionStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    if (statuses.includes(403)) {
        return (_jsx(AdmissionStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    const patientOptions = (patientsQuery.data?.items ?? []).map((patient) => ({
        value: patient.id,
        label: patient.phoneNumber
            ? `${patient.firstName} ${patient.lastName} (${patient.phoneNumber})`
            : `${patient.firstName} ${patient.lastName}`,
    }));
    const roomOptions = (roomsQuery.data ?? []).map((room) => {
        const departmentLabel = room.department
            ? getDepartmentLabel(room.department.name, room.department.location)
            : t('labels.noDepartment');
        const normalizedStatus = normalizeRoomStatus(room.status);
        const isMaintenance = normalizedStatus === 'UNDER_MAINTENANCE';
        const isFull = room.availableCapacity <= 0;
        const disabled = isMaintenance || isFull;
        let availabilityLabel = t('labels.roomAvailability', {
            available: room.availableCapacity,
            capacity: room.capacity,
        });
        if (isMaintenance) {
            availabilityLabel = t('labels.roomMaintenance');
        }
        else if (isFull) {
            availabilityLabel = t('labels.roomFull');
        }
        return {
            value: room.id,
            label: `${room.roomNumber} · ${departmentLabel} · ${availabilityLabel}`,
            disabled,
        };
    });
    const hasSelectableRooms = roomOptions.some((option) => !option.disabled);
    let listContent = null;
    if (admissionsQuery.isLoading) {
        listContent = (_jsx(AdmissionStateCard, { title: t('states.loadingTitle'), description: t('states.loadingDescription') }));
    }
    else if (admissionsQuery.error) {
        listContent = (_jsx(AdmissionStateCard, { title: t('states.errorTitle'), description: getAdmissionApiMessage(admissionsQuery.error, t('errors.list')), children: _jsx(Button, { variant: "outline", onClick: () => admissionsQuery.refetch(), children: t('actions.retry') }) }));
    }
    else if (!admissionsQuery.data?.length) {
        listContent = (_jsx(AdmissionStateCard, { title: hasStatusFilter ? t('states.emptyFilteredTitle') : t('states.emptyTitle'), description: hasStatusFilter
                ? t('states.emptyFilteredDescription')
                : t('states.emptyDescription'), children: hasStatusFilter ? (_jsx(Button, { type: "button", variant: "outline", onClick: () => updateParams({ status: null }), children: t('actions.clear') })) : null }));
    }
    else {
        listContent = (_jsx("div", { className: "grid gap-4 xl:grid-cols-2", children: admissionsQuery.data.map((admission) => {
                const patientName = getAdmissionPatientName(admission.patient) || t('labels.notAvailable');
                const roomLabel = getAdmissionRoomLabel(admission.room) || t('labels.notAvailable');
                const admissionDate = formatAdmissionDate(getAdmissionDateValue(admission), i18n.language) || t('labels.notAvailable');
                const normalizedStatus = normalizeAdmissionStatus(admission.status);
                const isActive = normalizedStatus === 'ACTIVE';
                return (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/50 p-5 transition-shadow duration-200 hover:shadow-soft", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("h2", { className: "truncate text-lg font-semibold text-foreground", children: patientName }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: roomLabel })] }), _jsx(Badge, { variant: getAdmissionStatusVariant(admission.status), children: isKnownAdmissionStatus(normalizedStatus)
                                        ? t(`statuses.${normalizedStatus}`)
                                        : admission.status || t('labels.notAvailable') })] }), _jsxs("div", { className: "mt-4 grid gap-3 text-sm md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.patientName') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: patientName })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.room') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: roomLabel })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.admissionDate') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: admissionDate })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.status') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: isKnownAdmissionStatus(normalizedStatus)
                                                ? t(`statuses.${normalizedStatus}`)
                                                : admission.status || t('labels.notAvailable') })] })] }), _jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [admission.room?.id ? (_jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/app/rooms/${admission.room?.id}`), children: t('actions.viewRoom') })) : null, _jsx(Button, { size: "sm", variant: "secondary", disabled: !isActive, loading: dischargeAdmission.isPending
                                        && dischargeAdmission.variables === admission.id, onClick: () => handleDischarge(admission.id), children: t('actions.discharge') })] })] }, admission.id));
            }) }));
    }
    const showPatientState = !patientsQuery.isLoading && !patientsQuery.error && !patientOptions.length && !form.patientId;
    const showRoomState = !roomsQuery.isLoading && !roomsQuery.error && !roomOptions.length;
    return (_jsxs("section", { className: "space-y-6", children: [_jsx("div", { className: "flex flex-wrap items-start justify-between gap-3", children: _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: t('page.title') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('page.description') })] }) }), _jsx(Card, { title: t('form.title'), description: t('form.description'), children: _jsxs("div", { className: "space-y-4", children: [roomsQuery.isLoading || patientsQuery.isLoading ? (_jsx(AdmissionStateCard, { title: t('states.loadingOptionsTitle'), description: t('states.loadingOptionsDescription') })) : null, !roomsQuery.isLoading && roomsQuery.error ? (_jsx(AdmissionStateCard, { title: t('states.errorTitle'), description: getRoomApiMessage(roomsQuery.error, t('errors.rooms')), children: _jsx(Button, { variant: "outline", onClick: () => roomsQuery.refetch(), children: t('actions.retry') }) })) : null, !patientsQuery.isLoading && patientsQuery.error ? (_jsx(AdmissionStateCard, { title: t('states.errorTitle'), description: t('errors.patients'), children: _jsx(Button, { variant: "outline", onClick: () => patientsQuery.refetch(), children: t('actions.retry') }) })) : null, showPatientState ? (_jsx(AdmissionStateCard, { title: t('states.emptyPatientsTitle'), description: t('states.emptyPatientsDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/patients'), children: t('actions.viewPatients') }) })) : null, showRoomState ? (_jsx(AdmissionStateCard, { title: t('states.emptyRoomsTitle'), description: t('states.emptyRoomsDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/rooms'), children: t('actions.viewRooms') }) })) : null, !roomsQuery.isLoading && !roomsQuery.error && roomOptions.length && !hasSelectableRooms ? (_jsx("div", { className: "rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-attention", children: t('states.noCapacityDescription') })) : null, !roomsQuery.isLoading
                            && !patientsQuery.isLoading
                            && !roomsQuery.error
                            && !patientsQuery.error
                            && !showPatientState
                            && !showRoomState ? (_jsxs("form", { className: "space-y-4", noValidate: true, onSubmit: handleSubmit, children: [formError ? (_jsx("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: formError })) : null, _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsx(Input, { name: "patientSearch", label: t('fields.patientSearch'), value: patientSearch, placeholder: t('form.patientSearchPlaceholder'), onChange: (event) => setPatientSearch(event.target.value) }), _jsxs(Select, { required: true, name: "patientId", label: t('fields.patient'), value: form.patientId, error: errors.patientId, onChange: (event) => handleChange('patientId', event.target.value), children: [_jsx("option", { value: "", children: t('form.patientPlaceholder') }), patientOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), _jsxs(Select, { required: true, name: "roomId", label: t('fields.room'), value: form.roomId, error: errors.roomId, onChange: (event) => handleChange('roomId', event.target.value), children: [_jsx("option", { value: "", children: t('form.roomPlaceholder') }), roomOptions.map((option) => (_jsx("option", { value: option.value, disabled: option.disabled, children: option.label }, option.value)))] }), _jsx(Input, { type: "date", name: "admissionDate", label: t('fields.admissionDate'), value: form.admissionDate, error: errors.admissionDate, hint: t('form.admissionDateHint'), onChange: (event) => handleChange('admissionDate', event.target.value) })] }), _jsxs("div", { className: "flex flex-wrap justify-end gap-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: () => setForm(emptyForm), children: t('actions.reset') }), _jsx(Button, { type: "submit", loading: saving, children: t('actions.create') })] })] })) : null] }) }), _jsx(Card, { title: t('filters.title'), description: t('filters.description'), children: _jsxs("div", { className: "grid gap-3 md:grid-cols-[220px,auto]", children: [_jsxs(Select, { name: "status", label: t('fields.status'), value: status, onChange: (event) => updateParams({ status: event.target.value || null }), children: [_jsx("option", { value: "", children: t('filters.allStatuses') }), _jsx("option", { value: "ACTIVE", children: t('statuses.ACTIVE') }), _jsx("option", { value: "DISCHARGED", children: t('statuses.DISCHARGED') })] }), _jsx(Button, { type: "button", variant: "outline", className: "md:self-end", onClick: () => updateParams({ status: null }), children: t('actions.clear') })] }) }), _jsx(Card, { title: t('list.title'), description: admissionsQuery.data
                    ? t('list.results', { count: admissionsQuery.data.length })
                    : t('list.description'), children: _jsxs("div", { className: "space-y-4", children: [admissionsQuery.isFetching && !admissionsQuery.isLoading ? (_jsx("p", { className: "text-sm text-muted-foreground", children: t('list.refreshing') })) : null, actionSuccess ? (_jsx("div", { className: "rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success", children: actionSuccess })) : null, actionError ? (_jsx("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: actionError })) : null, listContent] }) })] }));
}
