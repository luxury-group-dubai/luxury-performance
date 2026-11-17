'use client';
/* eslint-disable @next/next/no-img-element */
import { ActionArrow } from '@/components/action-arrow';
import { useEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Search, X } from 'lucide-react';
import { lockOverlayScroll } from '@/lib/overlay-scroll-lock';
import { BrandLogo } from './brand-logo';
import { inStockShopPath } from '@/lib/shop/taxonomy';
import { money, type Money, type Photo } from '@/lib/shop/types';
import { previewShopBrands } from '@/app/preview/shop/navigation';
import type { ShopSearchDestinations } from '@/app/preview/shop/search';
import { SearchDestinationLabel } from './shop/search-destination-label';
import { previewSearchHref, previewSearchPath } from '@/app/preview/shop/search-navigation';
import styles from './header-search-dialog.module.css';

type SearchProduct = { id: string; title: string; handle: string; vendor: string; image: Photo | null; price: Money };
type SearchReply = { products: SearchProduct[]; total: number } & Partial<ShopSearchDestinations>;
const suggestions = [
  { name: 'NOVITEC', href: '/shop?brand=novitec' },
  { name: 'Valvetronic Designs', href: '/shop?brand=valvetronic' },
  { name: 'TECHART', href: '/shop?brand=techart' },
  { name: 'All in stock', href: inStockShopPath },
];

export function HeaderSearchDialog({ trigger, onClose, preview = true }: { trigger: RefObject<HTMLButtonElement | null>; onClose: () => void; preview?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [reply, setReply] = useState<SearchReply | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const term = query.trim();
  const resultsUrl = preview ? previewSearchHref(term) : `/shop?q=${encodeURIComponent(term)}`;
  const discoveryLinks = preview ? [...previewShopBrands.filter(brand => ['novitec', 'valvetronic', 'techart'].includes(brand.artwork ?? '')), { name: 'All in stock', href: '/shop/in-stock' }] : suggestions;
  const destinationGroups = [
    { title: 'Brands', items: reply?.brands ?? [] },
    { title: 'Vehicles', items: reply?.vehicles ?? [] },
    { title: 'Vehicle collections', items: reply?.collections ?? [] },
  ].filter(group => group.items.length);

  useEffect(() => {
    const modal = dialog.current;
    const opener = trigger.current;
    const unlockScroll = lockOverlayScroll();
    modal?.showModal();
    input.current?.focus({ preventScroll: true });
    return () => { modal?.close(); unlockScroll(); opener?.focus({ preventScroll: true }); };
  }, [trigger]);

  useEffect(() => {
    if (term.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}${preview ? '&preview=1' : ''}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Search unavailable');
        const data: SearchReply = await response.json();
        if (!controller.signal.aborted) { setReply(data); setPending(false); }
      } catch {
        if (!controller.signal.aborted) { setError('Search is temporarily unavailable. Try again in a moment.'); setPending(false); }
      }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [term, preview]);

  function changeQuery(value: string) {
    setQuery(value);
    if (value.trim() === term) return;
    setReply(null); setError(''); setPending(value.trim().length >= 2);
  }
  function close() { onClose(); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!term) return;
    close(); router.push(resultsUrl);
  }

  return <dialog ref={dialog} className={styles.dialog} aria-labelledby="global-search-title" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); } }} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if (event.target === dialog.current) close(); }}>
      <div className={styles.content}>
        <div className={styles.top}><Link href="/#top" onClick={event => { close(); if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && window.location.pathname === '/') window.scrollTo({ top: 0, behavior: 'instant' }); }} aria-label="Luxury Performance home"><BrandLogo wordmark={false}/></Link><button type="button" className={styles.close} onClick={close} aria-label="Close search"><X size={24} strokeWidth={1.2}/></button></div>
        <h2 id="global-search-title" className={styles.eyebrow}>Find your next detail.</h2>
        <form action={preview ? previewSearchPath : '/shop'} role="search" onSubmit={submit} className={styles.form}>
          <label htmlFor="global-search-input" className="sr-only">Search parts, brands or vehicles</label>
          <Search size={25} strokeWidth={1.3} aria-hidden="true"/>
          <input ref={input} id="global-search-input" name="q" type="search" maxLength={100} value={query} onChange={event => changeQuery(event.target.value)} placeholder="Parts, brands or vehicles" autoComplete="off" spellCheck={false}/>
          <button type="submit" aria-label="View all search results" disabled={!term}><ArrowRight size={25} strokeWidth={1.3}/></button>
        </form>
        {term.length < 2 ? <div className={styles.discover}><p className={styles.eyebrow}>Explore the collection</p><nav aria-label="Search suggestions">{discoveryLinks.map(item => <Link key={item.name} href={item.href} onClick={close}>{preview ? <SearchDestinationLabel item={item}/> : item.name}<ArrowUpRight size={18} strokeWidth={1.3}/></Link>)}</nav></div> : <div className={styles.results} aria-busy={pending}>
          <p className={styles.status} role="status">{pending ? 'Finding matches…' : error || (reply ? `${reply.total} matching ${reply.total === 1 ? 'part' : 'parts'} for “${term}”` : '')}</p>
          {!!destinationGroups.length && <div className={styles.destinations}>{destinationGroups.map(group => <section key={group.title}>
            <h3 className={styles.eyebrow}>{group.title}</h3>
            <nav aria-label={`${group.title} search results`}>{group.items.map(item => <Link href={item.href} key={item.href} onClick={close} className="action-secondary"><SearchDestinationLabel item={item}/><ActionArrow size={16}/></Link>)}</nav>
          </section>)}</div>}
          {!!reply?.products.length && preview && <h3 className={styles.eyebrow}>Parts</h3>}
          {!!reply?.products.length && <div className={styles.grid}>{reply.products.map(product => <Link className={styles.product} key={product.id} href={`/products/${product.handle}`} onClick={close}>
            <span className={styles.image}>{product.image ? <img src={`${product.image.url}${product.image.url.includes('?') ? '&' : '?'}width=240`} alt=""/> : <Search size={22} strokeWidth={1}/>}</span>
            <span className={styles.productCopy}><small>{product.vendor}</small><strong>{product.title}</strong><span>From {money(product.price)}</span></span><ArrowUpRight size={16} strokeWidth={1.2}/>
          </Link>)}</div>}
          {reply?.total === 0 && !destinationGroups.length && <p className={styles.empty}>Try another part name, brand or vehicle.</p>}
          {!!reply?.total && <Link className={`${styles.allResults} action-secondary`} href={resultsUrl} onClick={close}>View all {reply.total} parts <ActionArrow direction="right" size={18} strokeWidth={1.3} /></Link>}
          {!!error && <button type="button" className={`${styles.allResults} action-secondary`} onClick={() => { changeQuery(''); input.current?.focus(); }}>Start a new search <ActionArrow direction="right" size={18} /></button>}
        </div>}
      </div>
    </dialog>;
}
