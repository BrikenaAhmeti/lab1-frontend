import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isDoctorOrAdminUser } from '@/domain/auth/role.utils';
import { useDeleteMedicalRecord, useMedicalRecords, } from '@/domain/medical-records/medical-records.hooks';
import { getMedicalRecordApiMessage, getMedicalRecordApiStatus, getMedicalRecordPatientName, getMedicalRecordPatientOptionLabel, withFallbackOption, } from '@/domain/medical-records/medical-records.utils';
import { usePatient, usePatients } from '@/domain/patients/patients.hooks';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import MedicalRecordItem from './record-item';
import MedicalRecordStateCard from './state-card';
export default function MedicalRecordsListPage() {
    const { t } = useTranslation('medicalRecords');
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
    const canManage = isDoctorOrAdminUser(roles);
    const patientId = searchParams.get('patientId')?.trim() ?? '';
    const [patientSearch, setPatientSearch] = useState('');
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');
    const patientsQuery = usePatients({ page: 1, limit: 50, search: patientSearch });
    const selectedPatientQuery = usePatient(patientId);
    const recordsQuery = useMedicalRecords(patientId);
    const deleteMedicalRecord = useDeleteMedicalRecord();
    const status = getMedicalRecordApiStatus(recordsQuery.error);
    const selectedPatientName = selectedPatientQuery.data
        ? getMedicalRecordPatientName(selectedPatientQuery.data)
        : '';
    useEffect(() => {
        const successMessage = location.state?.success;
        if (typeof successMessage !== 'string' || !successMessage.trim()) {
            return;
        }
        setActionSuccess(successMessage);
        navigate({
            pathname: location.pathname,
            search: location.search,
        }, { replace: true, state: null });
    }, [location.pathname, location.search, location.state, navigate]);
    const patientOptions = (patientsQuery.data?.items ?? []).map((patient) => ({
        value: patient.id,
        label: getMedicalRecordPatientOptionLabel(patient),
    }));
    const selectedPatientLabel = patientOptions.find((option) => option.value === patientId)?.label
        ?? (selectedPatientQuery.data
            ? getMedicalRecordPatientOptionLabel(selectedPatientQuery.data)
            : patientId);
    const patientSelectOptions = withFallbackOption(patientOptions, patientId, selectedPatientLabel);
    const updatePatientId = (value) => {
        const next = new URLSearchParams(searchParams);
        if (value.trim()) {
            next.set('patientId', value.trim());
        }
        else {
            next.delete('patientId');
        }
        setActionError('');
        setActionSuccess('');
        setSearchParams(next);
    };
    const handleDelete = async (record) => {
        if (!window.confirm(t('details.deleteConfirm'))) {
            return;
        }
        setActionError('');
        setActionSuccess('');
        try {
            await deleteMedicalRecord.mutateAsync(record.id);
            setActionSuccess(t('messages.deleted'));
        }
        catch (error) {
            setActionError(getMedicalRecordApiMessage(error, t('errors.delete'), {
                403: t('errors.writeForbidden'),
                404: t('errors.notFound'),
            }));
        }
    };
    let content = null;
    if (!patientId) {
        content = (_jsx(MedicalRecordStateCard, { title: t('states.selectPatientTitle'), description: t('states.selectPatientDescription') }));
    }
    else if (recordsQuery.isLoading) {
        content = (_jsx(MedicalRecordStateCard, { title: t('states.loadingTitle'), description: t('states.loadingDescription') }));
    }
    else if (status === 401) {
        content = (_jsx(MedicalRecordStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    else if (status === 403) {
        content = (_jsx(MedicalRecordStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    else if (status === 404) {
        content = (_jsx(MedicalRecordStateCard, { title: t('details.notFoundTitle'), description: t('details.notFoundDescription') }));
    }
    else if (recordsQuery.error) {
        content = (_jsx(MedicalRecordStateCard, { title: t('states.errorTitle'), description: getMedicalRecordApiMessage(recordsQuery.error, t('errors.list'), {
                400: t('errors.invalidPatient'),
            }), children: _jsx(Button, { variant: "outline", onClick: () => recordsQuery.refetch(), children: t('actions.retry') }) }));
    }
    else if (!recordsQuery.data?.length) {
        content = (_jsx(MedicalRecordStateCard, { title: t('states.emptyTitle'), description: t('states.emptyDescription'), children: canManage ? (_jsx(Button, { onClick: () => navigate(`/app/medical-records/new?patientId=${encodeURIComponent(patientId)}`), children: t('actions.create') })) : null }));
    }
    else {
        content = (_jsx("div", { className: "space-y-3", children: recordsQuery.data.map((record) => (_jsx(MedicalRecordItem, { record: record, canManage: canManage, deleting: deleteMedicalRecord.isPending && deleteMedicalRecord.variables === record.id, onEdit: (nextRecord) => navigate(`/app/medical-records/${nextRecord.id}/edit?patientId=${encodeURIComponent(nextRecord.patientId)}`), onDelete: handleDelete }, record.id))) }));
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: t('list.title') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('list.description') })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [selectedPatientQuery.data ? (_jsx(Button, { variant: "ghost", onClick: () => navigate(`/app/patients/${selectedPatientQuery.data?.id}`), children: t('actions.viewPatient') })) : null, canManage ? (_jsx(Button, { disabled: !patientId, onClick: () => navigate(patientId
                                    ? `/app/medical-records/new?patientId=${encodeURIComponent(patientId)}`
                                    : '/app/medical-records/new'), children: t('actions.create') })) : null] })] }), _jsx(Card, { title: t('filters.title'), description: t('filters.description'), className: "relative z-20", children: _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsx(Input, { name: "patientSearch", label: t('fields.patientSearch'), value: patientSearch, placeholder: t('filters.patientSearchPlaceholder'), onChange: (event) => setPatientSearch(event.target.value) }), _jsxs(Select, { name: "patientId", label: t('fields.patient'), value: patientId, hint: patientsQuery.isLoading ? t('labels.loadingPatients') : undefined, error: patientsQuery.error ? getMedicalRecordApiMessage(patientsQuery.error, t('errors.patients')) : '', onChange: (event) => updatePatientId(event.target.value), children: [_jsx("option", { value: "", children: t('filters.patientPlaceholder') }), patientSelectOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] })] }) }), _jsx(Card, { title: t('list.resultsTitle'), description: patientId
                    ? t('list.results', {
                        count: recordsQuery.data?.length ?? 0,
                        patient: selectedPatientName || t('labels.selectedPatient'),
                    })
                    : t('list.resultsDescription'), className: "relative z-0", children: _jsxs("div", { className: "space-y-4", children: [recordsQuery.isFetching && patientId && !recordsQuery.isLoading ? (_jsx("p", { className: "text-sm text-muted-foreground", children: t('list.refreshing') })) : null, actionSuccess ? (_jsx("div", { className: "rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success", children: actionSuccess })) : null, actionError ? (_jsx("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: actionError })) : null, content] }) })] }));
}
