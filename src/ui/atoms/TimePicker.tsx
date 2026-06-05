import clsx from 'clsx';
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ForwardedRef,
  type InputHTMLAttributes,
} from 'react';

type TimePickerProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'onChange'
> & {
  label?: string;
  hint?: string;
  error?: string;
  value?: string | null;
  onChange?: (value: string) => void;
};

const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const minutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

function parseTimeValue(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);

  if (!match) {
    return null;
  }

  return {
    hour: match[1],
    minute: match[2],
  };
}

function setForwardedRef(ref: ForwardedRef<HTMLInputElement>, node: HTMLInputElement | null) {
  if (typeof ref === 'function') {
    ref(node);
    return;
  }

  if (ref) {
    ref.current = node;
  }
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  {
    label,
    hint,
    error,
    className,
    id,
    name,
    value,
    onChange,
    onBlur,
    disabled,
    placeholder = 'HH:mm',
    ...rest
  },
  ref
) {
  const fieldId = id ?? name;
  const currentValue = String(value ?? '');
  const selectedTime = useMemo(() => parseTimeValue(currentValue), [currentValue]);
  const selectedHour = selectedTime?.hour ?? '09';
  const selectedMinute = selectedTime?.minute ?? '00';
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (!rootRef.current || !(event.target instanceof Node)) {
        return;
      }

      if (!rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleMouseDown);

    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;

    if (/^\d{0,2}:?\d{0,2}$/.test(next) && next.length <= 5) {
      onChange?.(next);
    }
  };

  const commitTime = (hour: string, minute: string) => {
    onChange?.(`${hour}:${minute}`);
  };

  return (
    <div ref={rootRef} className="block space-y-1.5">
      {label ? (
        <label className="text-sm font-medium text-foreground" htmlFor={fieldId}>
          {label}
        </label>
      ) : null}

      <div className={clsx('relative', open ? 'z-40' : 'z-0')}>
        <input
          ref={(node) => setForwardedRef(ref, node)}
          id={fieldId}
          name={name}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          value={currentValue}
          placeholder={placeholder}
          className={clsx(
            'ds-field pr-11',
            error && 'border-danger focus-visible:ring-danger/35',
            className
          )}
          onFocus={() => setOpen(true)}
          onChange={handleInputChange}
          onBlur={(event) => {
            if (event.currentTarget.value && !parseTimeValue(event.currentTarget.value)) {
              onChange?.('');
            }

            onBlur?.(event);
          }}
          {...rest}
        />
        <button
          type="button"
          aria-label={label ? `Open ${label} picker` : 'Open time picker'}
          disabled={disabled}
          className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen((current) => !current)}
        >
          <ClockIcon />
        </button>

        {open ? (
          <div
            className="absolute left-0 top-full z-50 mt-2 grid w-96 max-w-[calc(100vw-2rem)] grid-cols-2 gap-3 rounded-xl border border-border bg-card p-3 shadow-soft"
            onMouseDown={(event) => event.preventDefault()}
          >
            <div>
              <p className="px-1 pb-2 text-xs font-semibold text-muted-foreground">Hour</p>
              <div className="grid max-h-56 grid-cols-3 gap-1 overflow-y-auto pr-1">
                {hours.map((hour) => {
                  const isSelected = hour === selectedHour;

                  return (
                    <button
                      key={hour}
                      type="button"
                      className={clsx(
                        'h-8 rounded-lg text-sm transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-soft'
                          : 'text-foreground hover:bg-muted'
                      )}
                      onClick={() => commitTime(hour, selectedMinute)}
                    >
                      {hour}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="px-1 pb-2 text-xs font-semibold text-muted-foreground">Minute</p>
              <div className="grid max-h-56 grid-cols-3 gap-1 overflow-y-auto pr-1">
                {minutes.map((minute) => {
                  const isSelected = minute === selectedMinute;

                  return (
                    <button
                      key={minute}
                      type="button"
                      className={clsx(
                        'h-8 rounded-lg text-sm transition-colors',
                        isSelected
                          ? 'bg-primary text-primary-foreground shadow-soft'
                          : 'text-foreground hover:bg-muted'
                      )}
                      onClick={() => commitTime(selectedHour, minute)}
                    >
                      {minute}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <span className="text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
});

TimePicker.displayName = 'TimePicker';

export default TimePicker;
