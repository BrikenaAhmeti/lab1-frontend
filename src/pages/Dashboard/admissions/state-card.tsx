import type { ReactNode } from 'react';
import EmptyState from '@/ui/molecules/EmptyState';

type AdmissionStateCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export default function AdmissionStateCard({
  title,
  description,
  children,
}: AdmissionStateCardProps) {
  return (
    <EmptyState compact title={title} description={description} action={children} />
  );
}
