'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { novitecVariantFamilies } from '@/lib/shop/novitec-variants';
import entry from '../preview/shop/shop-entry.module.css';
import styles from './loading.module.css';

const tabs = [
  { href: '/shop', name: 'By brand' },
  { href: '/shop/vehicles', name: 'By vehicle' },
  { href: '/shop/in-stock', name: 'In stock' },
];

export default function Loading() {
  const pathname = usePathname();
  const vehicles = pathname.startsWith('/shop/vehicles');
  const stock = pathname.startsWith('/shop/in-stock');
  const overview = pathname === '/shop' || vehicles || stock;
  const search = pathname === '/shop/search';
  const [, , brand, make, model, body] = pathname.split('/');
  const hasVariants = !!novitecVariantFamilies[make?.replaceAll('-', '_')]?.[model];
  const parts = !overview && !search && !!model && (brand === 'techart' || (brand === 'novitec' && hasVariants) ? !!body : true);
  const productGrid = stock || search || parts;
  const active = vehicles ? '/shop/vehicles' : stock ? '/shop/in-stock' : '/shop';
  return <div className={entry.page} aria-busy="true">
    <span className="sr-only" role="status">Loading shop content</span>
    <header className={entry.intro}>
      <div className={entry.headline}>
        {overview || search ? <h1 className={overview ? entry.overviewTitle : undefined}>{search ? 'Search.' : 'Shop'}</h1> : <div className={`${styles.placeholder} ${styles.wordmark}`} aria-hidden="true" />}
        {overview && <p>Find your brand, your car, or what’s in stock.</p>}
        <div className={entry.searchWrap} aria-hidden="true"><div className={entry.search}><Search size={18} /><span className={styles.searchText}>Search a car, collection or part…</span></div></div>
      </div>
      {overview ? <nav className={styles.tabs} aria-label="Browse shop">{tabs.map(tab => <Link key={tab.href} href={tab.href} scroll={false} aria-current={active === tab.href ? 'page' : undefined}>{tab.name}</Link>)}</nav> : <div className={parts ? styles.vehicleHeader : styles.selectorHeader} aria-hidden="true"><div className={`${styles.placeholder} ${styles.title}`} />{parts && <div className={`${styles.placeholder} ${styles.car}`} />}</div>}
    </header>
    <div aria-hidden="true" className={`${styles.content} ${productGrid ? styles.products : ''}`}>
      {stock && <div className={styles.filters}><span className={styles.placeholder} /><span className={styles.placeholder} /><span className={styles.placeholder} /></div>}
      <div className={productGrid ? styles.productGrid : vehicles ? entry.vehicleGrid : entry.brandGrid}>
        {Array.from({ length: productGrid ? 4 : vehicles ? 8 : 9 }, (_, index) => <div key={index} className={productGrid ? styles.product : entry.brandCard}>
          <span className={`${styles.placeholder} ${productGrid ? styles.productImage : styles.logo}`} />
          {(productGrid) && <><span className={`${styles.placeholder} ${styles.productTitle}`} /><span className={`${styles.placeholder} ${styles.price}`} /></>}
        </div>)}
      </div>
    </div>
  </div>;
}
