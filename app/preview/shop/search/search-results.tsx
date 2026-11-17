'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownWideNarrow, ArrowUpRight } from 'lucide-react';
import { ActionArrow } from '@/components/action-arrow';
import { CatalogChoice } from '@/components/shop/catalog-choice';
import { SearchDestinationLabel } from '@/components/shop/search-destination-label';
import { CapristoImagePlaceholder } from '@/components/shop/capristo-image-placeholder';
import { money, type CatalogProduct } from '@/lib/shop/types';
import { isUsedPart, wheelGroupSize, wheelGroupUnit } from '@/lib/shop/used-parts';
import type { VehicleChoices } from '../vehicle-navigation';
import { searchShopDestinations } from '../search';
import { ShopSearchField } from '../search-field';
import headerStyles from '../shop-entry.module.css';
import styles from './search-results.module.css';

export function SearchResults({ query, products, models }: { query: string; products: CatalogProduct[]; models: VehicleChoices }) {
  const [sort, setSort] = useState('');
  const [visible, setVisible] = useState(24);
  const sorted = [...products];
  if (sort === 'price-up') sorted.sort((a, b) => Number(a.priceRange.minVariantPrice.amount) - Number(b.priceRange.minVariantPrice.amount));
  if (sort === 'price-down') sorted.sort((a, b) => Number(b.priceRange.minVariantPrice.amount) - Number(a.priceRange.minVariantPrice.amount));
  if (sort === 'name') sorted.sort((a, b) => a.title.localeCompare(b.title));
  const destinations = searchShopDestinations(models, query);
  const groups = [{ title: 'Brands', items: destinations.brands }, { title: 'Vehicles', items: destinations.vehicles }, { title: 'Vehicle collections', items: destinations.collections }].filter(group => group.items.length);

  return <div className={styles.page}>
    <header className={`${headerStyles.intro} ${styles.header}`}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb"><Link href="/shop">SHOP</Link><span aria-hidden="true">/</span><span aria-current="page">SEARCH</span></nav>
      <div className={headerStyles.headline}><h1>Search.</h1><p>{query ? `${products.length} ${products.length === 1 ? 'part' : 'parts'} matching “${query}”` : 'Search a brand, car or part.'}</p><ShopSearchField models={models} initialQuery={query}/></div>
      {!!groups.length && <div className={styles.destinations}>{groups.map(group => <section key={group.title}><h2>{group.title}</h2>{group.items.map(item => <Link href={item.href} key={item.href} className="action-secondary"><SearchDestinationLabel item={item}/><ActionArrow size={16}/></Link>)}</section>)}</div>}
      {!!products.length && <div className={styles.toolbar}><span>ALL MATCHING PARTS</span><CatalogChoice variant="sort" label="Sort search results" value={sort} options={[["", "Relevance"], ["price-up", "Price: low to high"], ["price-down", "Price: high to low"], ["name", "Name: A–Z"]]} onChange={value => { setSort(value); setVisible(24); }}><ArrowDownWideNarrow size={17}/><span>Sort</span></CatalogChoice></div>}
    </header>
    <section className={styles.catalogue} aria-label="Matching parts">
      {products.length ? <>
        <div className={styles.grid}>{sorted.slice(0, visible).map(product => <Link className={`shop-product-card ${styles.card}`} href={`/products/${product.handle}`} key={product.id}>
          <div className="shop-product-image">{product.featuredImage ? <Image src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} width={600} height={600} sizes="(max-width:700px) 44vw, (max-width:1100px) 29vw, 22vw"/> : ['capristo', 'gintani'].includes(product.vendor.toLowerCase()) ? <CapristoImagePlaceholder brand={product.vendor.toLowerCase() as 'capristo' | 'gintani'}/> : <span>{product.vendor}</span>}<span className="shop-product-arrow"><ArrowUpRight size={18}/></span>{isUsedPart(product) && <span className="shop-used">Used</span>}</div>
          <h3>{product.title}</h3><p className="shop-price">{wheelGroupSize(product) ? `${money(product.priceRange.minVariantPrice)} / ${wheelGroupUnit(wheelGroupSize(product)!)}` : `From ${money(product.priceRange.minVariantPrice)}`}</p>
        </Link>)}</div>
        <p className={styles.count}>Showing {Math.min(visible, products.length)} of {products.length} parts</p>
        {visible < products.length && <button className={styles.more} onClick={() => setVisible(value => value + 24)}>SHOW MORE PARTS <ActionArrow size={16}/></button>}
      </> : <div className={styles.empty}><p>{query ? 'No parts match this search. Try a different model, brand or part name.' : 'Enter a brand, model or part name to see matching parts.'}</p><Link href="/shop" className="action-secondary">BROWSE THE SHOP <ActionArrow size={16}/></Link></div>}
    </section>
  </div>;
}
