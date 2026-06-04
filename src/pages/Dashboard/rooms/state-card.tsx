import type { ReactNode } from 'react';
import EmptyState from '@/ui/molecules/EmptyState';

type RoomStateCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export default function RoomStateCard({ title, description, children }: RoomStateCardProps) {
  return (
    <EmptyState compact title={title} description={description} action={children} />
  );
}
