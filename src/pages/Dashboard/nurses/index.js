import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDepartments } from '@/domain/departments/departments.hooks';
import { useDeleteNurse, useNurses } from '@/domain/nurses/nurses.hooks';
import { getNurseApiMessage, getNurseApiStatus, getNurseFullName, getNurseShiftBadgeVariant, isKnownNurseShift, normalizeNurseShift, } from '@/domain/nurses/nurses.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Select from '@/ui/atoms/Select';
import NurseStateCard from './state-card';
function getDepartmentLabel(name, location) {
    return location.trim() ? `${name} (${location})` : name;
}
export default function NursesListPage() {
    const { t } = useTranslation('nurses');
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const departmentId = searchParams.get('departmentId')?.trim() ?? '';
    const shift = normalizeNurseShift(searchParams.get('shift'));
    const nursesQuery = useNurses({ departmentId });
    const departmentsQuery = useDepartments();
    const deleteNurse = useDeleteNurse();
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');
    const status = getNurseApiStatus(nursesQuery.error);
    useEffect(() => {
        const successMessage = location.state?.success;
        if (typeof successMessage !== 'string' || !successMessage.trim()) {
            return;
        }
        setActionSuccess(successMessage);
        navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
    }, [location.pathname, location.search, location.state, navigate]);
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
    const getShiftLabel = (value) => {
        const normalized = normalizeNurseShift(value);
        if (isKnownNurseShift(normalized)) {
            return t(`shifts.${normalized}`);
        }
        return value || t('labels.notAvailable');
    };
    const displayedNurses = useMemo(() => {
        const nurses = nursesQuery.data ?? [];
        if (!shift) {
            return nurses;
        }
        return nurses.filter((nurse) => normalizeNurseShift(nurse.shift) === shift);
    }, [nursesQuery.data, shift]);
    const handleDelete = async (id) => {
        if (!window.confirm(t('details.deleteConfirm'))) {
            return;
        }
        setActionError('');
        setActionSuccess('');
        try {
            await deleteNurse.mutateAsync(id);
            setActionSuccess(t('messages.deleted'));
        }
        catch (error) {
            setActionError(getNurseApiMessage(error, t('errors.delete')));
        }
    };
    let content = null;
    if (nursesQuery.isLoading) {
        content = (_jsx(NurseStateCard, { title: t('states.loadingTitle'), description: t('states.loadingDescription') }));
    }
    else if (status === 401) {
        content = (_jsx(NurseStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    else if (status === 403) {
        content = (_jsx(NurseStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    else if (nursesQuery.error) {
        content = (_jsx(NurseStateCard, { title: t('states.errorTitle'), description: getNurseApiMessage(nursesQuery.error, t('errors.list')), children: _jsx(Button, { variant: "outline", onClick: () => nursesQuery.refetch(), children: t('actions.retry') }) }));
    }
    else if (!nursesQuery.data?.length) {
        content = (_jsx(NurseStateCard, { title: t('states.emptyTitle'), description: t('states.emptyDescription'), children: _jsx(Button, { onClick: () => navigate('/app/nurses/new'), children: t('actions.create') }) }));
    }
    else if (!displayedNurses.length) {
        content = (_jsx(NurseStateCard, { title: t('states.emptyFilteredTitle'), description: t('states.emptyFilteredDescription'), children: _jsx(Button, { type: "button", variant: "outline", onClick: () => updateParams({ departmentId, shift: null }), children: t('actions.clearShift') }) }));
    }
    else {
        content = (_jsx("div", { className: "grid gap-4 xl:grid-cols-2", children: displayedNurses.map((nurse) => (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/50 p-5 transition-shadow duration-200 hover:shadow-soft", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("h2", { className: "truncate text-lg font-semibold text-foreground", children: getNurseFullName(nurse) }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: nurse.department?.name || t('labels.noDepartment') })] }), _jsx(Badge, { variant: getNurseShiftBadgeVariant(nurse.shift), children: getShiftLabel(nurse.shift) })] }), _jsxs("div", { className: "mt-4 grid gap-3 text-sm md:grid-cols-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.firstName') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: nurse.firstName })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.lastName') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: nurse.lastName })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.department') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: nurse.department?.name || t('labels.noDepartment') })] })] }), _jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/app/nurses/${nurse.id}`), children: t('actions.view') }), _jsx(Button, { size: "sm", variant: "secondary", onClick: () => navigate(`/app/nurses/${nurse.id}/edit`), children: t('actions.edit') }), _jsx(Button, { size: "sm", variant: "danger", loading: deleteNurse.isPending && deleteNurse.variables === nurse.id, onClick: () => handleDelete(nurse.id), children: t('actions.delete') })] })] }, nurse.id))) }));
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: t('list.title') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('list.description') })] }), _jsx(Button, { onClick: () => navigate('/app/nurses/new'), children: t('actions.create') })] }), _jsx(Card, { title: t('filters.title'), description: t('filters.description'), children: _jsxs("div", { className: "space-y-4", children: [departmentsQuery.error ? (_jsxs("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: [_jsx("div", { children: getNurseApiMessage(departmentsQuery.error, t('errors.departments')) }), _jsx(Button, { size: "sm", variant: "outline", className: "mt-3", onClick: () => departmentsQuery.refetch(), children: t('actions.retry') })] })) : null, _jsxs("div", { className: "grid gap-3 md:grid-cols-[minmax(0,1fr),220px,auto]", children: [_jsxs(Select, { name: "departmentId", label: t('fields.department'), value: departmentId, disabled: departmentsQuery.isLoading || !!departmentsQuery.error, onChange: (event) => updateParams({
                                        departmentId: event.target.value || null,
                                        shift: shift || null,
                                    }), children: [_jsx("option", { value: "", children: departmentsQuery.isLoading ? t('labels.loadingDepartments') : t('filters.allDepartments') }), (departmentsQuery.data ?? []).map((department) => (_jsx("option", { value: department.id, children: getDepartmentLabel(department.name, department.location) }, department.id)))] }), _jsxs(Select, { name: "shift", label: t('fields.shift'), value: shift, onChange: (event) => updateParams({
                                        departmentId: departmentId || null,
                                        shift: event.target.value || null,
                                    }), children: [_jsx("option", { value: "", children: t('filters.allShifts') }), _jsx("option", { value: "Morning", children: t('shifts.Morning') }), _jsx("option", { value: "Evening", children: t('shifts.Evening') }), _jsx("option", { value: "Night", children: t('shifts.Night') })] }), _jsx(Button, { type: "button", variant: "outline", className: "md:self-end", onClick: () => updateParams({ departmentId: null, shift: null }), children: t('actions.clear') })] })] }) }), _jsx(Card, { title: t('list.resultsTitle'), description: nursesQuery.data
                    ? t('list.results', { count: displayedNurses.length })
                    : t('list.resultsDescription'), children: _jsxs("div", { className: "space-y-4", children: [nursesQuery.isFetching && !nursesQuery.isLoading ? (_jsx("p", { className: "text-sm text-muted-foreground", children: t('list.refreshing') })) : null, actionSuccess ? (_jsx("div", { className: "rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success", children: actionSuccess })) : null, actionError ? (_jsx("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: actionError })) : null, content] }) })] }));
}
