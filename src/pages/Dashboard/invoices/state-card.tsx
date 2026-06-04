import type { ReactNode } from 'react';
import EmptyState from '@/ui/molecules/EmptyState';

type InvoiceStateCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export default function InvoiceStateCard({
  title,
  description,
  children,
}: InvoiceStateCardProps) {
  return (
    <EmptyState compact title={title} description={description} action={children} />
  );
}
