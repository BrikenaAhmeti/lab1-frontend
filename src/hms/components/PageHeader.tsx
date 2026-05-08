import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
