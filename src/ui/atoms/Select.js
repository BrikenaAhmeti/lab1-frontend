import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
import { Children, forwardRef, isValidElement, useCallback, useEffect, useId, useMemo, useRef, useState, } from 'react';
function stringifyLabel(node) {
    if (node == null || typeof node === 'boolean')
        return '';
    if (typeof node === 'string' || typeof node === 'number')
        return String(node);
    if (Array.isArray(node))
        return node.map(stringifyLabel).join('');
    return '';
}
function parseOptionElements(children) {
    const out = [];
    Children.forEach(children, (child) => {
        if (!isValidElement(child))
            return;
        if (child.type !== 'option')
            return;
        const optProps = child.props;
        out.push({
            value: optProps.value !== undefined && optProps.value !== null ? String(optProps.value) : '',
            label: stringifyLabel(optProps.children).trim() || String(optProps.value ?? ''),
            disabled: !!optProps.disabled,
        });
    });
    return out;
}
const Select = forwardRef(function Select({ label, hint, error, className, id, children, searchPlaceholder = 'Search…', value: valueProp, defaultValue, onChange, onBlur, disabled, name, required, ...rest }, ref) {
    const reactId = useId();
    const fieldId = id ?? `${name ?? 'select'}_${reactId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    const listboxId = `${fieldId}-listbox`;
    const allParsed = useMemo(() => parseOptionElements(children), [children]);
    const placeholderOption = useMemo(() => allParsed.find((o) => o.value === '') ?? null, [allParsed]);
    /** Options shown in picker (excluding empty placeholder row as a selectable value) */
    const pickableRows = useMemo(() => allParsed.filter((o) => o.value !== ''), [allParsed]);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlightIdx, setHighlightIdx] = useState(-1);
    const isControlled = valueProp !== undefined;
    const [internalValue, setInternalValue] = useState(() => defaultValue !== undefined && defaultValue !== null ? String(defaultValue) : '');
    const current = isControlled && valueProp !== undefined && valueProp !== null ? String(valueProp) : internalValue;
    useEffect(() => {
        if (open) {
            setQuery('');
            setHighlightIdx(-1);
        }
    }, [open]);
    const filteredPickable = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q)
            return pickableRows;
        return pickableRows.filter((o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q));
    }, [pickableRows, query]);
    const filteredNonDisabledIdx = useMemo(() => {
        const rows = [];
        const map = [];
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
        if (picked)
            return picked.label;
        if (current === '' && placeholderOption)
            return placeholderOption.label;
        const any = pickableRows.find((o) => o.value === current);
        if (any)
            return any.label;
        return placeholderOption?.label ?? '—';
    }, [current, pickableRows, placeholderOption]);
    const rootRef = useRef(null);
    const emitChange = useCallback((nextRaw) => {
        const next = pickableRows.some((o) => o.value === nextRaw && o.disabled)
            ? current
            : nextRaw;
        const syntheticEvent = {
            target: { name: name ?? '', value: next },
            currentTarget: { name: name ?? '', value: next },
        };
        if (!isControlled) {
            setInternalValue(next);
        }
        onChange?.(syntheticEvent);
    }, [current, isControlled, name, onChange, pickableRows]);
    const pick = useCallback((nextRaw) => {
        const opt = pickableRows.find((o) => o.value === nextRaw);
        if (!opt || opt.disabled)
            return;
        emitChange(nextRaw);
        setOpen(false);
    }, [emitChange, pickableRows]);
    useEffect(() => {
        function onDocMouseDown(ev) {
            const root = rootRef.current;
            if (!root || !(ev.target instanceof Node))
                return;
            if (root.contains(ev.target))
                return;
            setOpen(false);
        }
        document.addEventListener('mousedown', onDocMouseDown);
        return () => document.removeEventListener('mousedown', onDocMouseDown);
    }, []);
    useEffect(() => {
        function onEscape(ev) {
            if (ev.key === 'Escape')
                setOpen(false);
        }
        if (open) {
            window.addEventListener('keydown', onEscape);
            return () => window.removeEventListener('keydown', onEscape);
        }
    }, [open]);
    const moveHighlight = (delta) => {
        const { rows, map } = filteredNonDisabledIdx;
        if (!rows.length)
            return;
        if (highlightIdx < 0) {
            const start = delta > 0 ? 0 : map.length - 1;
            setHighlightIdx(map[start] ?? map[0] ?? -1);
            return;
        }
        const posInMap = map.indexOf(highlightIdx);
        if (posInMap < 0)
            return;
        const nextPos = Math.max(0, Math.min(map.length - 1, posInMap + delta));
        setHighlightIdx(map[nextPos] ?? -1);
    };
    const handleButtonKeyDown = (e) => {
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
                }
                else if (highlightIdx >= 0 && filteredPickable[highlightIdx]) {
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
    return (_jsxs("div", { className: "block space-y-1.5", children: [label ? (_jsx("span", { className: "text-sm font-medium text-foreground", id: `${fieldId}-label`, children: label })) : null, _jsx("select", { ref: ref, id: `${fieldId}-mirror`, name: name, value: current, required: required, disabled: disabled, "aria-hidden": "true", tabIndex: -1, className: clsx('sr-only h-px w-px overflow-hidden whitespace-nowrap p-0'), ...rest, onChange: (e) => emitChange(e.target.value), children: children }), _jsxs("div", { ref: rootRef, className: clsx('relative', open ? 'z-30' : 'z-0', className), "data-searchable-select-root": "", children: [_jsxs("button", { id: fieldId, type: "button", role: "combobox", "aria-expanded": open, "aria-controls": open ? listboxId : undefined, "aria-labelledby": label ? `${fieldId}-label` : undefined, "aria-haspopup": "listbox", "aria-required": required, disabled: disabled, "data-testid": name ? `select-${String(name)}` : undefined, className: clsx('ds-field inline-flex h-auto min-h-[2.65rem] w-full cursor-pointer items-center justify-between gap-2 px-4 py-2 text-left outline-none ring-offset-background', error ? 'border-danger focus-visible:ring-danger/35' : '', disabled && 'cursor-not-allowed opacity-55'), onBlur: (e) => {
                            window.setTimeout(() => {
                                const root = e.currentTarget.closest('[data-searchable-select-root]');
                                const active = document.activeElement;
                                if (root && active instanceof Node && root.contains(active)) {
                                    return;
                                }
                                onBlur?.(e);
                            }, 0);
                        }, onClick: () => {
                            if (!disabled)
                                setOpen((o) => !o);
                        }, onKeyDown: handleButtonKeyDown, children: [_jsx("span", { className: "min-w-0 flex-1 truncate", children: displayLabel }), _jsx("span", { className: "shrink-0 text-muted-foreground", "aria-hidden": true, children: _jsx("svg", { width: "14", height: "14", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { d: "M5 8l5 5 5-5z" }) }) })] }), open ? (_jsxs("div", { id: listboxId, role: "listbox", className: "absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden rounded-xl border border-border bg-card py-2 shadow-soft", children: [_jsx("div", { className: "border-b border-border/70 px-2 pb-2", children: _jsx("input", { autoFocus: true, type: "text", className: "ds-field w-full py-2 text-sm", placeholder: searchPlaceholder, "aria-label": searchPlaceholder, value: query, onChange: (e) => setQuery(e.target.value), onMouseDown: (e) => e.stopPropagation() }) }), _jsx("ul", { className: "max-h-[11.5rem] overflow-y-auto px-2 pt-2", children: filteredPickable.length === 0 ? (_jsx("li", { className: "px-2 py-2 text-sm text-muted-foreground", children: "No matches" })) : (filteredPickable.map((opt, displayIndex) => {
                                    const highlighted = highlightIdx === displayIndex;
                                    const muted = !!opt.disabled;
                                    return (_jsx("li", { role: "presentation", children: _jsx("button", { role: "option", type: "button", "aria-selected": opt.value === current, "aria-disabled": muted || undefined, disabled: muted, className: clsx('flex w-full rounded-xl px-2 py-2 text-left text-sm transition-colors', highlighted && !muted ? 'bg-muted/70 text-foreground' : 'bg-transparent', muted ? 'cursor-not-allowed text-muted-foreground/60' : 'hover:bg-muted/50'), onMouseDown: (e) => e.preventDefault(), onMouseEnter: () => setHighlightIdx(displayIndex), onClick: () => pick(opt.value), children: opt.label }) }, `${opt.value}-${displayIndex}`));
                                })) })] })) : null] }), error ? (_jsx("span", { className: "text-xs text-danger", children: error })) : hint ? (_jsx("span", { className: "text-xs text-muted-foreground", children: hint })) : null] }));
});
Select.displayName = 'Select';
export default Select;
