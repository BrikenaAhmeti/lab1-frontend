import clsx from 'clsx';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
} from 'react';

export type DateRangePickerValue = {
  date: string;
  from: string;
  to: string;
};

type DateRangePickerProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value' | 'type'
> & {
  label?: string;
  hint?: string;
  error?: string;
  value: DateRangePickerValue;
  onChange: (value: DateRangePickerValue) => void;
  exactLabel?: string;
  rangeLabel?: string;
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

function isSameMonth(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
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

function isBetween(day: Date, from: Date | null, to: Date | null) {
  if (!from || !to) {
    return false;
  }

  const dayTime = day.getTime();
  return dayTime > from.getTime() && dayTime < to.getTime();
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
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
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default function DateRangePicker({
  label,
  hint,
  error,
  className,
  id,
  name,
  value,
  onChange,
  exactLabel = 'Exact day',
  rangeLabel = 'Date range',
  placeholder = 'YYYY-MM-DD',
  disabled,
  ...rest
}: DateRangePickerProps) {
  const fieldId = id ?? name;
  const mode = value.from || value.to ? 'range' : 'exact';
  const selectedDate = parseDateValue(value.date);
  const fromDate = parseDateValue(value.from);
  const toDate = parseDateValue(value.to);
  const [open, setOpen] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() =>
    startOfMonth(selectedDate ?? fromDate ?? toDate ?? new Date())
  );
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const visibleDate = parseDateValue(value.date) ?? parseDateValue(value.from) ?? parseDateValue(value.to);

    if (visibleDate) {
      setMonthCursor((current) => {
        const next = startOfMonth(visibleDate);
        return isSameMonth(current, next) ? current : next;
      });
    }
  }, [value.date, value.from, value.to]);

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

  const displayValue = value.from || value.to
    ? [value.from || placeholder, value.to || placeholder].join(' - ')
    : value.date;

  const setMode = (nextMode: 'exact' | 'range') => {
    if (nextMode === mode) {
      return;
    }

    onChange(
      nextMode === 'exact'
        ? { date: value.from || value.date, from: '', to: '' }
        : { date: '', from: value.date || value.from, to: value.to }
    );
  };

  const commitDay = (date: Date) => {
    const dayValue = formatDateValue(date);

    if (mode === 'exact') {
      onChange({ date: dayValue, from: '', to: '' });
      setOpen(false);
      return;
    }

    if (!value.from || value.to) {
      onChange({ date: '', from: dayValue, to: '' });
      return;
    }

    if (dayValue < value.from) {
      onChange({ date: '', from: dayValue, to: value.from });
      setOpen(false);
      return;
    }

    onChange({ date: '', from: value.from, to: dayValue });
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
          id={fieldId}
          name={name}
          type="text"
          inputMode="none"
          autoComplete="off"
          disabled={disabled}
          readOnly
          value={displayValue}
          placeholder={placeholder}
          className={clsx(
            'ds-field cursor-pointer pr-11',
            error && 'border-danger focus-visible:ring-danger/35',
            className
          )}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
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
            <div className="mb-3 inline-flex w-full rounded-xl border border-border bg-muted/35 p-1">
              <button
                type="button"
                aria-pressed={mode === 'exact'}
                className={clsx(
                  'h-8 flex-1 rounded-lg px-3 text-xs font-semibold transition-colors',
                  mode === 'exact'
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:bg-card hover:text-foreground'
                )}
                onClick={() => setMode('exact')}
              >
                {exactLabel}
              </button>
              <button
                type="button"
                aria-pressed={mode === 'range'}
                className={clsx(
                  'h-8 flex-1 rounded-lg px-3 text-xs font-semibold transition-colors',
                  mode === 'range'
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'text-muted-foreground hover:bg-card hover:text-foreground'
                )}
                onClick={() => setMode('range')}
              >
                {rangeLabel}
              </button>
            </div>

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
                const isSelected =
                  mode === 'exact'
                    ? value.date === dayValue
                    : value.from === dayValue || value.to === dayValue;
                const inRange = mode === 'range' && isBetween(day, fromDate, toDate);
                const isCurrentMonth = day.getMonth() === monthCursor.getMonth();

                return (
                  <button
                    key={dayValue}
                    type="button"
                    className={clsx(
                      'h-9 rounded-lg text-sm transition-colors',
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-soft'
                        : inRange
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted',
                      !isSelected && !inRange && !isCurrentMonth && 'text-muted-foreground/55',
                      !isSelected && !inRange && isCurrentMonth && 'text-foreground'
                    )}
                    onClick={() => commitDay(day)}
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
}
