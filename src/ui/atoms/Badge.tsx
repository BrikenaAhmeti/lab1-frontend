import clsx from 'clsx';
import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'secondary' | 'success' | 'warning' | 'danger';

export default function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        variant === 'default' && 'bg-primary/15 text-primary',
        variant === 'secondary' && 'bg-secondary/20 text-secondary-foreground',
        variant === 'success' && 'bg-success/15 text-success',
        variant === 'warning' && 'bg-warning/15 text-attention',
        variant === 'danger' && 'bg-danger/15 text-danger',
        className
      )}
    >
      {children}
    </span>
  );
}
