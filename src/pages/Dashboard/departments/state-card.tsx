import type { ReactNode } from 'react';

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
    <div className="rounded-2xl border border-border/70 bg-card/85 p-5 shadow-panel backdrop-blur-sm md:p-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
