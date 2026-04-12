import clsx from 'clsx';
import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export default function Input({ label, hint, error, className, id, ...rest }: InputProps) {
  const fieldId = id ?? rest.name;
  return (
    <label className="block space-y-1.5" htmlFor={fieldId}>
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <input
        id={fieldId}
        className={clsx('ds-field', error && 'border-danger focus-visible:ring-danger/35', className)}
        {...rest}
      />
      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}
