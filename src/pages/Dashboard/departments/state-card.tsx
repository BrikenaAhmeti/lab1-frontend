import type { ReactNode } from 'react';
import EmptyState from '@/ui/molecules/EmptyState';

type DepartmentStateCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export default function DepartmentStateCard({
  title,
  description,
  children,
}: DepartmentStateCardProps) {
  return (
    <EmptyState compact title={title} description={description} action={children} />
  );
}
