import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { isAdminUser } from '@/domain/auth/role.utils';
import { useDepartments } from '@/domain/departments/departments.hooks';
import { useDeleteRoom, useRooms } from '@/domain/rooms/rooms.hooks';
import { getRoomApiMessage, getRoomApiStatus, getRoomStatusBadgeVariant, isKnownRoomStatus, isKnownRoomType, normalizeRoomStatus, normalizeRoomType, } from '@/domain/rooms/rooms.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import Select from '@/ui/atoms/Select';
import RoomStateCard from './state-card';
function getDepartmentLabel(name, location) {
    return location.trim() ? `${name} (${location})` : name;
}
export default function RoomsListPage() {
    const { t } = useTranslation('rooms');
    const navigate = useNavigate();
    const location = useLocation();
    const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
    const isAdmin = isAdminUser(roles);
    const [searchParams, setSearchParams] = useSearchParams();
    const departmentId = searchParams.get('departmentId')?.trim() ?? '';
    const type = normalizeRoomType(searchParams.get('type'));
    const availability = searchParams.get('availability')?.trim().toLowerCase() ?? '';
    const onlyAvailable = availability === 'available';
    const roomsQuery = useRooms({
        departmentId,
        type,
        onlyAvailable,
    });
    const departmentsQuery = useDepartments();
    const deleteRoom = useDeleteRoom();
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');
    const status = getRoomApiStatus(roomsQuery.error);
    const hasFilters = !!departmentId || !!type || onlyAvailable;
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
    const handleDelete = async (id) => {
        if (!window.confirm(t('details.deleteConfirm'))) {
            return;
        }
        setActionError('');
        setActionSuccess('');
        try {
            await deleteRoom.mutateAsync(id);
            setActionSuccess(t('messages.deleted'));
        }
        catch (error) {
            setActionError(getRoomApiMessage(error, t('errors.delete')));
        }
    };
    const getTypeLabel = (value) => {
        const normalized = normalizeRoomType(value);
        return isKnownRoomType(normalized) ? t(`types.${normalized}`) : value || t('labels.notAvailable');
    };
    const getStatusLabel = (value) => {
        const normalized = normalizeRoomStatus(value);
        return isKnownRoomStatus(normalized)
            ? t(`statuses.${normalized}`)
            : value || t('labels.notAvailable');
    };
    let content = null;
    if (roomsQuery.isLoading) {
        content = (_jsx(RoomStateCard, { title: t('states.loadingTitle'), description: t('states.loadingDescription') }));
    }
    else if (status === 401) {
        content = (_jsx(RoomStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    else if (status === 403) {
        content = (_jsx(RoomStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    else if (roomsQuery.error) {
        content = (_jsx(RoomStateCard, { title: t('states.errorTitle'), description: getRoomApiMessage(roomsQuery.error, t('errors.list')), children: _jsx(Button, { variant: "outline", onClick: () => roomsQuery.refetch(), children: t('actions.retry') }) }));
    }
    else if (!roomsQuery.data?.length) {
        content = (_jsx(RoomStateCard, { title: hasFilters ? t('states.emptyFilteredTitle') : t('states.emptyTitle'), description: hasFilters ? t('states.emptyFilteredDescription') : t('states.emptyDescription'), children: hasFilters ? (_jsx(Button, { type: "button", variant: "outline", onClick: () => updateParams({ departmentId: null, type: null, availability: null }), children: t('actions.clear') })) : isAdmin ? (_jsx(Button, { onClick: () => navigate('/app/rooms/new'), children: t('actions.create') })) : null }));
    }
    else {
        content = (_jsx("div", { className: "grid gap-4 xl:grid-cols-2", children: roomsQuery.data.map((room) => (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/50 p-5 transition-shadow duration-200 hover:shadow-soft", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsx("h2", { className: "truncate text-lg font-semibold text-foreground", children: room.roomNumber }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: room.department?.name || t('labels.noDepartment') })] }), _jsx(Badge, { variant: getRoomStatusBadgeVariant(room.status), children: getStatusLabel(room.status) })] }), _jsxs("div", { className: "mt-4 grid gap-3 text-sm md:grid-cols-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.department') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: room.department?.name || t('labels.noDepartment') })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.type') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: getTypeLabel(room.type) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.capacity') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: room.capacity })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.activeAdmissionsCount') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: room.activeAdmissionsCount })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.occupiedSummary') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: t('labels.occupiedSummary', {
                                            occupied: room.activeAdmissionsCount,
                                            capacity: room.capacity,
                                        }) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: t('fields.availableCapacity') }), _jsx("p", { className: "mt-1 break-words text-foreground", children: t('labels.availableSummary', { count: room.availableCapacity }) })] })] }), isAdmin ? (_jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [_jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/app/rooms/${room.id}`), children: t('actions.view') }), _jsx(Button, { size: "sm", variant: "secondary", onClick: () => navigate(`/app/rooms/${room.id}/edit`), children: t('actions.edit') }), _jsx(Button, { size: "sm", variant: "danger", loading: deleteRoom.isPending && deleteRoom.variables === room.id, onClick: () => handleDelete(room.id), children: t('actions.delete') })] })) : (_jsx("div", { className: "mt-4 flex flex-wrap gap-2", children: _jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate(`/app/rooms/${room.id}`), children: t('actions.view') }) }))] }, room.id))) }));
    }
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: t('list.title') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('list.description') })] }), isAdmin ? _jsx(Button, { onClick: () => navigate('/app/rooms/new'), children: t('actions.create') }) : null] }), _jsx(Card, { title: t('filters.title'), description: t('filters.description'), children: _jsxs("div", { className: "space-y-4", children: [departmentsQuery.error ? (_jsxs("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: [_jsx("div", { children: getRoomApiMessage(departmentsQuery.error, t('errors.departments')) }), _jsx(Button, { size: "sm", variant: "outline", className: "mt-3", onClick: () => departmentsQuery.refetch(), children: t('actions.retry') })] })) : null, _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { type: "button", size: "sm", variant: onlyAvailable ? 'outline' : 'secondary', onClick: () => updateParams({
                                        departmentId: departmentId || null,
                                        type: type || null,
                                        availability: null,
                                    }), children: t('actions.showAll') }), _jsx(Button, { type: "button", size: "sm", variant: onlyAvailable ? 'secondary' : 'outline', onClick: () => updateParams({
                                        departmentId: departmentId || null,
                                        type: type || null,
                                        availability: 'available',
                                    }), children: t('actions.showAvailable') })] }), _jsxs("div", { className: "grid gap-3 md:grid-cols-[minmax(0,1fr),220px,auto]", children: [_jsxs(Select, { name: "departmentId", label: t('fields.department'), value: departmentId, disabled: departmentsQuery.isLoading || !!departmentsQuery.error, onChange: (event) => updateParams({
                                        departmentId: event.target.value || null,
                                        type: type || null,
                                        availability: onlyAvailable ? 'available' : null,
                                    }), children: [_jsx("option", { value: "", children: departmentsQuery.isLoading
                                                ? t('labels.loadingDepartments')
                                                : t('filters.allDepartments') }), (departmentsQuery.data ?? []).map((department) => (_jsx("option", { value: department.id, children: getDepartmentLabel(department.name, department.location) }, department.id)))] }), _jsxs(Select, { name: "type", label: t('fields.type'), value: type, onChange: (event) => updateParams({
                                        departmentId: departmentId || null,
                                        type: event.target.value || null,
                                        availability: onlyAvailable ? 'available' : null,
                                    }), children: [_jsx("option", { value: "", children: t('filters.allTypes') }), _jsx("option", { value: "GENERAL", children: t('types.GENERAL') }), _jsx("option", { value: "ICU", children: t('types.ICU') }), _jsx("option", { value: "SURGERY", children: t('types.SURGERY') }), _jsx("option", { value: "EMERGENCY", children: t('types.EMERGENCY') }), _jsx("option", { value: "PEDIATRIC", children: t('types.PEDIATRIC') })] }), _jsx(Button, { type: "button", variant: "outline", className: "md:self-end", onClick: () => updateParams({ departmentId: null, type: null, availability: null }), children: t('actions.clear') })] })] }) }), _jsx(Card, { title: t('list.resultsTitle'), description: roomsQuery.data
                    ? t('list.results', { count: roomsQuery.data.length })
                    : t('list.resultsDescription'), children: _jsxs("div", { className: "space-y-4", children: [roomsQuery.isFetching && !roomsQuery.isLoading ? (_jsx("p", { className: "text-sm text-muted-foreground", children: t('list.refreshing') })) : null, actionSuccess ? (_jsx("div", { className: "rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success", children: actionSuccess })) : null, actionError ? (_jsx("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: actionError })) : null, content] }) })] }));
}
