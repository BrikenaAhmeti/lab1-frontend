import type { ReactNode } from 'react';
import EmptyState from '@/ui/molecules/EmptyState';

type DoctorStateCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export default function DoctorStateCard({ title, description, children }: DoctorStateCardProps) {
  return (
    <EmptyState compact title={title} description={description} action={children} />
  );
}
