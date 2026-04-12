import clsx from 'clsx';
import type { ReactNode } from 'react';

type CardProps = {
  title?: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Card({ title, description, footer, children, className }: CardProps) {
  return (
    <article className={clsx('ds-shell p-5 md:p-6', className)}>
      {(title || description) && (
        <header className="mb-4">
          {title && <h3 className="text-base font-semibold text-foreground">{title}</h3>}
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </header>
      )}

      <div>{children}</div>

      {footer && <footer className="mt-4 border-t border-border pt-4">{footer}</footer>}
    </article>
  );
}
