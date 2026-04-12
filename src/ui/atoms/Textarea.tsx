import clsx from 'clsx';
import type { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export default function Textarea({ label, hint, error, className, id, ...rest }: TextareaProps) {
  const fieldId = id ?? rest.name;
  return (
    <label className="block space-y-1.5" htmlFor={fieldId}>
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <textarea
        id={fieldId}
        className={clsx(
          'ds-field min-h-24 resize-y',
          error && 'border-danger focus-visible:ring-danger/35',
          className
        )}
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
