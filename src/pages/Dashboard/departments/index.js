import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDeleteDepartment, useDepartments } from '@/domain/departments/departments.hooks';
import { formatDepartmentDate, getDepartmentApiMessage, getDepartmentApiStatus, } from '@/domain/departments/departments.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import DepartmentStateCard from './state-card';
export default function DepartmentsListPage() {
    const { t, i18n } = useTranslation('departments');
    const navigate = useNavigate();
    const location = useLocation();
    const departmentsQuery = useDepartments();
    const deleteDepartment = useDeleteDepartment();
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');
    const status = getDepartmentApiStatus(departmentsQuery.error);
    useEffect(() => {
        const successMessage = location.state?.success;
        if (typeof successMessage !== 'string' || !successMessage.trim()) {
            return;
        }
        setActionSuccess(successMessage);
        navigate(location.pathname, { replace: true, state: null });
    }, [location.pathname, location.state, navigate]);
    const handleDelete = async (id) => {
        if (!window.confirm(t('details.deleteConfirm'))) {
            return;
        }
        setActionError('');
        setActionSuccess('');
        try {
            await deleteDepartment.mutateAsync(id);
            setActionSuccess(t('messages.deleted'));
        }
        catch (error) {
            setActionError(getDepartmentApiMessage(error, t('errors.delete')));
        }
    };
    let content = null;
    if (departmentsQuery.isLoading) {
        content = (_jsx(DepartmentStateCard, { title: t('states.loadingTitle'), description: t('states.loadingDescription') }));
    }
    else if (status === 401) {
        content = (_jsx(DepartmentStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    else if (status === 403) {
        content = (_jsx(DepartmentStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    else if (departmentsQuery.error) {
        content = (_jsx(DepartmentStateCard, { title: t('states.errorTitle'), description: getDepartmentApiMessage(departmentsQuery.error, t('errors.list')), children: _jsx(Button, { variant: "outline", onClick: () => departmentsQuery.refetch(), children: t('actions.retry') }) }));
    }
    else if (!departmentsQuery.data?.length) {
        content = (_jsx(DepartmentStateCard, { title: t('states.emptyTitle'), description: t('states.emptyDescription'), children: _jsx(Button, { onClick: () => navigate('/app/departments/new'), children: t('actions.create') }) }));
    }
    else {
        content = (_jsx("div", { className: "grid gap-4 xl:grid-cols-2", children: departmentsQuery.data.map((department) => (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/50 p-5 transition-shadow duration-200 hover:shadow-soft", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("h2", { className: "truncate text-lg font-semibold text-foreground", children: department.name }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: department.location })] }), _jsx(Badge, { variant: department.isActive === false ? 'warning' : 'success', children: department.isActive === false ? t('labels.inactive') : t('labels.active') })] }), _jsxs("div", { className: "mt-4 grid gap-3 text-sm md:grid-cols-2", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.description') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: department.description?.trim() || t('labels.noDescription') })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.createdAt') }), _jsx("p", { className: "mt-1 text-foreground", children: formatDepartmentDate(department.createdAt, i18n.language) || t('labels.notAvailable') })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.updatedAt') }), _jsx("p", { className: "mt-1 text-foreground", children: formatDepartmentDate(department.updatedAt, i18n.language) || t('labels.notAvailable') })] })] }), _jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/app/departments/${department.id}`), children: t('actions.view') }), _jsx(Button, { size: "sm", variant: "secondary", onClick: () => navigate(`/app/departments/${department.id}/edit`), children: t('actions.edit') }), _jsx(Button, { size: "sm", variant: "danger", loading: deleteDepartment.isPending && deleteDepartment.variables === department.id, onClick: () => handleDelete(department.id), children: t('actions.delete') })] })] }, department.id))) }));
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: t('list.title') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('list.description') })] }), _jsx(Button, { onClick: () => navigate('/app/departments/new'), children: t('actions.create') })] }), _jsx(Card, { title: t('list.resultsTitle'), description: departmentsQuery.data
                    ? t('list.results', { count: departmentsQuery.data.length })
                    : t('list.resultsDescription'), children: _jsxs("div", { className: "space-y-4", children: [departmentsQuery.isFetching && !departmentsQuery.isLoading ? (_jsx("p", { className: "text-sm text-muted-foreground", children: t('list.refreshing') })) : null, actionSuccess ? (_jsx("div", { className: "rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success", children: actionSuccess })) : null, actionError ? (_jsx("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: actionError })) : null, content] }) })] }));
}
