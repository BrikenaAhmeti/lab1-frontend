import type { ReactNode } from 'react';
import EmptyState from '@/ui/molecules/EmptyState';

type PatientStateCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export default function PatientStateCard({ title, description, children }: PatientStateCardProps) {
  return (
    <EmptyState compact title={title} description={description} action={children} />
  );
}
