import clsx from 'clsx';
import type {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  OptionHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';
import {
  Children,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type SelectOptionParsed = {
  value: string;
  label: string;
  disabled?: boolean;
};

function stringifyLabel(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(stringifyLabel).join('');
  return '';
}

function parseOptionElements(children: ReactNode): SelectOptionParsed[] {
  const out: SelectOptionParsed[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type !== 'option') return;
    const optProps = child.props as OptionHTMLAttributes<HTMLOptionElement>;
    out.push({
      value:
        optProps.value !== undefined && optProps.value !== null ? String(optProps.value) : '',
      label: stringifyLabel(optProps.children).trim() || String(optProps.value ?? ''),
      disabled: !!optProps.disabled,
    });
  });
  return out;
}

export type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'size'> & {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  /** Placeholder for the embedded search box when the list is open */
  searchPlaceholder?: string;
};

const PANEL_MAX_HEIGHT = 240;
const VIEWPORT_GAP = 12;

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    label,
    hint,
    error,
    className,
    id,
    children,
    searchPlaceholder = 'Search…',
    value: valueProp,
    defaultValue,
    onChange,
    onBlur,
    disabled,
    name,
    required,
    ...rest
  },
  ref
) {
  const reactId = useId();
  const fieldId = id ?? `${name ?? 'select'}_${reactId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  const listboxId = `${fieldId}-listbox`;

  const allParsed = useMemo(() => parseOptionElements(children), [children]);
  const placeholderOption = useMemo(
    () => allParsed.find((o) => o.value === '') ?? null,
    [allParsed]
  );
  /** Options shown in picker (excluding empty placeholder row as a selectable value) */
  const pickableRows = useMemo(() => allParsed.filter((o) => o.value !== ''), [allParsed]);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [panelPlacement, setPanelPlacement] = useState<{
    side: 'top' | 'bottom';
    maxHeight: number;
  }>({ side: 'bottom', maxHeight: PANEL_MAX_HEIGHT });

  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : ''
  );

  const current =
    isControlled && valueProp !== undefined && valueProp !== null ? String(valueProp) : internalValue;

  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlightIdx(-1);
    }
  }, [open]);

  const filteredPickable = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pickableRows;
    return pickableRows.filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [pickableRows, query]);

  const filteredNonDisabledIdx = useMemo(() => {
    const rows: SelectOptionParsed[] = [];
    const map: number[] = [];
    filteredPickable.forEach((o, idx) => {
      if (!o.disabled) {
        rows.push(o);
        map.push(idx);
      }
    });
    return { rows, map };
  }, [filteredPickable]);

  const displayLabel = useMemo(() => {
    const picked = pickableRows.find((o) => o.value === current && !o.disabled);
    if (picked) return picked.label;
    if (current === '' && placeholderOption) return placeholderOption.label;
    const any = pickableRows.find((o) => o.value === current);
    if (any) return any.label;
    return placeholderOption?.label ?? '—';
  }, [current, pickableRows, placeholderOption]);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const updatePanelPlacement = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    const below = Math.max(0, window.innerHeight - rect.bottom - VIEWPORT_GAP);
    const above = Math.max(0, rect.top - VIEWPORT_GAP);
    const shouldOpenUp = below < PANEL_MAX_HEIGHT && above > below;
    const availableSpace = shouldOpenUp ? above : below;

    setPanelPlacement({
      side: shouldOpenUp ? 'top' : 'bottom',
      maxHeight: Math.max(0, Math.min(PANEL_MAX_HEIGHT, availableSpace)),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    updatePanelPlacement();

    window.addEventListener('resize', updatePanelPlacement);
    window.addEventListener('scroll', updatePanelPlacement, true);

    return () => {
      window.removeEventListener('resize', updatePanelPlacement);
      window.removeEventListener('scroll', updatePanelPlacement, true);
    };
  }, [open, updatePanelPlacement]);

  const emitChange = useCallback(
    (nextRaw: string) => {
      const next = pickableRows.some((o) => o.value === nextRaw && o.disabled)
        ? current
        : nextRaw;
      const syntheticEvent = {
        target: { name: name ?? '', value: next },
        currentTarget: { name: name ?? '', value: next },
      } as ChangeEvent<HTMLSelectElement>;
      if (!isControlled) {
        setInternalValue(next);
      }
      onChange?.(syntheticEvent);
    },
    [current, isControlled, name, onChange, pickableRows]
  );

  const pick = useCallback(
    (nextRaw: string) => {
      const opt = pickableRows.find((o) => o.value === nextRaw);
      if (!opt || opt.disabled) return;
      emitChange(nextRaw);
      setOpen(false);
    },
    [emitChange, pickableRows]
  );

  useEffect(() => {
    function onDocMouseDown(ev: MouseEvent) {
      const root = rootRef.current;
      if (!root || !(ev.target instanceof Node)) return;
      if (root.contains(ev.target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, []);

  useEffect(() => {
    function onEscape(ev: globalThis.KeyboardEvent) {
      if (ev.key === 'Escape') setOpen(false);
    }
    if (open) {
      window.addEventListener('keydown', onEscape);
      return () => window.removeEventListener('keydown', onEscape);
    }
  }, [open]);

  const moveHighlight = (delta: number) => {
    const { rows, map } = filteredNonDisabledIdx;
    if (!rows.length) return;
    if (highlightIdx < 0) {
      const start = delta > 0 ? 0 : map.length - 1;
      setHighlightIdx(map[start] ?? map[0] ?? -1);
      return;
    }
    const posInMap = map.indexOf(highlightIdx);
    if (posInMap < 0) return;
    const nextPos = Math.max(0, Math.min(map.length - 1, posInMap + delta));
    setHighlightIdx(map[nextPos] ?? -1);
  };

  const handleButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setOpen(true);
        moveHighlight(+1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setOpen(true);
        moveHighlight(-1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else if (highlightIdx >= 0 && filteredPickable[highlightIdx]) {
          const opt = filteredPickable[highlightIdx];
          pick(opt.value);
        }
        break;
      case 'Escape':
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="block space-y-1.5">
      {label ? (
        <span className="text-sm font-medium text-foreground" id={`${fieldId}-label`}>
          {label}
        </span>
      ) : null}

      {/* Native mirror for adapters that expect ref on a select (e.g. react-hook-form) */}
      <select
        ref={ref}
        id={`${fieldId}-mirror`}
        name={name}
        value={current}
        required={required}
        disabled={disabled}
        aria-hidden="true"
        tabIndex={-1}
        className={clsx('sr-only h-px w-px overflow-hidden whitespace-nowrap p-0')}
        {...rest}
        onChange={(e) => emitChange(e.target.value)}
      >
        {children}
      </select>

      <div
        ref={rootRef}
        className={clsx('relative', open ? 'z-30' : 'z-0', className)}
        data-searchable-select-root=""
      >
        <button
          id={fieldId}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-labelledby={label ? `${fieldId}-label` : undefined}
          aria-haspopup="listbox"
          aria-required={required}
          disabled={disabled}
          data-testid={name ? `select-${String(name)}` : undefined}
          className={clsx(
            'ds-field inline-flex h-auto min-h-[2.65rem] w-full cursor-pointer items-center justify-between gap-2 px-4 py-2 text-left outline-none ring-offset-background',
            error ? 'border-danger focus-visible:ring-danger/35' : '',
            disabled && 'cursor-not-allowed opacity-55'
          )}
          onBlur={(e) => {
            window.setTimeout(() => {
              const root = e.currentTarget.closest('[data-searchable-select-root]');
              const active = document.activeElement;
              if (root && active instanceof Node && root.contains(active)) {
                return;
              }
              onBlur?.(e as unknown as FocusEvent<HTMLSelectElement>);
            }, 0);
          }}
          onClick={() => {
            if (!disabled) setOpen((o) => !o);
          }}
          onKeyDown={handleButtonKeyDown}
        >
          <span className="min-w-0 flex-1 truncate">{displayLabel}</span>
          <span className="shrink-0 text-muted-foreground" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M5 8l5 5 5-5z" />
            </svg>
          </span>
        </button>

        {open ? (
          <div
            id={listboxId}
            role="listbox"
            className={clsx(
              'absolute left-0 right-0 z-50 flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-soft',
              panelPlacement.side === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
            )}
            style={{ maxHeight: panelPlacement.maxHeight }}
          >
            <div className="shrink-0 border-b border-border/70 px-2 pb-2 pt-2">
              <input
                autoFocus
                type="text"
                className="ds-field w-full py-2 text-sm"
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
            <ul className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
              {filteredPickable.length === 0 ? (
                <li className="px-2 py-2 text-sm text-muted-foreground">No matches</li>
              ) : (
                filteredPickable.map((opt, displayIndex) => {
                  const highlighted = highlightIdx === displayIndex;
                  const muted = !!opt.disabled;
                  return (
                    <li role="presentation" key={`${opt.value}-${displayIndex}`}>
                      <button
                        role="option"
                        type="button"
                        aria-selected={opt.value === current}
                        aria-disabled={muted || undefined}
                        disabled={muted}
                        className={clsx(
                          'flex w-full rounded-xl px-2 py-2 text-left text-sm transition-colors',
                          highlighted && !muted ? 'bg-muted/70 text-foreground' : 'bg-transparent',
                          muted ? 'cursor-not-allowed text-muted-foreground/60' : 'hover:bg-muted/50'
                        )}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setHighlightIdx(displayIndex)}
                        onClick={() => pick(opt.value)}
                      >
                        {opt.label}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
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

Select.displayName = 'Select';

export default Select;
