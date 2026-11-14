"use client";

import { ActionArrow } from '@/components/action-arrow';
import { useOptimistic, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { label, fitLabel, techartFitmentLabel, techartGeneration, filterUrl, updateFilters, type Filters } from '@/lib/shop/taxonomy';

import { CatalogChoice, type CatalogChoiceOption } from './catalog-choice';

export type CatalogFilterProps = {
  filters: Filters;
  basePath: string;
  makes: string[];
  models: string[];
  fits: string[];
  categories: { name: string; count: number }[];
  total: number;
  bodies: { key: string; name: string }[];
  compact?: boolean;
  resultCount?: number;
  onDone?: () => void;
  navigation?: ReturnType<typeof useTransition>;
};

export function CatalogFilters({ filters, basePath, makes, models, fits, categories, total, bodies, compact = false, resultCount, onDone, navigation }: CatalogFilterProps) {
  const router = useRouter();
  const localNavigation = useTransition();
  const [pending, startTransition] = navigation || localNavigation;
  const [selection, setSelection] = useOptimistic(filters);

  const techart = filters.brand === 'techart';
  const porscheLineup = techart && (!selection.model || selection.model === '911' || selection.model === 'cayenne');
  const generation = selection.generation || techartGeneration(selection.fit) || '';
  const generationOptions = [...new Set(fits.flatMap(fit => techartGeneration(fit) ?? []))];
  const trimOptions = fits.filter(fit => generation && fit.startsWith(generation + '_'));
  const fitment = selection.fit && selection.fit !== generation ? selection.fit : '';

  function apply(changes: Partial<Filters>) {
    const next = updateFilters(selection, changes);
    startTransition(() => {
      setSelection(next);
      router.push(filterUrl(basePath, next), { scroll: false });
    });
  }

  function reset() {
    const next = { brand: selection.brand, stock: selection.stock };
    startTransition(() => {
      setSelection(next);
      router.push(filterUrl(basePath, next), { scroll: false });
    });
  }

  return <form className={compact ? 'shop-sheet-form' : undefined} aria-label="Catalogue filters" aria-busy={pending} onSubmit={event => event.preventDefault()}>
    {makes.length > 1 && <FilterChoice label="Vehicle make" value={selection.make || ''} placeholder="All makes"
      options={makes.map(value => [value, label(value)])} onChange={make => apply({ make })} />}
    {makes.length === 1 && !(techart && models.length > 0) && <div className="shop-fixed-make">{label(makes[0])}</div>}
    {!!models.length && <FilterChoice label={techart ? 'Model' : 'Vehicle model'} value={selection.model || ''} placeholder="All models"
      options={models.map(value => [value, label(value)])} onChange={model => apply({ model })} />}
    {porscheLineup && <>
      <FilterChoice label="Generation" value={generation} disabled={!selection.model || !generationOptions.length}
        placeholder={selection.model ? 'All generations' : 'Select a model first'}
        options={generationOptions.map(value => [value, fitLabel(value).toUpperCase()])} onChange={generation => apply({ generation })} />
      <FilterChoice label="Fitment" value={fitment} disabled={!trimOptions.length}
        placeholder={generation ? 'All fitments' : 'Select a generation first'}
        options={trimOptions.map(value => [value, techartFitmentLabel(value)])} onChange={fit => apply({ fit })} />
    </>}
    {techart && !porscheLineup && !!fits.length && <FilterChoice label="Fitment" value={selection.fit || ''} placeholder="All fitments"
      options={fits.map(value => [value, fitLabel(value)])} onChange={fit => apply({ fit })} />}
    {(porscheLineup || !!bodies.length) && <FilterChoice label="Body Style" value={selection.body || ''}
      disabled={!bodies.length || (porscheLineup && !fitment)}
      placeholder={porscheLineup && !fitment ? 'Select a fitment first' : 'All body styles'}
      options={bodies.map(body => [body.key, body.name])} onChange={body => apply({ body })} />}
    <FilterChoice label={filters.brand === 'valvetronic' ? 'Exhaust type' : 'Category'} value={selection.category || ''}
      placeholder="All parts" placeholderCount={total}
      options={categories.map(({ name, count }) => [name, name, { count, disabled: count === 0 && selection.category !== name }])}
      onChange={category => apply({ category })} />
    <button className="shop-filter-reset" type="button" onClick={reset}>Reset</button>
    {onDone && <footer className="shop-sheet-footer"><button className="shop-button" type="button" disabled={pending} onClick={onDone}>{pending ? 'Updating parts…' : 'View ' + resultCount + (resultCount === 1 ? ' part' : ' parts')} <ActionArrow direction="right" size={16} /></button></footer>}
  </form>;
}


function FilterChoice({ label, placeholder, placeholderCount, options, value, disabled, onChange }: {
  label: string;
  placeholder: string;
  placeholderCount?: number;
  options: CatalogChoiceOption[];
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const current = options.find(([key]) => key === value)?.[1] || placeholder;

  return <div className="shop-field">
    <span>{label}</span>
    <CatalogChoice variant="filter" label={`${label} · ${current}`} value={value} disabled={disabled}
      options={[['', placeholder, placeholderCount === undefined ? undefined : { count: placeholderCount }], ...options]} onChange={onChange}>
      <span>{current}</span>
      <ChevronDown size={15} aria-hidden="true" />
    </CatalogChoice>
  </div>;
}
