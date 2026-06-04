import type { ReactNode } from 'react';
import EmptyState from '@/ui/molecules/EmptyState';

type MedicalRecordStateCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export default function MedicalRecordStateCard({
  title,
  description,
  children,
}: MedicalRecordStateCardProps) {
  return (
    <EmptyState compact title={title} description={description} action={children} />
  );
}
