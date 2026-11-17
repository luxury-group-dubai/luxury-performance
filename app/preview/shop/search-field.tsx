'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Search, X } from 'lucide-react';
import type { VehicleChoices } from './vehicle-navigation';
import { searchShopDestinations } from './search';
import { previewSearchHref, previewSearchPath } from './search-navigation';
import { SearchDestinationLabel } from '@/components/shop/search-destination-label';
import styles from './shop-entry.module.css';

type SearchPart = { id: string; title: string; handle: string; vendor: string };

export function ShopSearchField({ models, initialQuery = '' }: { models: VehicleChoices; initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<{ query: string; parts: SearchPart[]; total: number; failed?: boolean }>({ query: '', parts: [], total: 0 });
  const trimmed = query.trim();
  useEffect(() => {
    if (trimmed.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then(response => { if (!response.ok) throw new Error('Search unavailable'); return response.json(); })
        .then(data => { if (!controller.signal.aborted) setResult({ query: trimmed, parts: data.products ?? [], total: data.total ?? 0 }); })
        .catch(() => { if (!controller.signal.aborted) setResult({ query: trimmed, parts: [], total: 0, failed: true }); });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [trimmed]);
  const { brands, vehicles, collections } = searchShopDestinations(models, trimmed);
  const ready = result.query === trimmed;

  return (
        <div className={styles.searchWrap} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
          <form className={styles.search} role="search" action={previewSearchPath} onSubmit={event => { event.preventDefault(); setOpen(false); router.push(previewSearchHref(trimmed)); }}>
            <Search size={18} aria-hidden="true" /><input name="q" aria-label="Search brands, vehicles and parts" placeholder="Search a brand, car or part…" autoComplete="off" maxLength={100} value={query} onChange={event => { setQuery(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }} />
            {query && <button type="button" aria-label="Clear shop search" onClick={() => setQuery('')}><X size={16} /></button>}
          </form>
          {open && trimmed.length >= 2 && <div className={styles.results}>
            {!!brands.length && <section><h2>Brands</h2>{brands.map(item => <Link key={item.name} href={item.href}><SearchDestinationLabel item={item}/><ArrowUpRight size={15} /></Link>)}</section>}
            {!!vehicles.length && <section><h2>Vehicles</h2>{vehicles.map(item => <Link key={item.href} href={item.href}><SearchDestinationLabel item={item}/><ArrowUpRight size={15} /></Link>)}</section>}
            {!!collections.length && <section><h2>Vehicle collections</h2>{collections.map(item => <Link key={item.href} href={item.href}><SearchDestinationLabel item={item}/><ArrowUpRight size={15} /></Link>)}</section>}
            {!ready ? <p role="status">Searching parts…</p> : result.failed ? <p role="status">Parts search is unavailable. Browse by brand or vehicle below.</p> : <>
              {!!result.parts.length && <section><h2>Parts</h2>{result.parts.slice(0, 4).map(part => <Link href={`/products/${part.handle}`} key={part.id}><span>{part.title}<small>{part.vendor}</small></span><ArrowUpRight size={15} /></Link>)}</section>}
              {result.total > 0 && <Link className={styles.allResults} href={previewSearchHref(trimmed)}>View all {result.total} matching parts <ArrowUpRight size={15} /></Link>}
              {!brands.length && !vehicles.length && !collections.length && !result.parts.length && <p>No matches. Try a brand, model or article number.</p>}
            </>}
          </div>}
        </div>
  );
}
