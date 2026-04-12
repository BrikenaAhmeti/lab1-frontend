import clsx from 'clsx';
import type { SelectHTMLAttributes } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export default function Select({ label, hint, error, className, id, children, ...rest }: SelectProps) {
  const fieldId = id ?? rest.name;
  return (
    <label className="block space-y-1.5" htmlFor={fieldId}>
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <select
        id={fieldId}
        className={clsx('ds-field appearance-none', error && 'border-danger focus-visible:ring-danger/35', className)}
        {...rest}
      >
        {children}
      </select>
      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}
