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

type DatePickerProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'defaultValue' | 'onChange'
> & {
  label?: string;
  hint?: string;
  error?: string;
  value?: string | null;
  onChange?: (value: string) => void;
};

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function parseDateValue(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getCalendarDays(monthCursor: Date) {
  const firstDay = startOfMonth(monthCursor);
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(firstDay);
  start.setDate(firstDay.getDate() - mondayOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
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

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M12.5 15 7.5 10l5-5' : 'M7.5 5l5 5-5 5'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
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
    placeholder = 'YYYY-MM-DD',
    ...rest
  },
  ref
) {
  const fieldId = id ?? name;
  const currentValue = String(value ?? '');
  const selectedDate = useMemo(() => parseDateValue(currentValue), [currentValue]);
  const [open, setOpen] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(selectedDate ?? new Date()));
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedDate) {
      setMonthCursor(startOfMonth(selectedDate));
    }
  }, [selectedDate]);

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

  const calendarDays = useMemo(() => getCalendarDays(monthCursor), [monthCursor]);
  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(monthCursor);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;

    if (/^[0-9-]{0,10}$/.test(next)) {
      onChange?.(next);
    }
  };

  const commitDate = (date: Date) => {
    onChange?.(formatDateValue(date));
    setOpen(false);
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
            if (event.currentTarget.value && !parseDateValue(event.currentTarget.value)) {
              onChange?.('');
            }

            onBlur?.(event);
          }}
          {...rest}
        />
        <button
          type="button"
          aria-label={label ? `Open ${label} calendar` : 'Open calendar'}
          disabled={disabled}
          className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen((current) => !current)}
        >
          <CalendarIcon />
        </button>

        {open ? (
          <div
            className="absolute left-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card p-3 shadow-soft"
            onMouseDown={(event) => event.preventDefault()}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Previous month"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() =>
                  setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
                }
              >
                <ChevronIcon direction="left" />
              </button>
              <p className="text-sm font-semibold text-foreground">{monthLabel}</p>
              <button
                type="button"
                aria-label="Next month"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() =>
                  setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
                }
              >
                <ChevronIcon direction="right" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground">
              {weekdays.map((weekday) => (
                <span key={weekday} className="py-1">
                  {weekday}
                </span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dayValue = formatDateValue(day);
                const isSelected = currentValue === dayValue;
                const isCurrentMonth = day.getMonth() === monthCursor.getMonth();

                return (
                  <button
                    key={dayValue}
                    type="button"
                    className={clsx(
                      'h-9 rounded-lg text-sm transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : 'hover:bg-muted',
                      !isSelected && !isCurrentMonth && 'text-muted-foreground/55',
                      !isSelected && isCurrentMonth && 'text-foreground'
                    )}
                    onClick={() => commitDate(day)}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
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

DatePicker.displayName = 'DatePicker';

export default DatePicker;
