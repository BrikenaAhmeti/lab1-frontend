import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isDoctorOrAdminUser } from '@/domain/auth/role.utils';
import { useCreatePrescription, useDeletePrescription, useMedicalRecordPrescriptions, useMedicalRecords, useUpdatePrescription, } from '@/domain/medical-records/medical-records.hooks';
import { formatMedicalRecordDate, formatMedicalRecordDateTime, getMedicalRecordApiMessage, getMedicalRecordApiStatus, getMedicalRecordPatientOptionLabel, withFallbackOption, } from '@/domain/medical-records/medical-records.utils';
import { usePatient, usePatients } from '@/domain/patients/patients.hooks';
import { getPatientApiMessage, getPatientApiStatus } from '@/domain/patients/patients.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import Textarea from '@/ui/atoms/Textarea';
const emptyForm = {
    medicine: '',
    dosage: '',
    duration: '',
    instructions: '',
};
function PrescriptionsStateCard({ title, description, children, }) {
    return (_jsx(Card, { title: title, description: description, children: children }));
}
function validateForm(values, t) {
    const errors = {};
    if (!values.medicine.trim()) {
        errors.medicine = t('validation.required');
    }
    if (!values.dosage.trim()) {
        errors.dosage = t('validation.required');
    }
    if (!values.duration.trim()) {
        errors.duration = t('validation.required');
    }
    return errors;
}
function getRecordLabel(record, language, fallback) {
    const diagnosis = record.diagnosis.trim() || fallback;
    const recordDate = formatMedicalRecordDate(record.recordDate, language);
    return `${diagnosis} · ${recordDate || fallback}`;
}
function getFormValues(prescription) {
    if (!prescription) {
        return emptyForm;
    }
    return {
        medicine: prescription.medicine,
        dosage: prescription.dosage,
        duration: prescription.duration,
        instructions: prescription.instructions ?? '',
    };
}
export default function PrescriptionsPage() {
    const { t, i18n } = useTranslation('prescriptions');
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
    const canManage = isDoctorOrAdminUser(roles);
    const patientId = searchParams.get('patientId')?.trim() ?? '';
    const recordId = searchParams.get('recordId')?.trim() ?? '';
    const [patientSearch, setPatientSearch] = useState('');
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');
    const [editingId, setEditingId] = useState('');
    const [showForm, setShowForm] = useState(false);
    const patientsQuery = usePatients({ page: 1, limit: 50, search: patientSearch });
    const selectedPatientQuery = usePatient(patientId);
    const recordsQuery = useMedicalRecords(patientId);
    const prescriptionsQuery = useMedicalRecordPrescriptions(recordId);
    const createPrescription = useCreatePrescription();
    const updatePrescription = useUpdatePrescription();
    const deletePrescription = useDeletePrescription();
    const recordsStatus = getMedicalRecordApiStatus(recordsQuery.error);
    const prescriptionsStatus = getMedicalRecordApiStatus(prescriptionsQuery.error);
    const patientsStatus = getPatientApiStatus(patientsQuery.error);
    const saving = createPrescription.isPending || updatePrescription.isPending;
    useEffect(() => {
        setForm(emptyForm);
        setErrors({});
        setFormError('');
        setEditingId('');
        setShowForm(false);
    }, [recordId]);
    useEffect(() => {
        if (!recordId || recordsQuery.isLoading || recordsQuery.error || !recordsQuery.data) {
            return;
        }
        if (recordsQuery.data.some((record) => record.id === recordId)) {
            return;
        }
        const next = new URLSearchParams(searchParams);
        next.delete('recordId');
        setSearchParams(next);
    }, [
        recordId,
        recordsQuery.data,
        recordsQuery.error,
        recordsQuery.isLoading,
        searchParams,
        setSearchParams,
    ]);
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
        setActionError('');
        setActionSuccess('');
    };
    const patientOptions = (patientsQuery.data?.items ?? []).map((patient) => ({
        value: patient.id,
        label: getMedicalRecordPatientOptionLabel(patient),
    }));
    const selectedPatientLabel = patientId
        ? patientOptions.find((option) => option.value === patientId)?.label
            ?? (selectedPatientQuery.data
                ? getMedicalRecordPatientOptionLabel(selectedPatientQuery.data)
                : patientId)
        : '';
    const patientSelectOptions = withFallbackOption(patientOptions, patientId, selectedPatientLabel);
    const recordOptions = (recordsQuery.data ?? []).map((record) => ({
        value: record.id,
        label: getRecordLabel(record, i18n.language, t('labels.notAvailable')),
    }));
    const selectedRecordLabel = recordId
        ? recordOptions.find((option) => option.value === recordId)?.label ?? recordId
        : '';
    const recordSelectOptions = withFallbackOption(recordOptions, recordId, selectedRecordLabel);
    const handleFormChange = (name, value) => {
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: '' }));
        setFormError('');
    };
    const handleCreateClick = () => {
        setForm(emptyForm);
        setErrors({});
        setFormError('');
        setActionError('');
        setActionSuccess('');
        setEditingId('');
        setShowForm(true);
    };
    const handleEditClick = (prescription) => {
        setForm(getFormValues(prescription));
        setErrors({});
        setFormError('');
        setActionError('');
        setActionSuccess('');
        setEditingId(prescription.id);
        setShowForm(true);
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = validateForm(form, t);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length || !recordId) {
            return;
        }
        const payload = {
            medicalRecordId: recordId,
            medicine: form.medicine.trim(),
            dosage: form.dosage.trim(),
            duration: form.duration.trim(),
            instructions: form.instructions.trim() || null,
        };
        try {
            setFormError('');
            setActionError('');
            setActionSuccess('');
            if (editingId) {
                await updatePrescription.mutateAsync({
                    id: editingId,
                    payload,
                });
            }
            else {
                await createPrescription.mutateAsync(payload);
            }
            setForm(emptyForm);
            setErrors({});
            setEditingId('');
            setShowForm(false);
            setActionSuccess(editingId ? t('messages.updated') : t('messages.created'));
        }
        catch (error) {
            setFormError(getMedicalRecordApiMessage(error, t('errors.save'), {
                400: t('errors.invalidData'),
                403: t('errors.writeForbidden'),
                404: t('errors.notFound'),
            }));
        }
    };
    const handleDelete = async (prescription) => {
        if (!window.confirm(t('details.deleteConfirm'))) {
            return;
        }
        try {
            setFormError('');
            setActionError('');
            setActionSuccess('');
            await deletePrescription.mutateAsync({
                id: prescription.id,
                medicalRecordId: prescription.medicalRecordId,
            });
            if (editingId === prescription.id) {
                setForm(emptyForm);
                setErrors({});
                setEditingId('');
                setShowForm(false);
            }
            setActionSuccess(t('messages.deleted'));
        }
        catch (error) {
            setActionError(getMedicalRecordApiMessage(error, t('errors.delete'), {
                403: t('errors.writeForbidden'),
                404: t('errors.notFound'),
            }));
        }
    };
    let listContent = null;
    if (!patientId) {
        listContent = (_jsx(PrescriptionsStateCard, { title: t('states.selectPatientTitle'), description: t('states.selectPatientDescription') }));
    }
    else if (recordsStatus === 401 || patientsStatus === 401 || prescriptionsStatus === 401) {
        listContent = (_jsx(PrescriptionsStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    else if (recordsStatus === 403 || patientsStatus === 403 || prescriptionsStatus === 403) {
        listContent = (_jsx(PrescriptionsStateCard, { title: canManage ? t('states.forbiddenTitle') : t('states.writeForbiddenTitle'), description: canManage ? t('states.forbiddenDescription') : t('states.writeForbiddenDescription') }));
    }
    else if (recordsQuery.isLoading) {
        listContent = (_jsx(PrescriptionsStateCard, { title: t('states.loadingTitle'), description: t('states.loadingDescription') }));
    }
    else if (recordsQuery.error) {
        listContent = (_jsx(PrescriptionsStateCard, { title: t('states.errorTitle'), description: getMedicalRecordApiMessage(recordsQuery.error, t('errors.records'), {
                404: t('errors.notFound'),
            }), children: _jsx(Button, { variant: "outline", onClick: () => recordsQuery.refetch(), children: t('actions.retry') }) }));
    }
    else if (!recordsQuery.data?.length) {
        listContent = (_jsx(PrescriptionsStateCard, { title: t('states.emptyRecordsTitle'), description: t('states.emptyRecordsDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate(patientId
                    ? `/app/medical-records?patientId=${encodeURIComponent(patientId)}`
                    : '/app/medical-records'), children: t('actions.viewRecords') }) }));
    }
    else if (!recordId) {
        listContent = (_jsx(PrescriptionsStateCard, { title: t('states.selectRecordTitle'), description: t('states.selectRecordDescription') }));
    }
    else if (prescriptionsQuery.isLoading) {
        listContent = (_jsx(PrescriptionsStateCard, { title: t('states.loadingTitle'), description: t('states.loadingDescription') }));
    }
    else if (prescriptionsQuery.error) {
        listContent = (_jsx(PrescriptionsStateCard, { title: t('states.errorTitle'), description: getMedicalRecordApiMessage(prescriptionsQuery.error, t('errors.list'), {
                404: t('errors.notFound'),
            }), children: _jsx(Button, { variant: "outline", onClick: () => prescriptionsQuery.refetch(), children: t('actions.retry') }) }));
    }
    else if (!prescriptionsQuery.data?.length) {
        listContent = (_jsx(PrescriptionsStateCard, { title: t('states.emptyTitle'), description: t('states.emptyDescription'), children: canManage ? (_jsx(Button, { onClick: handleCreateClick, children: t('actions.create') })) : null }));
    }
    else {
        listContent = (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-[760px] w-full text-left text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-border/70 text-muted-foreground", children: [_jsx("th", { className: "px-3 py-3 font-medium", children: t('fields.medicine') }), _jsx("th", { className: "px-3 py-3 font-medium", children: t('fields.dosage') }), _jsx("th", { className: "px-3 py-3 font-medium", children: t('fields.duration') }), _jsx("th", { className: "px-3 py-3 font-medium", children: t('fields.instructions') }), _jsx("th", { className: "px-3 py-3 font-medium", children: t('fields.updatedAt') }), canManage ? _jsx("th", { className: "px-3 py-3 font-medium", children: t('actions.edit') }) : null] }) }), _jsx("tbody", { children: prescriptionsQuery.data.map((prescription) => (_jsxs("tr", { className: "border-b border-border/50 last:border-b-0", children: [_jsx("td", { className: "px-3 py-3 font-medium text-foreground", children: prescription.medicine }), _jsx("td", { className: "px-3 py-3 text-foreground", children: prescription.dosage }), _jsx("td", { className: "px-3 py-3 text-foreground", children: prescription.duration }), _jsx("td", { className: "px-3 py-3 text-foreground", children: prescription.instructions?.trim() || t('labels.noInstructions') }), _jsx("td", { className: "px-3 py-3 text-foreground", children: formatMedicalRecordDateTime(prescription.updatedAt || prescription.createdAt, i18n.language) || t('labels.notAvailable') }), canManage ? (_jsx("td", { className: "px-3 py-3", children: _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { size: "sm", variant: "secondary", onClick: () => handleEditClick(prescription), children: t('actions.edit') }), _jsx(Button, { size: "sm", variant: "danger", loading: deletePrescription.isPending
                                                    && deletePrescription.variables?.id === prescription.id, onClick: () => handleDelete(prescription), children: t('actions.delete') })] }) })) : null] }, prescription.id))) })] }) }));
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: t('list.title') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('list.description') })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [selectedPatientQuery.data ? (_jsx(Button, { variant: "ghost", onClick: () => navigate(`/app/patients/${selectedPatientQuery.data.id}`), children: t('actions.viewPatient') })) : null, _jsx(Button, { variant: "outline", onClick: () => navigate(patientId
                                    ? `/app/medical-records?patientId=${encodeURIComponent(patientId)}`
                                    : '/app/medical-records'), children: t('actions.viewRecords') }), canManage ? (_jsx(Button, { disabled: !recordId, onClick: handleCreateClick, children: t('actions.create') })) : (_jsx(Badge, { variant: "secondary", children: t('labels.viewOnly') }))] })] }), _jsx(Card, { title: t('filters.title'), description: t('filters.description'), children: _jsxs("div", { className: "grid gap-4 xl:grid-cols-3", children: [_jsx(Input, { name: "patientSearch", label: t('fields.patientSearch'), value: patientSearch, placeholder: t('filters.patientSearchPlaceholder'), onChange: (event) => setPatientSearch(event.target.value) }), _jsxs(Select, { name: "patientId", label: t('fields.patient'), value: patientId, hint: patientsQuery.isLoading ? t('labels.loadingPatients') : undefined, error: patientsQuery.error ? getPatientApiMessage(patientsQuery.error, t('errors.patients')) : '', onChange: (event) => updateParams({
                                patientId: event.target.value || null,
                                recordId: null,
                            }), children: [_jsx("option", { value: "", children: t('filters.patientPlaceholder') }), patientSelectOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), _jsxs(Select, { name: "recordId", label: t('fields.record'), value: recordId, disabled: !patientId || recordsQuery.isLoading, hint: !patientId ? undefined : recordsQuery.isLoading ? t('labels.loadingRecords') : undefined, error: recordsQuery.error ? getMedicalRecordApiMessage(recordsQuery.error, t('errors.records')) : '', onChange: (event) => updateParams({
                                patientId: patientId || null,
                                recordId: event.target.value || null,
                            }), children: [_jsx("option", { value: "", children: t('filters.recordPlaceholder') }), recordSelectOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] })] }) }), showForm && canManage && recordId ? (_jsx(Card, { title: editingId ? t('form.editTitle') : t('form.createTitle'), description: t('form.description'), children: _jsxs("form", { className: "space-y-4", onSubmit: handleSubmit, children: [_jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsx(Input, { required: true, name: "medicine", label: t('fields.medicine'), value: form.medicine, error: errors.medicine, onChange: (event) => handleFormChange('medicine', event.target.value) }), _jsx(Input, { required: true, name: "dosage", label: t('fields.dosage'), value: form.dosage, error: errors.dosage, onChange: (event) => handleFormChange('dosage', event.target.value) }), _jsx(Input, { required: true, name: "duration", label: t('fields.duration'), value: form.duration, error: errors.duration, onChange: (event) => handleFormChange('duration', event.target.value) }), _jsx(Input, { name: "record", label: t('fields.record'), value: selectedRecordLabel, readOnly: true })] }), _jsx(Textarea, { name: "instructions", label: t('fields.instructions'), value: form.instructions, placeholder: t('form.instructionsPlaceholder'), onChange: (event) => handleFormChange('instructions', event.target.value) }), formError ? _jsx("p", { className: "text-sm text-danger", children: formError }) : null, _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { type: "submit", loading: saving, children: editingId ? t('actions.update') : t('actions.save') }), _jsx(Button, { type: "button", variant: "outline", onClick: () => {
                                        setForm(emptyForm);
                                        setErrors({});
                                        setFormError('');
                                        setEditingId('');
                                        setShowForm(false);
                                    }, children: t('actions.cancel') })] })] }) })) : null, _jsx(Card, { title: t('list.resultsTitle'), description: t('list.resultsDescription'), children: _jsxs("div", { className: "space-y-4", children: [prescriptionsQuery.isFetching && !prescriptionsQuery.isLoading ? (_jsx("p", { className: "text-sm text-muted-foreground", children: t('list.refreshing') })) : null, actionSuccess ? (_jsx("div", { className: "rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success", children: actionSuccess })) : null, actionError ? (_jsx("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: actionError })) : null, listContent] }) })] }));
}
