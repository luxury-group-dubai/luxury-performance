'use client';
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, X } from 'lucide-react';
import type { CatalogProduct } from '@/lib/shop/types';
import { money } from '@/lib/shop/types';
import styles from './novitec-feed.module.css';

type FeedLook = { name: string; image: string; products: CatalogProduct[]; fallback: string };
export function NovitecFeed({ looks }: { looks: FeedLook[] }) {
  const [selected, setSelected] = useState<FeedLook | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  function open(look: FeedLook) { setSelected(look); dialog.current?.showModal(); }
  return <section className={styles.section} aria-labelledby="feed-title">
    <div className={styles.heading}><div><h2 id="feed-title">Shop the feed</h2><p>Explore the parts behind the cars.</p></div><a href="https://www.instagram.com/lxp.official/" target="_blank" rel="noopener noreferrer" className={styles.follow}>Follow @lxp.official <ArrowUpRight size={16} aria-hidden="true" /></a></div>
    <div className={styles.grid}>{looks.map(look => <button type="button" className={styles.card} key={look.name} onClick={() => open(look)} aria-label={`Shop the ${look.name} look`}>
      <Image src={look.image} alt={`${look.name} with NOVITEC upgrades`} fill sizes="(max-width: 700px) 70vw, (max-width: 1100px) 30vw, 20vw" />
      <span className={styles.cardText}><span>{look.name}</span><span>Shop the look <ArrowUpRight size={15} aria-hidden="true" /></span></span>
    </button>)}</div>
    <dialog ref={dialog} className={styles.dialog} onClose={() => setSelected(null)} aria-labelledby="look-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      {selected && <><div className={styles.dialogHead}><div><span className={styles.label}>Shop the look</span><h3 id="look-title">{selected.name}</h3></div><button type="button" className={styles.close} onClick={() => dialog.current?.close()} aria-label="Close"><X size={20} /></button></div>
        <div className={styles.productList}>{selected.products.map(product => <Link href={`/products/${product.handle}`} className={styles.product} key={product.id} onClick={() => dialog.current?.close()}><span className={styles.productImage}>{product.featuredImage && <img src={`${product.featuredImage.url}${product.featuredImage.url.includes('?') ? '&' : '?'}width=240`} alt="" loading="lazy" />}</span><span><span className={styles.productName}>{product.title}</span><span className={styles.price}>From {money(product.priceRange.minVariantPrice)}</span></span><ArrowUpRight size={17} aria-hidden="true" /></Link>)}</div>
        {!selected.products.length && <p className={styles.empty}>Explore the available NOVITEC parts for this car.</p>}
        <Link href={selected.fallback} className={styles.more} onClick={() => dialog.current?.close()}>Explore all {selected.name} parts <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </>}
    </dialog>
  </section>;
}
