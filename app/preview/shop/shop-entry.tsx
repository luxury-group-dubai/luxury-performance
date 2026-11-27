'use client';
import { useShopParams as useSearchParams } from '@/components/shop/use-shop-params';

import { useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { previewShopBrands as brandMenu } from './navigation';
import { MenuLogo } from '@/components/shop-menu-cards';
import { ManufacturerLogo } from '@/components/shop/manufacturer-logo';
import { label } from '@/lib/shop/taxonomy';
import type { StockProduct } from './stock-data';
import { StockPanel } from './stock-panel';
import { vehicleChoiceHref, vehicleStepHref, type VehicleChoices } from './vehicle-navigation';
import { stockBrowseHref, vehicleBrowseHref } from '@/lib/shop/routes';
import { ShopSearchField } from './search-field';
import logoSelection from '@/components/shop/logo-selection.module.css';
import styles from './shop-entry.module.css';

const makeKey = (item: { key: string }) => item.key;

const shopTabs = [{ key: 'brands', name: 'By brand' }, { key: 'vehicles', name: 'By vehicle' }, { key: 'stock', name: 'In stock' }];

export function ShopEntryPreview({ models, stockProducts, usedStockProducts, stockFailed }: { models: VehicleChoices; stockProducts: StockProduct[]; usedStockProducts: StockProduct[]; stockFailed: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const view = shopTabs.some(tab => tab.key === params.get('view')) ? params.get('view')! : 'brands';
  const manufacturers = useMemo(() => Object.keys(models).filter(key => models[key].length).map(key => ({ key, name: label(key) })).sort((a, b) => a.name.localeCompare(b.name)), [models]);
  const selected = view === 'vehicles' ? manufacturers.find(item => makeKey(item) === params.get('make')) : undefined;
  const model = selected ? models[makeKey(selected)]?.find(item => item.slug === params.get('model')) : undefined;
  const car = model?.variants?.length ? model.variants.find(item => item.body === params.get('body')) : model;
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  function switchTab(next: string) { router.push(next === 'vehicles' ? vehicleBrowseHref() : next === 'stock' ? stockBrowseHref() : '/shop', { scroll: false }); }

  return <div className={styles.page}>
    <header className={styles.intro}>
      <div className={styles.headline}><h1>Shop.</h1><p>Find your brand, your car, or what’s in stock.</p>
        <ShopSearchField models={models} />
      </div>
      <div className={styles.browseBar}>
        <div role="tablist" aria-label="Browse shop" className={styles.tabs}>{shopTabs.map((tab, index) => <button key={tab.key} ref={element => { tabs.current[index] = element; }} role="tab" id={`entry-tab-${tab.key}`} aria-controls={`entry-panel-${tab.key}`} aria-selected={view === tab.key} tabIndex={view === tab.key ? 0 : -1} onClick={() => switchTab(tab.key)} onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? shopTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + shopTabs.length) % shopTabs.length;
          switchTab(shopTabs[next].key); tabs.current[next]?.focus();
        }}>{tab.name}</button>)}</div>
      </div>
    </header>
    <section className={styles.browse} id="entry-panel-brands" role="tabpanel" aria-labelledby="entry-tab-brands" hidden={view !== 'brands'}>
      <div className={`${styles.brandGrid} ${logoSelection.grid}`}>{brandMenu.map(item => <Link key={item.name} href={item.href} className={`${styles.brandCard} ${logoSelection.item}`} aria-label={`${item.note ? 'Enquire about' : 'Shop'} ${item.name}`} prefetch={false}><MenuLogo reveal item={item} />{item.note && <small className={styles.enquiryNote}>{item.note}</small>}</Link>)}</div>
    </section>
    <section className={styles.browse} id="entry-panel-vehicles" role="tabpanel" aria-labelledby="entry-tab-vehicles" hidden={view !== 'vehicles'}>
      {!selected ? <div className={`${styles.vehicleGrid} ${logoSelection.grid}`}>{manufacturers.map(item => <Link href={vehicleStepHref(makeKey(item))} scroll={false} key={item.name} className={`${styles.brandCard} ${logoSelection.item}`} aria-label={`Choose ${item.name} model`}><ManufacturerLogo make={item.key} name={item.name} /></Link>)}</div> : <>
        <div className={styles.modelHeading}><div><Link className={styles.back} href={model ? vehicleStepHref(makeKey(selected), car?.body ? model.slug : undefined) : '/shop/vehicles'} scroll={false}><ArrowLeft size={14} />{car?.body ? 'Change version' : model ? 'Change car' : 'All vehicles'}</Link><h2>{car ? `${selected.name} ${car.name}.` : model ? `Choose your ${model.name}.` : `Choose your ${selected.name}.`}</h2>{car && <p className={styles.selectionPrompt}>Choose a brand for your car.</p>}</div></div>
        {car ? <div className={`${styles.brandGrid} ${logoSelection.grid}`}>{car.brands.map(brand => <Link key={brand.slug} href={brand.href} className={`${styles.brandCard} ${logoSelection.item}`} aria-label={`Shop ${brand.name} for ${selected.name} ${car.name}`} prefetch={false}>{brand.artwork ? <MenuLogo reveal item={brand} /> : <span className={styles.brandName}>{brand.name}</span>}</Link>)}</div> : <div className={styles.modelGrid}>{(model?.variants ?? models[makeKey(selected)] ?? []).map(choice => <Link key={choice.body ?? choice.slug} href={vehicleChoiceHref(makeKey(selected), choice)} scroll={false} prefetch={false}>{choice.name}<ArrowUpRight size={16} /></Link>)}</div>}
        {!models[makeKey(selected)]?.length && <p className={styles.note}><Link href="/contact">Ask our team about your model</Link>.</p>}
      </>}
    </section>
    <section id="entry-panel-stock" role="tabpanel" aria-labelledby="entry-tab-stock" hidden={view !== 'stock'}>
      <StockPanel products={stockProducts} usedProducts={usedStockProducts} failed={stockFailed} />
    </section>
  </div>;
}
