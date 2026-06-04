import type { ReactNode } from 'react';
import EmptyState from '@/ui/molecules/EmptyState';

type NurseStateCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export default function NurseStateCard({ title, description, children }: NurseStateCardProps) {
  return (
    <EmptyState compact title={title} description={description} action={children} />
  );
}
