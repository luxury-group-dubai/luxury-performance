"use client";

import { createContext, useCallback, useContext, useEffect, useId, useOptimistic, useRef, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDownWideNarrow, Search, SlidersHorizontal, X } from 'lucide-react';
import { filterUrl, fitLabel, techartFitmentLabel, label, updateFilters, type Filters } from '@/lib/shop/taxonomy';
import { CatalogChoice } from './catalog-choice';
import { CatalogFilters, type CatalogFilterProps } from './catalog-filters';

const MobileNavigation = createContext<ReturnType<typeof useTransition> | null>(null);

export function CatalogMobileProvider({ children }: { children: ReactNode }) {
  const navigation = useTransition();
  return <MobileNavigation.Provider value={navigation}>{children}</MobileNavigation.Provider>;
}

function useMobileNavigation() {
  const navigation = useContext(MobileNavigation);
  if (!navigation) throw new Error('Mobile catalogue controls require CatalogMobileProvider.');
  return navigation;
}

type ScopeProps = { filters: Filters; basePath: string };

export function CatalogProductToolbar({ filters, basePath, resultLabel }: ScopeProps & { resultLabel: string }) {
  const router = useRouter();
  const [pending, startTransition] = useMobileNavigation();
  const input = useRef<HTMLInputElement>(null);
  const appliedQuery = filters.q || '';
  const queryScope = (filters.brand || '') + ':' + appliedQuery;
  const [draft, setDraft] = useState({ scope: queryScope, query: appliedQuery });
  if (draft.scope !== queryScope) setDraft({ scope: queryScope, query: appliedQuery });
  const query = draft.scope === queryScope ? draft.query : appliedQuery;

  function apply(q: string) {
    startTransition(() => {
      router.push(filterUrl(basePath, updateFilters(filters, { q })), { scroll: false });
    });
  }

  function clearSearch() {
    setDraft({ scope: queryScope, query: '' });
    input.current?.focus();
    if (appliedQuery) apply('');
  }

  return <form className="shop-product-toolbar" aria-label="Catalogue controls" action={basePath} autoComplete="off" aria-busy={pending} onSubmit={event => {
    event.preventDefault();
    apply(query.trim());
  }}>
    {Object.entries(filters).filter(([key, value]) => !['q', 'page'].includes(key) && value).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
    <div className="shop-product-search" role="search">
      <input ref={input} type="text" role="searchbox" name="q" aria-label="Search parts" placeholder="Search parts"
        autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} enterKeyHint="search"
        value={query} onChange={event => setDraft({ scope: queryScope, query: event.target.value })} />
      {(query || appliedQuery) && <button type="button" aria-label="Clear search" disabled={pending} onClick={clearSearch}><X size={16} aria-hidden="true" /></button>}
      <button type="submit" aria-label="Search parts" disabled={pending}><Search size={17} aria-hidden="true" /></button>
    </div>
    <p className="shop-toolbar-count" role="status">{resultLabel}</p>
    <CatalogSort filters={filters} basePath={basePath} />
    <span className="sr-only" role="status">{pending ? 'Updating parts…' : ''}</span>
  </form>;
}

function CatalogSort({ filters, basePath }: ScopeProps) {
  const router = useRouter();
  const [pending, startTransition] = useMobileNavigation();
  const [sort, setSort] = useOptimistic(filters.sort || '');
  const current = sortNames[sort] || 'Featured';

  function apply(nextSort: string, form: HTMLFormElement | null) {
    const query = form ? String(new FormData(form).get('q') || '').trim() : filters.q;
    startTransition(() => {
      setSort(nextSort);
      router.push(filterUrl(basePath, updateFilters(filters, { q: query, sort: nextSort })), { scroll: false });
    });
  }

  return <CatalogChoice variant="sort" label={`Sort parts · ${current}`} value={sort} disabled={pending}
    options={sortOptions} onChange={apply}>
    <ArrowDownWideNarrow size={18} aria-hidden="true" />
    <span>{current}</span>
  </CatalogChoice>;
}

type PanelProps = Omit<CatalogFilterProps, 'compact' | 'onDone' | 'resultCount' | 'navigation'> & { resultCount: number; children?: ReactNode };

export function CatalogFilterPanel({ children, resultCount, ...props }: PanelProps) {
  const navigation = useMobileNavigation();
  const [pending] = navigation;
  const modal = useRef<HTMLDialogElement>(null);
  const scrollLock = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const id = useId();
  const unlock = useCallback(() => {
    if (scrollLock.current === null) return;
    document.documentElement.style.overflow = scrollLock.current;
    scrollLock.current = null;
  }, []);
  useEffect(() => {
    const dialog = modal.current;
    const desktop = matchMedia('(min-width: 701px)');
    const resize = () => { if (desktop.matches) dialog?.close(); };
    desktop.addEventListener('change', resize);
    return () => { desktop.removeEventListener('change', resize); dialog?.close(); unlock(); };
  }, [unlock]);
  function show() {
    if (pending || !modal.current || modal.current.open) return;
    scrollLock.current = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    modal.current.showModal();
    setOpen(true);
  }
  function done() {
    modal.current?.close();
    document.getElementById('catalogue')?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  return <aside className="shop-filter-panel">
    <div className="shop-desktop-filters"><CatalogFilters {...props} navigation={navigation} />{children}</div>
    <div className="shop-mobile-toolbar">
      <p role="status">{resultCount} {resultCount === 1 ? 'part' : 'parts'}</p>
      <div className="shop-mobile-actions">
        <button type="button" onClick={show} disabled={pending} aria-haspopup="dialog" aria-expanded={open} aria-controls={id}><SlidersHorizontal size={16} aria-hidden="true" />Filters</button>
        <CatalogSort filters={props.filters} basePath={props.basePath} />
      </div>
    </div>
    <dialog ref={modal} id={id} className="shop-filter-sheet" aria-labelledby={id + '-title'} onClose={() => { setOpen(false); unlock(); }} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.currentTarget.close();
    }}>
      <header className="shop-filter-sheet-header"><h2 id={id + '-title'}>Filters</h2><button type="button" aria-label="Close filters" onClick={() => modal.current?.close()}><X size={20} aria-hidden="true" /></button></header>
      {open && <CatalogFilters {...props} compact navigation={navigation} resultCount={resultCount} onDone={done} />}
    </dialog>
  </aside>;
}

const chipNames: Partial<Record<keyof Filters, string>> = { q: 'search', make: 'vehicle make', model: 'vehicle model', generation: 'generation', fit: 'fitment', body: 'body style', category: 'category', sort: 'sort order' };
const sortNames: Record<string, string> = { 'price-up': 'Price: low to high', 'price-down': 'Price: high to low', name: 'Name: A–Z' };

const sortOptions = [['', 'Featured'] as const, ...Object.entries(sortNames)];

export function CatalogAppliedFilters({ filters, basePath }: ScopeProps) {
  const router = useRouter();
  const [selection, setSelection] = useOptimistic(filters);
  const [pending, startTransition] = useMobileNavigation();
  const active = (['q', 'make', 'model', 'generation', 'fit', 'body', 'category', 'sort'] as const).filter(key => selection[key]);
  function remove(key?: keyof Filters) {
    const next = key ? updateFilters(selection, { [key]: undefined }) : { brand: selection.brand, stock: selection.stock };
    startTransition(() => { setSelection(next); router.push(filterUrl(basePath, next), { scroll: false }); });
  }
  if (!active.length) return null;
  return <div className="shop-applied-filters" role="group" aria-label="Selected filters" aria-busy={pending}>
    {active.map(key => {
      const value = selection[key]!;
      const text = key === 'q' ? 'Search: ' + value : key === 'generation' ? fitLabel(value).toUpperCase() : key === 'fit' ? selection.generation ? techartFitmentLabel(value) : fitLabel(value) : key === 'sort' ? sortNames[value] || value : key === 'category' ? value : label(value);
      return <button type="button" className="shop-applied-filter" key={key} disabled={pending} onClick={() => remove(key)} aria-label={'Remove ' + chipNames[key] + ': ' + text}><span>{text}</span><X size={12} aria-hidden="true" /></button>;
    })}
    <button type="button" className="shop-filter-clear" disabled={pending} onClick={() => remove()}>Clear all</button>
  </div>;
}
