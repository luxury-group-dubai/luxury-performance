"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';

export type CatalogChoiceOption = readonly [value: string, label: string, details?: { count: number; disabled?: boolean }];

type Props = {
  variant: 'sort' | 'filter';
  label: string;
  options: readonly CatalogChoiceOption[];
  value: string;
  disabled?: boolean;
  onChange: (value: string, form: HTMLFormElement | null) => void;
  children: ReactNode;
};

export function CatalogChoice({ variant, label, options, value, disabled, onChange, children }: Props) {
  const [open, setOpen] = useState(false);
  const control = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !control.current?.contains(event.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  const expanded = open && !disabled;

  return <div className={`shop-choice shop-choice-${variant}`} ref={control}
    onBlur={event => {
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}
    onKeyDown={event => {
      if (event.key === 'Escape' && expanded) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        trigger.current?.focus();
      }
    }}>
    <button ref={trigger} className="shop-choice-trigger" type="button" aria-label={label}
      aria-expanded={expanded} aria-controls={menuId} disabled={disabled}
      onClick={() => setOpen(!open)}>
      {children}
    </button>
    <div id={menuId} className="shop-choice-menu" role="group" aria-label={label} hidden={!expanded}>
      {options.map(([key, name, details]) => (
        <button key={key} type="button" aria-pressed={key === value} disabled={details?.disabled} onClick={() => {
          setOpen(false);
          trigger.current?.focus();
          if (key !== value) onChange(key, trigger.current?.form ?? null);
        }}>
          <span>{name}</span>
          <span className="shop-choice-option-meta">
            {details && <small>{details.count}</small>}
            {key === value && <Check size={15} aria-hidden="true" />}
          </span>
        </button>
      ))}
    </div>
  </div>;
}
