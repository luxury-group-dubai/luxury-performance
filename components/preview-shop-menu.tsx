'use client';

import Link from 'next/link';
import { ArrowUpRight, X } from 'lucide-react';
import { ActionArrow } from './action-arrow';
import { MenuLogo } from './shop-menu-cards';
import { ManufacturerLogo } from './shop/manufacturer-logo';
import { previewPopularVehicles, previewShopBrands, previewShopTabs, previewStockLinks, type PreviewShopTab } from '@/app/preview/shop/navigation';
import styles from './preview-shop-menu.module.css';

type Props = { selected: PreviewShopTab; select: (tab: PreviewShopTab) => void; close: () => void; dismiss?: () => void; fullNavigation?: boolean };

export function PreviewShopMenu({ selected, select, close, dismiss, fullNavigation = false }: Props) {
  return <div className={`${styles.menu}${fullNavigation ? ` ${styles.fullMenu}` : ''}`}>
    {fullNavigation && <Link className={styles.shopHome} href="/shop" onClick={close}>SHOP <ArrowUpRight size={20} /></Link>}
    <div className={styles.toolbar}>
      <div className={styles.tabs} role="tablist" aria-label="Browse shop">
        {previewShopTabs.map((tab, index) => <button key={tab.key} role="tab" id={`preview-menu-tab-${tab.key}`} aria-controls={`preview-menu-panel-${tab.key}`} aria-selected={selected === tab.key} tabIndex={selected === tab.key ? 0 : -1} onClick={() => select(tab.key)} onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? previewShopTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + previewShopTabs.length) % previewShopTabs.length;
          select(previewShopTabs[next].key);
          document.getElementById(`preview-menu-tab-${previewShopTabs[next].key}`)?.focus();
        }}>{tab.label}</button>)}
      </div>
      {!fullNavigation && <div className={styles.actions}><Link className="action-secondary" href="/shop" onClick={close}>SHOP OVERVIEW <ActionArrow size={15} /></Link>{dismiss && <button aria-label="Close shop menu" onClick={dismiss}><X size={19} /></button>}</div>}
    </div>
    {previewShopTabs.map(tab => <div key={tab.key} role="tabpanel" id={`preview-menu-panel-${tab.key}`} aria-labelledby={`preview-menu-tab-${tab.key}`} hidden={selected !== tab.key}>
      {selected === tab.key && (tab.key === 'brands' ? <div className={styles.brandGrid}>{previewShopBrands.map(item => <Link key={item.name} className={styles.logoLink} href={item.href} onClick={close} prefetch={false} aria-label={`${item.note ? 'Enquire about' : 'Shop'} ${item.name}`}><MenuLogo reveal item={item} />{item.note && <small>{item.note}</small>}</Link>)}</div>
        : tab.key === 'vehicles' ? <><div className={styles.vehicleGrid}>{previewPopularVehicles.map(item => <Link key={item.make} className={styles.logoLink} href={item.href} onClick={close} prefetch={false} aria-label={`Choose ${item.name} model`}><ManufacturerLogo make={item.make} name={item.name} /></Link>)}</div><Link className={`${styles.browseAll} action-secondary`} href={tab.href} onClick={close}>VIEW ALL MANUFACTURERS <ActionArrow size={15} /></Link></>
          : <div className={styles.stockGrid}>{previewStockLinks.map(item => <Link key={item.name} href={item.href} onClick={close} className={styles.stockLink}><span>{item.name}<small>{item.description}</small></span><ArrowUpRight size={20} /></Link>)}</div>)}
    </div>)}
  </div>;
}
