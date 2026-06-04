import type { ReactNode } from 'react';
import EmptyState from '@/ui/molecules/EmptyState';

type AppointmentStateCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export default function AppointmentStateCard({
  title,
  description,
  children,
}: AppointmentStateCardProps) {
  return (
    <EmptyState compact title={title} description={description} action={children} />
  );
}
