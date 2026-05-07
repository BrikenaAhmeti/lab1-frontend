import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { getAdmissionStatusVariant } from '@/domain/admissions/admissions.utils';
import { isAdminUser } from '@/domain/auth/role.utils';
import { useRoom } from '@/domain/rooms/rooms.hooks';
import { getRoomApiMessage, getRoomApiStatus, getRoomStatusBadgeVariant, isKnownRoomStatus, isKnownRoomType, normalizeRoomStatus, normalizeRoomType, } from '@/domain/rooms/rooms.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
import RoomStateCard from './state-card';
function getPatientName(patient) {
    const firstName = typeof patient?.firstName === 'string' ? patient.firstName.trim() : '';
    const lastName = typeof patient?.lastName === 'string' ? patient.lastName.trim() : '';
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
    return fullName || '';
}
function getAdmissionDateValue(admission) {
    return admission.admissionDate || admission.admittedAt || admission.createdAt || '';
}
function formatAdmissionDate(value, language) {
    if (!value) {
        return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat(language, {
        dateStyle: 'medium',
    }).format(date);
}
export default function RoomDetailsPage() {
    const { t, i18n } = useTranslation('rooms');
    const navigate = useNavigate();
    const { id = '' } = useParams();
    const roles = useAppSelector((state) => state.auth.user?.roles ?? []);
    const isAdmin = isAdminUser(roles);
    const roomQuery = useRoom(id);
    const status = getRoomApiStatus(roomQuery.error);
    const room = roomQuery.data;
    if (roomQuery.isLoading) {
        return (_jsx(RoomStateCard, { title: t('states.loadingRoomTitle'), description: t('states.loadingRoomDescription') }));
    }
    if (status === 401) {
        return (_jsx(RoomStateCard, { title: t('states.unauthorizedTitle'), description: t('states.unauthorizedDescription') }));
    }
    if (status === 403) {
        return (_jsx(RoomStateCard, { title: t('states.forbiddenTitle'), description: t('states.forbiddenDescription') }));
    }
    if (status === 404) {
        return (_jsx(RoomStateCard, { title: t('details.notFoundTitle'), description: t('details.notFoundDescription'), children: _jsx(Button, { variant: "outline", onClick: () => navigate('/app/rooms'), children: t('actions.back') }) }));
    }
    if (roomQuery.error || !room) {
        return (_jsx(RoomStateCard, { title: t('states.errorTitle'), description: getRoomApiMessage(roomQuery.error, t('errors.details')), children: _jsx(Button, { variant: "outline", onClick: () => roomQuery.refetch(), children: t('actions.retry') }) }));
    }
    const normalizedType = normalizeRoomType(room.type);
    const normalizedStatus = normalizeRoomStatus(room.status);
    const currentAdmissions = room.currentAdmissions ?? [];
    const fields = [
        { label: t('fields.department'), value: room.department?.name || t('labels.noDepartment') },
        {
            label: t('fields.departmentLocation'),
            value: room.department?.location || t('labels.notAvailable'),
        },
        {
            label: t('fields.type'),
            value: isKnownRoomType(normalizedType)
                ? t(`types.${normalizedType}`)
                : room.type || t('labels.notAvailable'),
        },
        { label: t('fields.capacity'), value: String(room.capacity) },
        {
            label: t('fields.occupiedSummary'),
            value: t('labels.occupiedSummary', {
                occupied: room.activeAdmissionsCount,
                capacity: room.capacity,
            }),
        },
        {
            label: t('fields.availableCapacity'),
            value: t('labels.availableSummary', { count: room.availableCapacity }),
        },
    ];
    return (_jsxs("section", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("h1", { className: "text-2xl font-bold text-foreground md:text-3xl", children: room.roomNumber }), _jsx(Badge, { variant: getRoomStatusBadgeVariant(room.status), children: isKnownRoomStatus(normalizedStatus)
                                            ? t(`statuses.${normalizedStatus}`)
                                            : room.status || t('labels.notAvailable') })] }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('details.description') })] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => navigate('/app/rooms'), children: t('actions.back') }), room.departmentId ? (_jsx(Button, { variant: "ghost", onClick: () => navigate(`/app/departments/${room.departmentId}`), children: t('actions.viewDepartment') })) : null, isAdmin ? (_jsx(Button, { variant: "secondary", onClick: () => navigate(`/app/rooms/${room.id}/edit`), children: t('actions.edit') })) : null] })] }), _jsx(Card, { title: t('details.title'), description: t('details.description'), children: _jsx("div", { className: "grid gap-4 md:grid-cols-2", children: fields.map((field) => (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: field.label }), _jsx("p", { className: "mt-1 break-words text-sm text-foreground", children: field.value })] }, field.label))) }) }), _jsx(Card, { title: t('details.currentAdmissionsTitle'), description: t('details.currentAdmissionsDescription', { count: currentAdmissions.length }), children: !currentAdmissions.length ? (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/45 px-4 py-5", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: t('details.noAdmissionsTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('details.noAdmissionsDescription') })] })) : (_jsx("div", { className: "space-y-3", children: currentAdmissions.map((admission) => {
                        const patientName = getPatientName(admission.patient) || t('labels.notAvailable');
                        const admissionDate = formatAdmissionDate(getAdmissionDateValue(admission), i18n.language) || t('labels.notAvailable');
                        const admissionStatus = normalizeRoomStatus(admission.status);
                        return (_jsx("div", { className: "rounded-2xl border border-border/70 bg-background/45 p-4", children: _jsxs("div", { className: "flex flex-wrap items-start justify-between gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: patientName }), _jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [t('fields.admissionDate'), ": ", admissionDate] })] }), _jsx(Badge, { variant: getAdmissionStatusVariant(admission.status || ''), children: isKnownRoomStatus(admissionStatus)
                                            ? t(`statuses.${admissionStatus}`)
                                            : admission.status || t('labels.notAvailable') })] }) }, admission.id));
                    }) })) })] }));
}
