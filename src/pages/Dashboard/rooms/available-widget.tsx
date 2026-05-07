import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useRooms } from '@/domain/rooms/rooms.hooks';
import {
  getRoomApiMessage,
  getRoomStatusBadgeVariant,
  isKnownRoomStatus,
  normalizeRoomStatus,
} from '@/domain/rooms/rooms.utils';
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
    content = <p className="text-sm text-muted-foreground">{t('widget.loading')}</p>;
  } else if (roomsQuery.error) {
    content = (
      <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
        <div>{getRoomApiMessage(roomsQuery.error, t('errors.available'))}</div>
        <Button size="sm" variant="outline" className="mt-3" onClick={() => roomsQuery.refetch()}>
          {t('actions.retry')}
        </Button>
      </div>
    );
  } else if (!rooms.length) {
    content = (
      <div className="rounded-2xl border border-border/70 bg-background/45 px-4 py-5">
        <p className="text-sm font-semibold text-foreground">{t('widget.emptyTitle')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('widget.emptyDescription')}</p>
      </div>
    );
  } else {
    content = (
      <div className="space-y-3">
        <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-4">
          <p className="text-sm text-muted-foreground">{t('widget.countLabel')}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{rooms.length}</p>
        </div>

        {items.map((room) => {
          const normalizedStatus = normalizeRoomStatus(room.status);

          return (
            <div
              key={room.id}
              className="rounded-2xl border border-border/70 bg-background/45 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{room.roomNumber}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {room.department?.name || t('labels.noDepartment')}
                  </p>
                </div>
                <Badge variant={getRoomStatusBadgeVariant(room.status)}>
                  {isKnownRoomStatus(normalizedStatus)
                    ? t(`statuses.${normalizedStatus}`)
                    : room.status || t('labels.notAvailable')}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {t('labels.availableSummary', { count: room.availableCapacity })} ·{' '}
                {t('labels.occupiedSummary', {
                  occupied: room.activeAdmissionsCount,
                  capacity: room.capacity,
                })}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card
      title={t('widget.title')}
      description={t('widget.description')}
      footer={
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/app/rooms?availability=available')}
        >
          {t('actions.viewAvailable')}
        </Button>
      }
    >
      {content}
    </Card>
  );
}
