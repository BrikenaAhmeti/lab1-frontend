import clsx from 'clsx';
import type { InputHTMLAttributes } from 'react';
import DatePicker from './DatePicker';
import TimePicker from './TimePicker';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export default function Input({ label, hint, error, className, id, type, ...rest }: InputProps) {
  const fieldId = id ?? rest.name;

  if (type === 'date') {
    return (
      <DatePicker
        id={fieldId}
        label={label}
        hint={hint}
        error={error}
        className={className}
        {...rest}
      />
    );
  }

  if (type === 'time') {
    return (
      <TimePicker
        id={fieldId}
        label={label}
        hint={hint}
        error={error}
        className={className}
        {...rest}
      />
    );
  }

  return (
    <label className="block space-y-1.5" htmlFor={fieldId}>
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
      <input
        id={fieldId}
        type={type}
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
