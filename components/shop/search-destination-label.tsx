import type { ShopSearchDestination } from '@/app/preview/shop/search';
import { MenuLogo } from '@/components/shop-menu-cards';
import { ManufacturerLogo } from './manufacturer-logo';
import styles from './search-destination-label.module.css';

export function SearchDestinationLabel({ item }: { item: ShopSearchDestination }) {
  return <span className={styles.identity}>
    {(item.make || item.artwork) && <span className={styles.logo} aria-hidden="true">
      {item.make ? <ManufacturerLogo make={item.make} name={item.logoName ?? item.name} /> : <MenuLogo reveal item={{ name: item.logoName ?? item.name, href: item.href, artwork: item.artwork }} />}
    </span>}
    <span className={styles.copy}>{item.name}{item.note && <small>{item.note}</small>}</span>
  </span>;
}
