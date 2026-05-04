import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteDepartment, useDepartment, useDepartmentDoctors, useDepartmentNurses, useDepartmentRooms, } from '@/domain/departments/departments.hooks';
import { formatDepartmentDate, getDepartmentApiMessage, getDepartmentApiStatus, } from '@/domain/departments/departments.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import DepartmentStateCard from './state-card';
function formatFieldLabel(value) {
    return value
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^./, (character) => character.toUpperCase());
}
function getItemTitle(item, kind, index) {
    const firstName = typeof item.firstName === 'string' ? item.firstName.trim() : '';
    const lastName = typeof item.lastName === 'string' ? item.lastName.trim() : '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    if (fullName) {
        return fullName;
    }
    const titleCandidates = kind === 'room'
        ? [item.name, item.roomNumber, item.number, item.code]
        : [item.name, item.fullName, item.email];
    const title = titleCandidates.find((value) => typeof value === 'string' && value.trim());
    if (typeof title === 'string') {
        return title;
    }
    if (kind === 'doctor') {
        return `Doctor ${index + 1}`;
    }
    if (kind === 'nurse') {
        return `Nurse ${index + 1}`;
    }
    return `Room ${index + 1}`;
}
function getItemEntries(item) {
    return Object.entries(item ?? {}).filter(([key, value]) => {
        if (['id', 'firstName', 'lastName', 'name', 'fullName', 'createdAt', 'updatedAt'].includes(key)) {
            return false;
        }
        if (value === null || value === undefined || value === '') {
            return false;
        }
        if (Array.isArray(value) || typeof value === 'object') {
            return false;
        }
        return true;
    });
}
function SectionState({ title, description, children, }) {
    return (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/45 p-4", children: [_jsx("h3", { className: "text-sm font-semibold text-foreground", children: title }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: description }), children ? _jsx("div", { className: "mt-4", children: children }) : null] }));
}
export default function DepartmentDetailsPage() {
    const { t, i18n } = useTranslation('departments');
    const navigate = useNavigate();
    const { id = '' } = useParams();
    const departmentQuery = useDepartment(id);
    const doctorsQuery = useDepartmentDoctors(id);
    const nursesQuery = useDepartmentNurses(id);
    const roomsQuery = useDepartmentRooms(id);
    const deleteDepartment = useDeleteDepartment();
    const [actionError, setActionError] = useState('');
    const status = getDepartmentApiStatus(departmentQuery.error);
    const department = departmentQuery.data;
    const handleDelete = async () => {
        if (!window.confirm(t('details.deleteConfirm'))) {
            return;
        }
        setActionError('');
        try {
            await deleteDepartment.mutateAsync(id);
            navigate('/app/departments', {
                replace: true,
                state: { success: t('messages.deleted') },
            });
        }
        catch (error) {
            setActionError(getDepartmentApiMessage(error, t('errors.delete')));
        }
    };
    const renderRelatedItems = (query, kind, emptyTitle, emptyDescription, errorFallback) => {
        if (query.isLoading) {
            return (_jsx(SectionState, { title: kind === 'doctor'
                    ? t('details.loadingDoctorsTitle')
                    : kind === 'nurse'
                        ? t('details.loadingNursesTitle')
                        : t('details.loadingRoomsTitle'), description: kind === 'doctor'
                    ? t('details.loadingDoctorsDescription')
                    : kind === 'nurse'
                        ? t('details.loadingNursesDescription')
                        : t('details.loadingRoomsDescription') }));
        }
        if (query.error) {
            return (_jsx(SectionState, { title: t('states.errorTitle'), description: getDepartmentApiMessage(query.error, errorFallback), children: _jsx(Button, { size: "sm", variant: "outline", onClick: () => query.refetch(), children: t('actions.retry') }) }));
        }
        if (!query.data?.length) {
            return _jsx(SectionState, { title: emptyTitle, description: emptyDescription });
        }
        return (_jsx("div", { className: "space-y-3", children: query.data.map((item, index) => {
                const entries = getItemEntries(item);
                const itemKey = typeof item.id === 'string' || typeof item.id === 'number'
                    ? item.id
                    : `${kind}-${index}`;
                return (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/45 p-4", children: [_jsx("h3", { className: "text-sm font-semibold text-foreground", children: getItemTitle(item, kind, index) }), entries.length ? (_jsx("div", { className: "mt-3 grid gap-3 text-sm sm:grid-cols-2", children: entries.map(([key, value]) => (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: formatFieldLabel(key) }), _jsx("p", { className: "mt-1 break-words text-foreground", children: String(value) })] }, key))) })) : (_jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: t('labels.noData') }))] }, itemKey));
            }) }));
    };
    if (departmentQuery.isLoading) {
        return (_jsx(DepartmentStateCard, { title: t('states.loadingDepartmentTitle'), description: t('states.loadingDepartmentDescription') }));
    }
    if (status === 401) {
        return (_jsx(DepartmentStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    if (status === 403) {
        return (_jsx(DepartmentStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    if (status === 404) {
        return (_jsx(DepartmentStateCard, { title: t('details.notFoundTitle'), description: t('details.notFoundDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/departments'), children: t('actions.back') }) }));
    }
    if (departmentQuery.error || !department) {
        return (_jsx(DepartmentStateCard, { title: t('states.errorTitle'), description: getDepartmentApiMessage(departmentQuery.error, t('errors.details')), children: _jsx(Button, { variant: "outline", onClick: () => departmentQuery.refetch(), children: t('actions.retry') }) }));
    }
    const fields = [
        { label: t('fields.location'), value: department.location },
        {
            label: t('fields.status'),
            value: department.isActive === false ? t('labels.inactive') : t('labels.active'),
        },
        {
            label: t('fields.createdAt'),
            value: formatDepartmentDate(department.createdAt, i18n.language) || t('labels.notAvailable'),
        },
        {
            label: t('fields.updatedAt'),
            value: formatDepartmentDate(department.updatedAt, i18n.language) || t('labels.notAvailable'),
        },
        {
            label: t('fields.description'),
            value: department.description?.trim() || t('labels.noDescription'),
            full: true,
        },
    ];
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: department.name }), _jsx(Badge, { variant: department.isActive === false ? 'warning' : 'success', children: department.isActive === false ? t('labels.inactive') : t('labels.active') })] }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('details.description') })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => navigate('/app/departments'), children: t('actions.back') }), _jsx(Button, { variant: "secondary", onClick: () => navigate(`/app/departments/${department.id}/edit`), children: t('actions.edit') }), _jsx(Button, { variant: "danger", loading: deleteDepartment.isPending, onClick: handleDelete, children: t('actions.delete') })] })] }), _jsxs(Card, { title: t('details.title'), description: t('details.description'), children: [actionError ? (_jsx("div", { className: "mb-4 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: actionError })) : null, _jsx("div", { className: "grid gap-4 md:grid-cols-2", children: fields.map((field) => (_jsxs("div", { className: field.full ? 'md:col-span-2' : undefined, children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: field.label }), _jsx("p", { className: "mt-1 break-words text-sm text-foreground", children: field.value })] }, field.label))) })] }), _jsxs("div", { className: "grid gap-4 xl:grid-cols-3", children: [_jsx(Card, { title: t('details.doctorsTitle'), description: t('details.relatedCount', { count: doctorsQuery.data?.length ?? 0 }), className: "h-full", children: renderRelatedItems(doctorsQuery, 'doctor', t('details.noDoctorsTitle'), t('details.noDoctorsDescription'), t('errors.doctors')) }), _jsx(Card, { title: t('details.nursesTitle'), description: t('details.relatedCount', { count: nursesQuery.data?.length ?? 0 }), className: "h-full", children: renderRelatedItems(nursesQuery, 'nurse', t('details.noNursesTitle'), t('details.noNursesDescription'), t('errors.nurses')) }), _jsx(Card, { title: t('details.roomsTitle'), description: t('details.relatedCount', { count: roomsQuery.data?.length ?? 0 }), className: "h-full", children: renderRelatedItems(roomsQuery, 'room', t('details.noRoomsTitle'), t('details.noRoomsDescription'), t('errors.rooms')) })] })] }));
}
