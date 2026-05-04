import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppointments, useCancelAppointment } from '@/domain/appointments/appointments.hooks';
import { formatAppointmentDate, getAppointmentApiMessage, getAppointmentApiStatus, getAppointmentDoctorName, getAppointmentPatientName, getAppointmentStatusVariant, } from '@/domain/appointments/appointments.utils';
import { useDoctors } from '@/domain/doctors/doctors.hooks';
import { usePatient, usePatients } from '@/domain/patients/patients.hooks';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import AppointmentStateCard from './state-card';
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
export default function AppointmentsListPage() {
    const { t, i18n } = useTranslation('appointments');
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const date = searchParams.get('date')?.trim() ?? '';
    const doctorId = searchParams.get('doctorId')?.trim() ?? '';
    const patientId = searchParams.get('patientId')?.trim() ?? '';
    const status = searchParams.get('status')?.trim() ?? '';
    const [patientSearch, setPatientSearch] = useState('');
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');
    const appointmentsQuery = useAppointments({
        date,
        doctorId,
        patientId,
        status: status,
    });
    const doctorsQuery = useDoctors();
    const patientsQuery = usePatients({ page: 1, limit: 50, search: patientSearch });
    const selectedPatientQuery = usePatient(patientId);
    const cancelAppointment = useCancelAppointment();
    const appointmentsStatus = getAppointmentApiStatus(appointmentsQuery.error);
    useEffect(() => {
        const successMessage = location.state?.success;
        if (typeof successMessage !== 'string' || !successMessage.trim()) {
            return;
        }
        setActionSuccess(successMessage);
        navigate(location.pathname, { replace: true, state: null });
    }, [location.pathname, location.state, navigate]);
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
    const doctorMap = useMemo(() => new Map((doctorsQuery.data ?? []).map((doctor) => [doctor.id, doctor])), [doctorsQuery.data]);
    const patientOptions = (patientsQuery.data?.items ?? []).map((patient) => ({
        value: patient.id,
        label: getPatientLabel(patient),
    }));
    const patientLabel = patientId
        ? patientOptions.find((option) => option.value === patientId)?.label
            ?? (selectedPatientQuery.data ? getPatientLabel(selectedPatientQuery.data) : patientId)
        : '';
    const patientSelectOptions = withFallbackOption(patientOptions, patientId, patientLabel);
    const handleCancel = async (id) => {
        if (!window.confirm(t('details.cancelConfirm'))) {
            return;
        }
        setActionError('');
        setActionSuccess('');
        try {
            await cancelAppointment.mutateAsync(id);
            setActionSuccess(t('messages.cancelled'));
        }
        catch (error) {
            setActionError(getAppointmentApiMessage(error, t('errors.cancel')));
        }
    };
    let content = null;
    if (appointmentsQuery.isLoading) {
        content = (_jsx(AppointmentStateCard, { title: t('states.loadingTitle'), description: t('states.loadingDescription') }));
    }
    else if (appointmentsStatus === 401) {
        content = (_jsx(AppointmentStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    else if (appointmentsStatus === 403) {
        content = (_jsx(AppointmentStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    else if (appointmentsQuery.error) {
        content = (_jsx(AppointmentStateCard, { title: t('states.errorTitle'), description: getAppointmentApiMessage(appointmentsQuery.error, t('errors.list'), t('errors.conflict')), children: _jsx(Button, { variant: "outline", onClick: () => appointmentsQuery.refetch(), children: t('actions.retry') }) }));
    }
    else if (!appointmentsQuery.data?.length) {
        content = (_jsx(AppointmentStateCard, { title: t('states.emptyTitle'), description: t('states.emptyDescription'), children: _jsx(Button, { onClick: () => navigate('/app/appointments/new'), children: t('actions.create') }) }));
    }
    else {
        content = (_jsx("div", { className: "grid gap-4 xl:grid-cols-2", children: appointmentsQuery.data.map((appointment) => {
                const doctor = doctorMap.get(appointment.doctorId);
                const departmentLabel = doctor?.department?.name || t('labels.notAvailable');
                const isLocked = appointment.status !== 'Scheduled';
                return (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/50 p-5 transition-shadow duration-200 hover:shadow-soft", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("h2", { className: "truncate text-lg font-semibold text-foreground", children: getAppointmentPatientName(appointment.patient) }), _jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [getAppointmentDoctorName(appointment.doctor), " \u00B7 ", appointment.doctor.specialization] })] }), _jsx(Badge, { variant: getAppointmentStatusVariant(appointment.status), children: t(`statuses.${appointment.status}`) })] }), _jsxs("div", { className: "mt-4 grid gap-3 text-sm md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.date') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: formatAppointmentDate(appointment.appointmentDate, i18n.language) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.time') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: appointment.appointmentTime })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.department') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: departmentLabel })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.notes') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: appointment.notes?.trim() || t('labels.noNotes') })] })] }), _jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/app/appointments/${appointment.id}`), children: t('actions.view') }), _jsx(Button, { size: "sm", variant: "secondary", onClick: () => navigate(`/app/appointments/${appointment.id}/edit`), children: t('actions.edit') }), _jsx(Button, { size: "sm", variant: "danger", disabled: isLocked, loading: cancelAppointment.isPending && cancelAppointment.variables === appointment.id, onClick: () => handleCancel(appointment.id), children: t('actions.cancelAppointment') })] })] }, appointment.id));
            }) }));
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: t('list.title') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('list.description') })] }), _jsx(Button, { onClick: () => navigate('/app/appointments/new'), children: t('actions.create') })] }), _jsx(Card, { title: t('filters.title'), description: t('filters.description'), children: _jsxs("div", { className: "grid gap-3 lg:grid-cols-5", children: [_jsx(Input, { type: "date", name: "date", label: t('fields.date'), value: date, onChange: (event) => updateParams({
                                date: event.target.value || null,
                                doctorId: doctorId || null,
                                patientId: patientId || null,
                                status: status || null,
                            }) }), _jsxs(Select, { name: "doctorId", label: t('fields.doctor'), value: doctorId, disabled: doctorsQuery.isLoading || !!doctorsQuery.error, onChange: (event) => updateParams({
                                date: date || null,
                                doctorId: event.target.value || null,
                                patientId: patientId || null,
                                status: status || null,
                            }), children: [_jsx("option", { value: "", children: doctorsQuery.isLoading ? t('labels.loadingDoctors') : t('filters.allDoctors') }), (doctorsQuery.data ?? []).map((doctor) => (_jsx("option", { value: doctor.id, children: getDoctorLabel(doctor) }, doctor.id)))] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Input, { name: "patientSearch", label: t('fields.patientSearch'), value: patientSearch, placeholder: t('filters.patientSearchPlaceholder'), onChange: (event) => setPatientSearch(event.target.value) }), _jsxs(Select, { name: "patientId", label: t('fields.patient'), value: patientId, disabled: patientsQuery.isLoading || !!patientsQuery.error, onChange: (event) => updateParams({
                                        date: date || null,
                                        doctorId: doctorId || null,
                                        patientId: event.target.value || null,
                                        status: status || null,
                                    }), children: [_jsx("option", { value: "", children: patientsQuery.isLoading ? t('labels.loadingPatients') : t('filters.allPatients') }), patientSelectOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] })] }), _jsxs(Select, { name: "status", label: t('fields.status'), value: status, onChange: (event) => updateParams({
                                date: date || null,
                                doctorId: doctorId || null,
                                patientId: patientId || null,
                                status: event.target.value || null,
                            }), children: [_jsx("option", { value: "", children: t('filters.allStatuses') }), _jsx("option", { value: "Scheduled", children: t('statuses.Scheduled') }), _jsx("option", { value: "Completed", children: t('statuses.Completed') }), _jsx("option", { value: "Cancelled", children: t('statuses.Cancelled') })] }), _jsx(Button, { type: "button", variant: "outline", className: "lg:self-end", onClick: () => {
                                setPatientSearch('');
                                updateParams({
                                    date: null,
                                    doctorId: null,
                                    patientId: null,
                                    status: null,
                                });
                            }, children: t('actions.clear') })] }) }), _jsx(Card, { title: t('list.resultsTitle'), description: appointmentsQuery.data
                    ? t('list.results', { count: appointmentsQuery.data.length })
                    : t('list.resultsDescription'), children: _jsxs("div", { className: "space-y-4", children: [appointmentsQuery.isFetching && !appointmentsQuery.isLoading ? (_jsx("p", { className: "text-sm text-muted-foreground", children: t('list.refreshing') })) : null, actionSuccess ? (_jsx("div", { className: "rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success", children: actionSuccess })) : null, actionError ? (_jsx("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: actionError })) : null, content] }) })] }));
}
