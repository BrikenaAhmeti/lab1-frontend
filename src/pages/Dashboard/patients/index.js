import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { useDeletePatient, usePatients } from '@/domain/patients/patients.hooks';
import { formatPatientDate, getPatientApiMessage, getPatientApiStatus, patientPageSizes, } from '@/domain/patients/patients.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Input from '@/ui/atoms/Input';
import Select from '@/ui/atoms/Select';
import PatientStateCard from './state-card';
function getPositiveNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
function getLimitNumber(value, fallback) {
    const parsed = Number(value);
    return patientPageSizes.includes(parsed) ? parsed : fallback;
}
function getIsAdmin(roles) {
    const storedRole = localStorage.getItem('role');
    const allRoles = [...roles, ...(storedRole ? [storedRole] : [])].map((role) => role.toUpperCase());
    return allRoles.includes('ADMIN') || allRoles.includes('ADMINS');
}
export default function PatientsListPage() {
    const { t, i18n } = useTranslation('patients');
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
    const isAdmin = getIsAdmin(roles);
    const page = getPositiveNumber(searchParams.get('page'), 1);
    const limit = getLimitNumber(searchParams.get('limit'), 10);
    const search = searchParams.get('search')?.trim() ?? '';
    const [searchValue, setSearchValue] = useState(search);
    const [actionError, setActionError] = useState('');
    const patientsQuery = usePatients({ page, limit, search });
    const deletePatient = useDeletePatient();
    useEffect(() => {
        setSearchValue(search);
    }, [search]);
    useEffect(() => {
        if (!patientsQuery.data) {
            return;
        }
        if (patientsQuery.data.totalPages > 0 && page > patientsQuery.data.totalPages) {
            const next = new URLSearchParams(searchParams);
            next.set('page', String(patientsQuery.data.totalPages));
            setSearchParams(next);
        }
    }, [page, patientsQuery.data, searchParams, setSearchParams]);
    const status = getPatientApiStatus(patientsQuery.error);
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
    const handleSearch = (event) => {
        event.preventDefault();
        updateParams({
            search: searchValue.trim() || null,
            page: '1',
            limit: String(limit),
        });
    };
    const handleClear = () => {
        setSearchValue('');
        updateParams({
            search: null,
            page: '1',
            limit: String(limit),
        });
    };
    const handleLimitChange = (value) => {
        updateParams({
            search: search || null,
            page: '1',
            limit: value,
        });
    };
    const handleDelete = async (id) => {
        if (!window.confirm(t('details.deleteConfirm'))) {
            return;
        }
        setActionError('');
        try {
            const shouldGoBack = patientsQuery.data?.items.length === 1 && page > 1;
            await deletePatient.mutateAsync(id);
            if (shouldGoBack) {
                updateParams({
                    search: search || null,
                    page: String(page - 1),
                    limit: String(limit),
                });
            }
        }
        catch (error) {
            setActionError(getPatientApiMessage(error, t('errors.delete')));
        }
    };
    let content = null;
    if (patientsQuery.isLoading) {
        content = (_jsx(PatientStateCard, { title: t('states.loadingTitle'), description: t('states.loadingDescription') }));
    }
    else if (status === 401) {
        content = (_jsx(PatientStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    else if (status === 403) {
        content = (_jsx(PatientStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    else if (patientsQuery.error) {
        content = (_jsx(PatientStateCard, { title: t('states.errorTitle'), description: getPatientApiMessage(patientsQuery.error, t('errors.list')), children: _jsx(Button, { variant: "outline", onClick: () => patientsQuery.refetch(), children: t('actions.retry') }) }));
    }
    else if (!patientsQuery.data?.items.length) {
        content = (_jsx(PatientStateCard, { title: t('states.emptyTitle'), description: t('states.emptyDescription') }));
    }
    else {
        content = (_jsx("div", { className: "space-y-3", children: patientsQuery.data.items.map((patient) => (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/50 p-4", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("h2", { className: "truncate text-lg font-semibold text-foreground", children: [patient.firstName, " ", patient.lastName] }), _jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [formatPatientDate(patient.dateOfBirth, i18n.language), " \u00B7 ", t(`genders.${patient.gender}`)] })] }), _jsx(Badge, { children: patient.bloodType })] }), _jsxs("div", { className: "mt-4 grid gap-3 text-sm md:grid-cols-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.phoneNumber') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: patient.phoneNumber })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.address') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: patient.address })] })] }), _jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/app/patients/${patient.id}`), children: t('actions.view') }), _jsx(Button, { size: "sm", variant: "secondary", onClick: () => navigate(`/app/patients/${patient.id}/edit`), children: t('actions.edit') }), isAdmin ? (_jsx(Button, { size: "sm", variant: "danger", loading: deletePatient.isPending && deletePatient.variables === patient.id, onClick: () => handleDelete(patient.id), children: t('actions.delete') })) : null] })] }, patient.id))) }));
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: t('list.title') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('list.description') })] }), _jsx(Button, { onClick: () => navigate('/app/patients/new'), children: t('actions.create') })] }), _jsx(Card, { title: t('list.filtersTitle'), description: t('list.filtersDescription'), children: _jsxs("form", { className: "grid gap-3 lg:grid-cols-[minmax(0,1fr),180px,auto,auto]", onSubmit: handleSearch, children: [_jsx(Input, { label: t('fields.search'), name: "search", value: searchValue, onChange: (event) => setSearchValue(event.target.value), placeholder: t('list.searchPlaceholder') }), _jsx(Select, { label: t('labels.limit'), name: "limit", value: String(limit), onChange: (event) => handleLimitChange(event.target.value), children: patientPageSizes.map((value) => (_jsx("option", { value: value, children: value }, value))) }), _jsx(Button, { type: "submit", className: "lg:self-end", children: t('actions.search') }), _jsx(Button, { type: "button", variant: "outline", className: "lg:self-end", onClick: handleClear, children: t('actions.clear') })] }) }), _jsx(Card, { title: t('list.resultsTitle'), description: patientsQuery.data
                    ? t('list.results', {
                        count: patientsQuery.data.items.length,
                        total: patientsQuery.data.total,
                    })
                    : t('list.resultsDescription'), footer: patientsQuery.data ? (_jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: t('list.page', {
                                page: patientsQuery.data.page,
                                totalPages: Math.max(patientsQuery.data.totalPages, 1),
                            }) }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", disabled: page <= 1 || patientsQuery.isFetching, onClick: () => updateParams({
                                        search: search || null,
                                        page: String(page - 1),
                                        limit: String(limit),
                                    }), children: t('actions.previous') }), _jsx(Button, { size: "sm", variant: "outline", disabled: patientsQuery.data.totalPages === 0 ||
                                        page >= patientsQuery.data.totalPages ||
                                        patientsQuery.isFetching, onClick: () => updateParams({
                                        search: search || null,
                                        page: String(page + 1),
                                        limit: String(limit),
                                    }), children: t('actions.next') })] })] })) : null, children: _jsxs("div", { className: "space-y-4", children: [patientsQuery.isFetching && !patientsQuery.isLoading ? (_jsx("p", { className: "text-sm text-muted-foreground", children: t('list.refreshing') })) : null, actionError ? _jsx("p", { className: "text-sm text-danger", children: actionError }) : null, content] }) })] }));
}
