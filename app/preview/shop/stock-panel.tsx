'use client';
import { useShopParams as useSearchParams } from '@/components/shop/use-shop-params';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowDownWideNarrow, ArrowUpRight, ChevronDown, X } from 'lucide-react';
import { MenuLogo } from '@/components/shop-menu-cards';
import { limitedStock, vehicleMenu } from '@/lib/shop-navigation';
import { CatalogChoice } from '@/components/shop/catalog-choice';
import { categoryOf, label, supplierOf, suppliers, tagsFor } from '@/lib/shop/taxonomy';
import { isUsedPart, wheelGroupSize, wheelGroupUnit } from '@/lib/shop/used-parts';
import { money, type CatalogProduct } from '@/lib/shop/types';
import { stockBrowseHref } from '@/lib/shop/routes';
import styles from './stock-panel.module.css';

const groups = [{ key: 'all', name: 'All stock' }, { key: 'used', name: 'Used OEM parts' }, { key: 'urban', name: 'URBAN kits' }];
const unique = (values: string[]) => [...new Set(values)].sort((a, b) => label(a).localeCompare(label(b)));
// Older used-part listings lack vehicle tags. Only infer the manufacturer
// explicitly named in their title; model/variant compatibility stays unguessed.
const stockMakes = (product: CatalogProduct) => {
  const tagged = tagsFor(product, 'make');
  if (tagged.length || !isUsedPart(product)) return tagged;
  const title = product.title.toLowerCase().replace(/[-–—]/g, ' ');
  return vehicleMenu.flatMap(item => {
    const make = new URLSearchParams(item.href.split('?')[1]).get('make')!;
    const name = (make === 'mercedes' ? 'Mercedes' : item.name).toLowerCase().replace(/[-–—]/g, ' ');
    return title.includes(name) ? [make] : [];
  });
};
const brandName = (value: string) => suppliers.find(supplier => supplier.slug === value)?.name ?? label(value);

export function StockPanel({ products, usedProducts, failed }: { products: CatalogProduct[]; usedProducts: CatalogProduct[]; failed: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const group = groups.some(item => item.key === params.get('stock_group')) ? params.get('stock_group')! : 'all';
  const make = params.get('make') || '';
  const model = params.get('model') || '';
  const brand = params.get('brand') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || '';
  const scoped = group === 'used' ? usedProducts : group === 'urban' ? products.filter(product => supplierOf(product) === 'urban') : products;
  const makes = unique(scoped.flatMap(stockMakes));
  const byMake = scoped.filter(product => !make || stockMakes(product).includes(make));
  const models = unique(byMake.flatMap(product => tagsFor(product, 'model')));
  const byVehicle = byMake.filter(product => !model || tagsFor(product, 'model').includes(model));
  const brands = unique(byVehicle.map(supplierOf));
  const byBrand = byVehicle.filter(product => !brand || supplierOf(product) === brand);
  const categories = unique(byBrand.map(categoryOf));
  const shown = byBrand.filter(product => !category || categoryOf(product) === category);
  if (sort === 'price-up') shown.sort((a, b) => Number(a.priceRange.minVariantPrice.amount) - Number(b.priceRange.minVariantPrice.amount));
  if (sort === 'price-down') shown.sort((a, b) => Number(b.priceRange.minVariantPrice.amount) - Number(a.priceRange.minVariantPrice.amount));
  if (sort === 'name') shown.sort((a, b) => a.title.localeCompare(b.title));
  const visible = Math.max(24, Math.min(Number(params.get('show')) || 24, shown.length));

  function update(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams(params);
    next.set('view', 'stock');
    if (!changes.show) next.delete('show');
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    router.push(stockBrowseHref(Object.fromEntries(next)), { scroll: false });
  }
  function clear() { update({ make: undefined, model: undefined, brand: undefined, category: undefined }); }
  const choice = (key: string, name: string, value: string, values: string[], onChange: (value: string) => void, display = label) => <CatalogChoice key={key} variant="filter" label={name} value={value} options={[["", name], ...values.map(item => [item, display(item)] as const)]} onChange={onChange}><span>{value ? display(value) : name}</span><ChevronDown size={13} aria-hidden="true" /></CatalogChoice>;

  return <div className={styles.panel}>
    <div className={styles.collections} role="group" aria-label="Stock collections">
      {groups.map(item => <button key={item.key} aria-pressed={group === item.key} onClick={() => update({ stock_group: item.key === 'all' ? undefined : item.key, make: undefined, model: undefined, brand: undefined, category: undefined })}>{item.name}</button>)}
    </div>
    {failed ? <div className={styles.empty} role="status"><p>Stock availability couldn’t be loaded.</p><button onClick={() => router.refresh()}>Try again</button></div> : <>
      {!!scoped.length && <div className={styles.toolbar}>
        <div className={styles.filters}>
          {makes.length > 0 && choice('make', 'All vehicles', make, makes, value => update({ make: value, model: undefined, brand: undefined, category: undefined }))}
          {make && models.length > 0 && choice('model', 'All models', model, models, value => update({ model: value, brand: undefined, category: undefined }))}
          {group === 'all' && choice('brand', 'All brands', brand, brands, value => update({ brand: value, category: undefined }), brandName)}
          {choice('category', 'All categories', category, categories, value => update({ category: value }), value => value)}
          {(make || model || brand || category) && <button className={styles.clear} onClick={clear}><X size={13} />Clear</button>}
        </div>
        <CatalogChoice variant="sort" label="Sort in-stock parts" value={sort} options={[["", "Default"], ["price-up", "Price: low to high"], ["price-down", "Price: high to low"], ["name", "Name: A–Z"]]} onChange={value => update({ sort: value })}><ArrowDownWideNarrow size={17} aria-hidden="true" /><span>Sort</span></CatalogChoice>
      </div>}
      {group === 'urban' && !scoped.length ? <div className={styles.urbanEnquiry}>
        <div className={styles.urbanLogo}><MenuLogo item={limitedStock} /></div>
        <h2>Two kits from our stock.</h2>
        <p>Contact our team for vehicle compatibility, included components and photographs.</p>
        <Link href="/contact?programme=URBAN%20Automotive">Enquire about the kits <ArrowUpRight size={16} aria-hidden="true" /></Link>
      </div> : shown.length ? <>
        <div className={styles.grid}>{shown.slice(0, visible).map(product => <Link className={`shop-product-card ${styles.card}`} key={product.id} href={`/products/${product.handle}`}>
          <div className="shop-product-image">{product.featuredImage ? <Image src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} width={600} height={600} sizes="(max-width:700px) 44vw, (max-width:1100px) 29vw, 22vw" /> : <span>{product.vendor}</span>}<span className="shop-product-arrow"><ArrowUpRight size={18} aria-hidden="true" /></span></div>
          <h3>{product.title}</h3><p className="shop-price">{wheelGroupSize(product) ? `${money(product.priceRange.minVariantPrice)} / ${wheelGroupUnit(wheelGroupSize(product)!)}` : `From ${money(product.priceRange.minVariantPrice)}`}</p>
        </Link>)}</div>
        {shown.length > visible && <button className={styles.more} onClick={() => update({ show: String(visible + 24) })}>Show more parts</button>}
      </> : <div className={styles.empty} role="status"><p>{make || model || brand || category ? 'No in-stock parts match this selection.' : group === 'urban' ? 'No URBAN kits are currently in stock.' : group === 'used' ? 'No used OEM parts are currently in stock.' : 'No parts are currently in stock.'}</p>{(make || model || brand || category) && <button onClick={clear}>Clear filters</button>}</div>}
    </>}
  </div>;
}
