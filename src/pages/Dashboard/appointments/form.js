import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppointment, useCreateAppointment, useUpdateAppointment, } from '@/domain/appointments/appointments.hooks';
import { useDoctors } from '@/domain/doctors/doctors.hooks';
import { usePatient, usePatients } from '@/domain/patients/patients.hooks';
import { appointmentDatePattern, appointmentTimePattern, getAppointmentApiMessage, getAppointmentApiStatus, getAppointmentDateValue, isAppointmentLocked, isPastAppointmentSlot, } from '@/domain/appointments/appointments.utils';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import Textarea from '@/ui/atoms/Textarea';
import AppointmentStateCard from './state-card';
const emptyForm = {
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    status: 'Scheduled',
    notes: '',
};
function getDoctorLabel(doctor) {
    const fullName = [doctor.firstName, doctor.lastName].filter(Boolean).join(' ').trim();
    const departmentName = doctor.department?.name ? ` · ${doctor.department.name}` : '';
    return `${fullName} · ${doctor.specialization}${departmentName}`;
}
function getPatientLabel(patient) {
    const fullName = [patient.firstName, patient.lastName].filter(Boolean).join(' ').trim();
    return patient.phoneNumber ? `${fullName} (${patient.phoneNumber})` : fullName;
}
function withFallbackOption(options, value, label) {
    if (!value || options.some((option) => option.value === value)) {
        return options;
    }
    return [{ value, label }, ...options];
}
function validateForm(values, canEditSchedule, t) {
    const errors = {};
    if (!values.patientId.trim())
        errors.patientId = t('validation.required');
    if (!values.doctorId.trim())
        errors.doctorId = t('validation.required');
    if (!values.date.trim())
        errors.date = t('validation.required');
    if (!values.time.trim())
        errors.time = t('validation.required');
    if (values.date && !appointmentDatePattern.test(values.date)) {
        errors.date = t('validation.date');
    }
    if (values.time && !appointmentTimePattern.test(values.time)) {
        errors.time = t('validation.time');
    }
    if (canEditSchedule && values.date && values.time && isPastAppointmentSlot(values.date, values.time)) {
        errors.date = t('validation.future');
    }
    return errors;
}
export default function AppointmentFormPage() {
    const { t } = useTranslation('appointments');
    const navigate = useNavigate();
    const location = useLocation();
    const { id = '' } = useParams();
    const isEdit = !!id;
    const locationState = location.state ?? null;
    const appointmentQuery = useAppointment(id);
    const doctorsQuery = useDoctors();
    const [form, setForm] = useState({
        ...emptyForm,
        patientId: locationState?.patientId ?? '',
        doctorId: locationState?.doctorId ?? '',
        date: locationState?.date ?? '',
    });
    const [patientSearch, setPatientSearch] = useState('');
    const patientsQuery = usePatients({ page: 1, limit: 50, search: patientSearch });
    const selectedPatientQuery = usePatient(form.patientId);
    const createAppointment = useCreateAppointment();
    const updateAppointment = useUpdateAppointment();
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const status = getAppointmentApiStatus(appointmentQuery.error);
    const saving = createAppointment.isPending || updateAppointment.isPending;
    useEffect(() => {
        if (!isEdit || !appointmentQuery.data) {
            return;
        }
        setForm({
            patientId: appointmentQuery.data.patientId,
            doctorId: appointmentQuery.data.doctorId,
            date: getAppointmentDateValue(appointmentQuery.data.appointmentDate),
            time: appointmentQuery.data.appointmentTime,
            status: appointmentQuery.data.status,
            notes: appointmentQuery.data.notes ?? '',
        });
    }, [appointmentQuery.data, isEdit]);
    const locked = isEdit && appointmentQuery.data ? isAppointmentLocked(appointmentQuery.data.status) : false;
    const canEditSchedule = !isEdit || form.status === 'Scheduled';
    const patientOptions = useMemo(() => (patientsQuery.data?.items ?? []).map((patient) => ({
        value: patient.id,
        label: getPatientLabel(patient),
    })), [patientsQuery.data]);
    const selectedPatientLabel = patientOptions.find((option) => option.value === form.patientId)?.label
        ?? (selectedPatientQuery.data ? getPatientLabel(selectedPatientQuery.data) : form.patientId);
    const patientSelectOptions = withFallbackOption(patientOptions, form.patientId, selectedPatientLabel);
    const doctorOptions = (doctorsQuery.data ?? []).map((doctor) => ({
        value: doctor.id,
        label: getDoctorLabel(doctor),
    }));
    const handleChange = (name, value) => {
        if (name === 'status' && value !== 'Scheduled' && appointmentQuery.data) {
            setForm((current) => ({
                ...current,
                patientId: appointmentQuery.data?.patientId ?? current.patientId,
                doctorId: appointmentQuery.data?.doctorId ?? current.doctorId,
                date: appointmentQuery.data ? getAppointmentDateValue(appointmentQuery.data.appointmentDate) : current.date,
                time: appointmentQuery.data?.appointmentTime ?? current.time,
                status: value,
            }));
            setErrors((current) => ({ ...current, status: '' }));
            setFormError('');
            return;
        }
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: '' }));
        setFormError('');
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = validateForm(form, canEditSchedule, t);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            return;
        }
        try {
            if (isEdit && appointmentQuery.data) {
                const payload = {};
                if (appointmentQuery.data.status !== form.status) {
                    payload.status = form.status;
                }
                if (!locked && form.status === 'Scheduled') {
                    if (appointmentQuery.data.patientId !== form.patientId.trim()) {
                        payload.patientId = form.patientId.trim();
                    }
                    if (appointmentQuery.data.doctorId !== form.doctorId.trim()) {
                        payload.doctorId = form.doctorId.trim();
                    }
                    if (getAppointmentDateValue(appointmentQuery.data.appointmentDate) !== form.date) {
                        payload.date = form.date;
                    }
                    if (appointmentQuery.data.appointmentTime !== form.time) {
                        payload.time = form.time;
                    }
                }
                const nextNotes = form.notes.trim();
                const currentNotes = appointmentQuery.data.notes ?? '';
                if (currentNotes !== nextNotes) {
                    payload.notes = nextNotes || null;
                }
                if (!Object.keys(payload).length) {
                    setFormError(t('validation.noChanges'));
                    return;
                }
                const appointment = await updateAppointment.mutateAsync({ id, payload });
                navigate(`/app/appointments/${appointment.id}`, {
                    replace: true,
                    state: { success: t('messages.updated') },
                });
                return;
            }
            const appointment = await createAppointment.mutateAsync({
                patientId: form.patientId.trim(),
                doctorId: form.doctorId.trim(),
                date: form.date,
                time: form.time,
                notes: form.notes.trim() || undefined,
            });
            navigate(`/app/appointments/${appointment.id}`, {
                replace: true,
                state: { success: t('messages.created') },
            });
        }
        catch (error) {
            setFormError(getAppointmentApiMessage(error, t('errors.save'), t('errors.conflict')));
        }
    };
    if (isEdit && appointmentQuery.isLoading) {
        return (_jsx(AppointmentStateCard, { title: t('states.loadingAppointmentTitle'), description: t('states.loadingAppointmentDescription') }));
    }
    if (isEdit && status === 404) {
        return (_jsx(AppointmentStateCard, { title: t('details.notFoundTitle'), description: t('details.notFoundDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/appointments'), children: t('actions.back') }) }));
    }
    if (isEdit && status === 401) {
        return (_jsx(AppointmentStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    if (isEdit && status === 403) {
        return (_jsx(AppointmentStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    if (isEdit && appointmentQuery.error) {
        return (_jsx(AppointmentStateCard, { title: t('states.errorTitle'), description: getAppointmentApiMessage(appointmentQuery.error, t('errors.details')), children: _jsx(Button, { variant: "outline", onClick: () => appointmentQuery.refetch(), children: t('actions.retry') }) }));
    }
    if (doctorsQuery.isLoading || patientsQuery.isLoading) {
        return (_jsx(AppointmentStateCard, { title: t('states.loadingOptionsTitle'), description: t('states.loadingOptionsDescription') }));
    }
    if (doctorsQuery.error) {
        return (_jsx(AppointmentStateCard, { title: t('states.errorTitle'), description: getAppointmentApiMessage(doctorsQuery.error, t('errors.doctors')), children: _jsx(Button, { variant: "outline", onClick: () => doctorsQuery.refetch(), children: t('actions.retry') }) }));
    }
    if (patientsQuery.error) {
        return (_jsx(AppointmentStateCard, { title: t('states.errorTitle'), description: getAppointmentApiMessage(patientsQuery.error, t('errors.patients')), children: _jsx(Button, { variant: "outline", onClick: () => patientsQuery.refetch(), children: t('actions.retry') }) }));
    }
    if (!doctorOptions.length) {
        return (_jsx(AppointmentStateCard, { title: t('states.emptyDoctorsTitle'), description: t('states.emptyDoctorsDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/doctors'), children: t('actions.viewDoctors') }) }));
    }
    if (!patientSelectOptions.length && !form.patientId) {
        return (_jsx(AppointmentStateCard, { title: t('states.emptyPatientsTitle'), description: t('states.emptyPatientsDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/patients'), children: t('actions.viewPatients') }) }));
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: isEdit ? t('form.editTitle') : t('form.createTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: isEdit ? t('form.editDescription') : t('form.createDescription') })] }), _jsx(Button, { variant: "outline", onClick: () => navigate(isEdit ? `/app/appointments/${id}` : '/app/appointments'), children: t('actions.cancel') })] }), _jsx(Card, { title: t('form.formTitle'), description: t('form.formDescription'), children: _jsxs("form", { className: "space-y-4", noValidate: true, onSubmit: handleSubmit, children: [locked ? (_jsx("div", { className: "rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 text-sm text-attention", children: t('form.lockedNotice') })) : null, formError ? (_jsx("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: formError })) : null, _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsx(Input, { name: "patientSearch", label: t('fields.patientSearch'), value: patientSearch, placeholder: t('form.patientSearchPlaceholder'), onChange: (event) => setPatientSearch(event.target.value) }), _jsxs(Select, { required: true, name: "patientId", label: t('fields.patient'), value: form.patientId, error: errors.patientId, disabled: !canEditSchedule, onChange: (event) => handleChange('patientId', event.target.value), children: [_jsx("option", { value: "", children: t('form.patientPlaceholder') }), patientSelectOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), _jsxs(Select, { required: true, name: "doctorId", label: t('fields.doctor'), value: form.doctorId, error: errors.doctorId, disabled: !canEditSchedule, onChange: (event) => handleChange('doctorId', event.target.value), children: [_jsx("option", { value: "", children: t('form.doctorPlaceholder') }), doctorOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), isEdit ? (_jsxs(Select, { name: "status", label: t('fields.status'), value: form.status, disabled: locked, onChange: (event) => handleChange('status', event.target.value), children: [_jsx("option", { value: "Scheduled", children: t('statuses.Scheduled') }), _jsx("option", { value: "Completed", children: t('statuses.Completed') }), _jsx("option", { value: "Cancelled", children: t('statuses.Cancelled') })] })) : (_jsx(Input, { disabled: true, readOnly: true, name: "status", label: t('fields.status'), value: t('statuses.Scheduled'), hint: t('form.statusHint') })), _jsx(Input, { required: true, type: "date", name: "date", label: t('fields.date'), value: form.date, error: errors.date, disabled: !canEditSchedule, onChange: (event) => handleChange('date', event.target.value) }), _jsx(Input, { required: true, type: "time", name: "time", label: t('fields.time'), value: form.time, error: errors.time, disabled: !canEditSchedule, onChange: (event) => handleChange('time', event.target.value) })] }), _jsx(Textarea, { name: "notes", label: t('fields.notes'), value: form.notes, placeholder: t('form.notesPlaceholder'), onChange: (event) => handleChange('notes', event.target.value) }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { type: "submit", loading: saving, children: isEdit ? t('actions.update') : t('actions.save') }), _jsx(Button, { type: "button", variant: "outline", onClick: () => navigate(isEdit ? `/app/appointments/${id}` : '/app/appointments'), children: t('actions.cancel') })] })] }) })] }));
}
