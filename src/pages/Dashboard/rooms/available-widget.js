import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRooms } from '@/domain/rooms/rooms.hooks';
import { getRoomApiMessage, getRoomStatusBadgeVariant, isKnownRoomStatus, normalizeRoomStatus, } from '@/domain/rooms/rooms.utils';
import Badge from '@/ui/atoms/Badge';
import Button from '@/ui/atoms/Button';
import Card from '@/ui/atoms/Card';
export default function AvailableRoomsWidget() {
    const { t } = useTranslation('rooms');
    const navigate = useNavigate();
    const roomsQuery = useRooms({ onlyAvailable: true });
    const rooms = roomsQuery.data ?? [];
    const items = rooms.slice(0, 5);
    let content = null;
    if (roomsQuery.isLoading) {
        content = _jsx("p", { className: "text-sm text-muted-foreground", children: t('widget.loading') });
    }
    else if (roomsQuery.error) {
        content = (_jsxs("div", { className: "rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger", children: [_jsx("div", { children: getRoomApiMessage(roomsQuery.error, t('errors.available')) }), _jsx(Button, { size: "sm", variant: "outline", className: "mt-3", onClick: () => roomsQuery.refetch(), children: t('actions.retry') })] }));
    }
    else if (!rooms.length) {
        content = (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/45 px-4 py-5", children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: t('widget.emptyTitle') }), _jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: t('widget.emptyDescription') })] }));
    }
    else {
        content = (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "rounded-2xl border border-success/20 bg-success/10 px-4 py-4", children: [_jsx("p", { className: "text-sm text-muted-foreground", children: t('widget.countLabel') }), _jsx("p", { className: "mt-1 text-3xl font-bold text-foreground", children: rooms.length })] }), items.map((room) => {
                    const normalizedStatus = normalizeRoomStatus(room.status);
                    return (_jsxs("div", { className: "rounded-2xl border border-border/70 bg-background/45 p-4", children: [_jsxs("div", { className: "flex flex-wrap items-start justify-between gap-2", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-foreground", children: room.roomNumber }), _jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: room.department?.name || t('labels.noDepartment') })] }), _jsx(Badge, { variant: getRoomStatusBadgeVariant(room.status), children: isKnownRoomStatus(normalizedStatus)
                                            ? t(`statuses.${normalizedStatus}`)
                                            : room.status || t('labels.notAvailable') })] }), _jsxs("p", { className: "mt-3 text-sm text-muted-foreground", children: [t('labels.availableSummary', { count: room.availableCapacity }), " \u00B7", ' ', t('labels.occupiedSummary', {
                                        occupied: room.activeAdmissionsCount,
                                        capacity: room.capacity,
                                    })] })] }, room.id));
                })] }));
    }
    return (_jsx(Card, { title: t('widget.title'), description: t('widget.description'), footer: _jsx(Button, { size: "sm", variant: "outline", onClick: () => navigate('/app/rooms?availability=available'), children: t('actions.viewAvailable') }), children: content }));
}
