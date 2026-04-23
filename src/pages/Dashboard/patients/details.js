import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { useDeletePatient, usePatient } from '@/domain/patients/patients.hooks';
import { formatPatientDate, getPatientApiMessage, getPatientApiStatus } from '@/domain/patients/patients.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import { useState } from 'react';
import PatientStateCard from './state-card';
function getIsAdmin(roles) {
    const storedRole = localStorage.getItem('role');
    const allRoles = [...roles, ...(storedRole ? [storedRole] : [])].map((role) => role.toUpperCase());
    return allRoles.includes('ADMIN') || allRoles.includes('ADMINS');
}
export default function PatientDetailsPage() {
    const { t, i18n } = useTranslation('patients');
    const navigate = useNavigate();
    const { id = '' } = useParams();
    const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
    const isAdmin = getIsAdmin(roles);
    const patientQuery = usePatient(id);
    const deletePatient = useDeletePatient();
    const [actionError, setActionError] = useState('');
    const status = getPatientApiStatus(patientQuery.error);
    const patient = patientQuery.data;
    const handleDelete = async () => {
        if (!window.confirm(t('details.deleteConfirm'))) {
            return;
        }
        try {
            setActionError('');
            await deletePatient.mutateAsync(id);
            navigate('/app/patients', { replace: true });
        }
        catch (error) {
            setActionError(getPatientApiMessage(error, t('errors.delete')));
        }
    };
    if (patientQuery.isLoading) {
        return (_jsx(PatientStateCard, { title: t('states.loadingPatientTitle'), description: t('states.loadingPatientDescription') }));
    }
    if (status === 401) {
        return (_jsx(PatientStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    if (status === 403) {
        return (_jsx(PatientStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    if (status === 404) {
        return (_jsx(PatientStateCard, { title: t('details.notFoundTitle'), description: t('details.notFoundDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/patients'), children: t('actions.back') }) }));
    }
    if (patientQuery.error || !patient) {
        return (_jsx(PatientStateCard, { title: t('states.errorTitle'), description: getPatientApiMessage(patientQuery.error, t('errors.details')), children: _jsx(Button, { variant: "outline", onClick: () => patientQuery.refetch(), children: t('actions.retry') }) }));
    }
    const fields = [
        { label: t('fields.firstName'), value: patient.firstName },
        { label: t('fields.lastName'), value: patient.lastName },
        { label: t('fields.dateOfBirth'), value: formatPatientDate(patient.dateOfBirth, i18n.language) },
        { label: t('fields.gender'), value: t(`genders.${patient.gender}`) },
        { label: t('fields.phoneNumber'), value: patient.phoneNumber },
        { label: t('fields.bloodType'), value: patient.bloodType },
        { label: t('fields.address'), value: patient.address, full: true },
    ];
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: [patient.firstName, " ", patient.lastName] }), _jsx(Badge, { children: patient.bloodType })] }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('details.description') })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => navigate('/app/patients'), children: t('actions.back') }), _jsx(Button, { variant: "secondary", onClick: () => navigate(`/app/patients/${patient.id}/edit`), children: t('actions.edit') }), isAdmin ? (_jsx(Button, { variant: "danger", loading: deletePatient.isPending, onClick: handleDelete, children: t('actions.delete') })) : null] })] }), _jsxs(Card, { title: t('details.title'), description: t('details.description'), children: [actionError ? _jsx("p", { className: "mb-4 text-sm text-danger", children: actionError }) : null, _jsx("div", { className: "grid gap-4 md:grid-cols-2", children: fields.map((field) => (_jsxs("div", { className: field.full ? 'md:col-span-2' : undefined, children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: field.label }), _jsx("p", { className: "mt-1 break-words text-sm text-foreground", children: field.value })] }, field.label))) })] })] }));
}
