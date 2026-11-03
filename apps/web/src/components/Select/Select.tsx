'use client';

import {
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import * as Popover from '@radix-ui/react-popover';

import styles from './Select.module.scss';

export type SelectOption = {
  value: string;
  label: string;
};

type BaseProps = {
  label?: ReactNode;
  error?: ReactNode;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  className?: string;
  /** `sm` hugs content width — used for compact service switchers. */
  size?: 'md' | 'sm';
  /** Enable search filter. Default true. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Allow submitting a custom value when nothing matches. Default true when searchable. */
  creatable?: boolean;
  createLabel?: (query: string) => string;
  emptyLabel?: string;
  /** Aria label for multi-select chip remove buttons. */
  removeChipLabel?: (label: string) => string;
  name?: string;
  id?: string;
};

type SingleProps = BaseProps & {
  multiple?: false;
  value?: string;
  onChange?: (value: string) => void;
};

type MultiProps = BaseProps & {
  multiple: true;
  value?: string[];
  onChange?: (value: string[]) => void;
};

export type SelectProps = SingleProps | MultiProps;

function Chevron() {
  return (
    <svg className={styles.chevron} viewBox='0 0 12 12' aria-hidden>
      <path
        d='M2.5 4.5 6 8l3.5-3.5'
        fill='none'
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

export function Select(props: SelectProps) {
  const {
    label,
    error,
    placeholder = '',
    options,
    disabled,
    className,
    size = 'md',
    searchable = true,
    searchPlaceholder,
    creatable = searchable,
    createLabel,
    emptyLabel,
    removeChipLabel,
    name,
    id: idProp,
  } = props;

  const multiple = props.multiple === true;
  const value = multiple ? (props.value ?? []) : (props.value ?? '');
  const onChange = props.onChange;

  const reactId = useId();
  const fieldId = idProp ?? name ?? reactId;
  const listId = `${fieldId}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchable) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) || option.value.toLowerCase().includes(q),
    );
  }, [options, query, searchable]);

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return false;
    return options.some(
      (option) => option.label.toLowerCase() === q || option.value.toLowerCase() === q,
    );
  }, [options, query]);

  const showCreate = Boolean(creatable && query.trim() && !exactMatch);
  const items = showCreate
    ? [{ kind: 'create' as const, value: query.trim(), label: query.trim() }, ...filtered.map((o) => ({ kind: 'option' as const, ...o }))]
    : filtered.map((o) => ({ kind: 'option' as const, ...o }));

  const selectedLabels = useMemo(() => {
    if (multiple) {
      const selected = value as string[];
      return selected.map((v) => options.find((o) => o.value === v)?.label ?? v);
    }
    const v = value as string;
    if (!v) return [];
    return [options.find((o) => o.value === v)?.label ?? v];
  }, [multiple, options, value]);

  const isSelected = (optionValue: string) =>
    multiple ? (value as string[]).includes(optionValue) : value === optionValue;

  const pick = (next: string) => {
    if (multiple) {
      const current = value as string[];
      const nextValues = current.includes(next)
        ? current.filter((item) => item !== next)
        : [...current, next];
      (onChange as MultiProps['onChange'])?.(nextValues);
      return;
    }
    (onChange as SingleProps['onChange'])?.(next);
    setOpen(false);
    setQuery('');
  };

  const removeChip = (optionValue: string, event: ReactMouseEvent | ReactPointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!multiple) return;
    const current = value as string[];
    (onChange as MultiProps['onChange'])?.(current.filter((item) => item !== optionValue));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!open) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(items.length - 1, 0)));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const item = items[activeIndex];
      if (item) pick(item.value);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const display =
    selectedLabels.length === 0
      ? placeholder
      : multiple
        ? selectedLabels.join(', ')
        : selectedLabels[0];

  return (
    <div className={clsx(styles.field, size === 'sm' && styles.fieldSm, className)}>
      {label ? (
        <label className={styles.label} htmlFor={fieldId}>
          {label}
        </label>
      ) : null}

      <Popover.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            setQuery('');
            setActiveIndex(0);
            queueMicrotask(() => searchRef.current?.focus());
          }
        }}
      >
        <Popover.Trigger asChild>
          <div
            id={fieldId}
            className={styles.trigger}
            tabIndex={disabled ? -1 : 0}
            data-placeholder={selectedLabels.length === 0 ? '' : undefined}
            data-open={open ? '' : undefined}
            data-disabled={disabled ? '' : undefined}
            data-size={size}
            role='combobox'
            aria-haspopup='listbox'
            aria-expanded={open}
            aria-controls={listId}
            aria-disabled={disabled || undefined}
            aria-label={typeof label === 'string' ? label : undefined}
            onKeyDown={(event) => {
              if (disabled) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setOpen((current) => !current);
              }
            }}
          >
            {multiple && (value as string[]).length > 0 ? (
              <span className={styles.chips}>
                {(value as string[]).map((optionValue) => {
                  const chipLabel =
                    options.find((option) => option.value === optionValue)?.label ?? optionValue;
                  return (
                    <span key={optionValue} className={styles.chip}>
                      <span className={styles.chipLabel}>{chipLabel}</span>
                      <button
                        type='button'
                        className={styles.chipRemove}
                        aria-label={removeChipLabel?.(chipLabel) ?? `Remove ${chipLabel}`}
                        disabled={disabled}
                        onClick={(event) => removeChip(optionValue, event)}
                        onPointerDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                      >
                        <span aria-hidden>×</span>
                      </button>
                    </span>
                  );
                })}
              </span>
            ) : (
              <span className={styles.value}>{display}</span>
            )}
            <Chevron />
          </div>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className={styles.content}
            sideOffset={6}
            align='start'
            onKeyDown={onKeyDown}
            onOpenAutoFocus={(event) => {
              if (searchable) event.preventDefault();
            }}
          >
            {searchable ? (
              <input
                ref={searchRef}
                className={styles.search}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder={searchPlaceholder}
                aria-autocomplete='list'
                aria-controls={listId}
              />
            ) : null}

            <ul className={styles.list} id={listId} role='listbox' aria-multiselectable={multiple}>
              {items.length === 0 ? (
                <li>
                  <p className={styles.empty}>{emptyLabel}</p>
                </li>
              ) : (
                items.map((item, index) => {
                  const selected = item.kind === 'option' && isSelected(item.value);
                  const active = index === activeIndex;
                  return (
                    <li key={`${item.kind}-${item.value}`}>
                      <button
                        type='button'
                        role='option'
                        aria-selected={selected}
                        className={item.kind === 'create' ? styles.create : styles.option}
                        data-selected={selected ? '' : undefined}
                        data-active={active ? '' : undefined}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => pick(item.value)}
                      >
                        {item.kind === 'create'
                          ? (createLabel?.(item.value) ?? item.label)
                          : item.label}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {name ? (
        <input
          type='hidden'
          name={name}
          value={multiple ? (value as string[]).join(',') : (value as string)}
          readOnly
        />
      ) : null}

      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
