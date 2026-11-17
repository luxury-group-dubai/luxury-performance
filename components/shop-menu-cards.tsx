"use client";
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { BrandArtwork } from './brand-artwork';
import { SelectorLogo } from './selector-logo';
import { ArrowUpRight } from 'lucide-react';
import type { ShopMenuItem } from '@/lib/shop-navigation';
import styles from './header-menus.module.css';
export function MenuLogo({ item, reveal = false }: { item: ShopMenuItem; reveal?: boolean }) {
  const logo = item.artwork ? <BrandArtwork brand={item.artwork} labelled={false} variant={reveal ? 'selector' : 'compact'} />
    : item.wordmark ? <span className={`${styles.logoFrame} ${styles.vehicleWordmark}`}><img fetchPriority={reveal ? 'high' : undefined} src={`/brand/navigation/wordmarks/${item.wordmark}`} alt="" className={item.logoClass ? styles[item.logoClass] : undefined}/></span>
    : <span className={styles.logoFrame}>{item.logo && <img fetchPriority={reveal ? 'high' : undefined} src={`/brand/navigation/${item.logo}`} alt="" className={item.logoClass ? styles[item.logoClass] : undefined}/>}</span>;
  return reveal ? <SelectorLogo label={item.name}>{logo}</SelectorLogo> : logo;
}
export function MenuCards({ items, close, logoOnly = false }: { items: ShopMenuItem[]; close: () => void; logoOnly?: boolean }) {
  return <div className={`${styles.cards} ${logoOnly ? styles.brandCards : ''}`}>{items.map(item => <Link className={`${styles.card} ${logoOnly ? styles.brandTile : ''}`} aria-label={logoOnly ? item.name : undefined} key={item.name} href={item.href} onClick={close} prefetch={false}><MenuLogo item={item}/>{!logoOnly && <span className={styles.cardName}>{item.name}<ArrowUpRight size={12}/></span>}{item.note && <small>{item.note}</small>}</Link>)}</div>;
}
