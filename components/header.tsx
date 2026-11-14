"use client";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ActionArrow } from '@/components/action-arrow';
import Link from 'next/link';
import { HeaderSearch } from './header-search';
import { CartButton } from './shop/cart-provider';
import { BrandLogo } from './brand-logo';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, ChevronDown, X } from 'lucide-react';
import { inStockShopPath } from '@/lib/shop/taxonomy';
import { brandMenu, limitedStock, usedParts } from '@/lib/shop-navigation';
import styles from './header-menus.module.css';
import { MenuCards, MenuLogo } from './shop-menu-cards';
import dynamic from 'next/dynamic';
import { SocialLinks } from './social-links';
import { contact } from '@/lib/content';
import { hasPartnerHeroOverlay } from '@/lib/brand-hero-images';

const VehicleMenu = dynamic(() => import('./vehicle-menu').then(module => module.VehicleMenu), { loading: () => <p role="status">Loading vehicles…</p> });

type ShopMenu = 'brands' | 'vehicles';
const menus = [{ key: 'brands' as const, label: 'By brand' }, { key: 'vehicles' as const, label: 'By vehicle' }];
const links = [{ name: 'HOME', href: '/' }, { name: 'PARTNERS', href: '/partners' }, { name: 'ABOUT', href: '/about' }, { name: 'CONTACT', href: '/contact' }];
function BrandMenu({ close }: { close: () => void }) {
  return <>
    <MenuCards items={brandMenu} close={close} logoOnly />
    <div className={styles.stockArea}>
      <span className={styles.stockLabel}>From our stock</span>
      <div className={styles.stockChoices}>{[usedParts, limitedStock].map(item => <Link key={item.name} href={item.href} onClick={close} className={styles.stockLink}>
        <span className={styles.stockMark}><MenuLogo item={item}/></span>
        <span>{item.name}<small>{item.note}</small></span><ArrowUpRight size={16}/>
      </Link>)}</div>
    </div>
  </>;
}
function ShopContents({ selected, select, prefix, close, dismiss, label }: { selected: ShopMenu; select: (value: ShopMenu) => void; prefix: string; close: () => void; dismiss?: () => void; label?: string }) {
  return <>
    <div className={styles.shopToolbar}>
      <div className={styles.shopBrowse}>
      {label && <span className={styles.shopLabel}>{label}</span>}
      <div className={styles.shopTabs} role="tablist" aria-label="Browse parts">
        {menus.map((menu, index) => <button key={menu.key} className={styles.shopTab} role="tab" id={`${prefix}-tab-${menu.key}`} aria-controls={`${prefix}-panel-${menu.key}`} aria-selected={selected === menu.key} tabIndex={selected === menu.key ? 0 : -1} onClick={() => select(menu.key)} onKeyDown={event => {
          let next = index;
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = 1 - index;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = menus.length - 1;
          else return;
          event.preventDefault(); select(menus[next].key);
          document.getElementById(`${prefix}-tab-${menus[next].key}`)?.focus();
        }}>{menu.label}</button>)}
      </div>
      </div>
      <div className={styles.shopActions}>
        <Link className={`${styles.shopAll} action-secondary`} href={inStockShopPath} onClick={close}>All in stock <ActionArrow/></Link>
        <Link className={`${styles.shopAll} action-secondary`} href="/shop" onClick={close}>View all parts <ActionArrow/></Link>
        {dismiss && <button className={styles.close} aria-label="Close shop" onClick={dismiss}><X size={19}/></button>}
      </div>
    </div>
    {menus.map(menu => <div key={menu.key} id={`${prefix}-panel-${menu.key}`} role="tabpanel" aria-labelledby={`${prefix}-tab-${menu.key}`} hidden={selected !== menu.key} data-shop-category={menu.key}>
      {selected === menu.key && (menu.key === 'brands' ? <BrandMenu close={close}/> : <VehicleMenu close={close}/>)}
    </div>)}
  </>;
}
export function Header() {
  const [open, setOpen] = useState(false);
  const [shopMenu, setShopMenu] = useState<ShopMenu | null>(null);
  const [mobileSection, setMobileSection] = useState<ShopMenu>('brands');
  const pathname = usePathname();
  const isShop = pathname === '/shop' || pathname === '/studio/capristo';
  const partnerSlug = /^\/partners\/([^/]+)$/.exec(pathname)?.[1];
  const overlaysHero = pathname === '/' || Boolean(partnerSlug && hasPartnerHeroOverlay(partnerSlug));
  const header = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const dropdown = useRef<HTMLDivElement>(null);
  const shopGlass = useRef<HTMLDivElement>(null);
  const shopTrigger = useRef<HTMLButtonElement>(null);
  const shopPinned = useRef(false);
  const hoverClose = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelHoverClose = useCallback(() => {
    if (hoverClose.current === null) return;
    clearTimeout(hoverClose.current);
    hoverClose.current = null;
  }, []);
  const closeShop = useCallback(() => {
    cancelHoverClose();
    shopPinned.current = false;
    setShopMenu(null);
  }, [cancelHoverClose]);
  const close = () => { setOpen(false); closeShop(); };

  function openShopOnHover(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== 'mouse' || open) return;
    cancelHoverClose();
    setShopMenu(current => current ?? 'brands');
  }

  function scheduleShopClose(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || shopPinned.current) return;
    const next = event.relatedTarget;
    if (next instanceof Node && (shopTrigger.current?.contains(next) || dropdown.current?.contains(next))) return;
    cancelHoverClose();
    // Give the pointer time to cross the space between the trigger and panel.
    hoverClose.current = setTimeout(() => {
      hoverClose.current = null;
      if (!shopPinned.current && !dropdown.current?.contains(document.activeElement)) closeShop();
    }, 180);
  }

  function toggleShop() {
    if (shopMenu && shopPinned.current) {
      closeShop();
      return;
    }
    cancelHoverClose();
    shopPinned.current = true;
    setShopMenu(current => current ?? 'brands');
  }

  useEffect(() => cancelHoverClose, [cancelHoverClose]);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const nav = header.current;
      if (!nav) return;
      // Read layout before changing classes or custom properties.
      const y = window.scrollY;
      const hero = overlaysHero ? document.querySelector('[data-header-hero], [data-home-hero]') : null;
      const heroBottom = hero?.getBoundingClientRect().bottom ?? 0;
      const headerHeight = nav.offsetHeight;
      const partnerBrowsing = pathname === '/partners/capristo' || pathname === '/partners/gintani'
        ? document.querySelector('[data-partner-browsing]')?.getBoundingClientRect()
        : undefined;
      const heroFade = Math.min(1, Math.max(0, (heroBottom - headerHeight) / 180));
      nav.style.setProperty('--glass-progress', String(Math.min(1, Math.max(0, y / 160))));
      nav.classList.toggle('is-scrolled', y > 32);
      nav.classList.toggle('is-past-hero', !hero || heroBottom <= headerHeight);
      nav.classList.toggle('is-over-partner-browsing', !!partnerBrowsing
        && partnerBrowsing.top <= headerHeight && partnerBrowsing.bottom > headerHeight);
      nav.style.setProperty('--hero-fade-opacity', String(heroFade));
      nav.style.setProperty('--hero-glass-progress', String(1 - heroFade));
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    // The homepage CSS already describes the unscrolled header. Restored positions
    // and other routes still need their current geometry applied immediately.
    if (pathname !== '/' || window.scrollY > 0) update();
    else {
      header.current?.style.setProperty('--glass-progress', '0');
      header.current?.style.setProperty('--hero-fade-opacity', '1');
      header.current?.style.setProperty('--hero-glass-progress', '0');
      header.current?.classList.remove('is-scrolled', 'is-past-hero', 'is-over-partner-browsing');
    }
    window.addEventListener('scroll', scroll, { passive: true }); window.addEventListener('resize', scroll);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scroll); };
  }, [pathname, overlaysHero]);
  useEffect(() => {
    const nav = header.current;
    const content = dropdown.current;
    if (!shopMenu || !nav || !content) return;
    const measure = () => {
      if (shopGlass.current) shopGlass.current.style.height = `${nav.offsetHeight + content.offsetHeight}px`;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [shopMenu]);
  useEffect(() => {
    if (!shopMenu) return;
    const outside = (event: PointerEvent) => { if (!header.current?.contains(event.target as Node)) closeShop(); };
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { closeShop(); shopTrigger.current?.focus(); } };
    const focus = (event: FocusEvent) => { if (!header.current?.contains(event.target as Node)) closeShop(); };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', key); document.addEventListener('focusin', focus);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', key); document.removeEventListener('focusin', focus); };
  }, [shopMenu, closeShop]);
  useEffect(() => {
    const mq = matchMedia('(min-width: 1101px)');
    const change = () => { setOpen(false); closeShop(); };
    mq.addEventListener('change', change);
    return () => mq.removeEventListener('change', change);
  }, [closeShop]);
  useEffect(() => {
    if (!open) return;
    const scrollRoot = isShop ? document.documentElement : document.body;
    const previous = scrollRoot.style.overflow;
    scrollRoot.style.overflow = 'hidden';
    const background = Array.from(document.querySelectorAll<HTMLElement>('#main, footer'));
    const previousInert = background.map(element => element.inert);
    background.forEach(element => { element.inert = true; });
    panel.current?.querySelector<HTMLElement>('a,button')?.focus({ preventScroll: true });
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') { setOpen(false); toggle.current?.focus({ preventScroll: true }); }
      if (event.key === 'Tab') {
        const controls = Array.from(panel.current?.querySelectorAll<HTMLElement>('a,button') ?? []).filter(el => el.getClientRects().length);
        const elements = [toggle.current, ...controls].filter(Boolean) as HTMLElement[];
        const first = elements[0], last = elements.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => { scrollRoot.style.overflow = previous; background.forEach((element, index) => { element.inert = previousInert[index]; }); document.removeEventListener('keydown', onKey); };
  }, [open, isShop]);
  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <header ref={header} className={`site-header ${isShop ? 'shop-site-header' : ''} ${overlaysHero ? 'hero-header' : ''} ${styles.header} ${open || shopMenu ? 'menu-is-open' : ''} ${open ? 'full-menu-is-open' : shopMenu ? 'shop-menu-is-open' : ''}`}>
      <button ref={toggle} className={`menu-toggle ${styles.burger}`} aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="full-navigation" onClick={() => { setOpen(!open); closeShop(); setMobileSection('brands'); }}><span aria-hidden="true"><i/><i/></span></button>
      <nav aria-label="Main navigation" inert={open} className={`desktop-nav ${styles.desktop}`}>
        <div className={styles.menuGroup}>
          <button ref={shopTrigger} className={styles.trigger} aria-expanded={Boolean(shopMenu)} aria-controls="shop-menu"
            onPointerEnter={openShopOnHover} onPointerLeave={scheduleShopClose} onClick={toggleShop}
            onKeyDown={event => {
              if (event.key !== 'ArrowDown') return;
              event.preventDefault();
              cancelHoverClose();
              shopPinned.current = true;
              setShopMenu(current => current ?? 'brands');
              requestAnimationFrame(() => dropdown.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus());
            }}>SHOP<ChevronDown size={12}/></button>
          {shopMenu && <div className={styles.dropdown} id="shop-menu" ref={dropdown} onPointerEnter={cancelHoverClose} onPointerLeave={scheduleShopClose}>
            <ShopContents selected={shopMenu} select={setShopMenu} prefix="desktop-shop" close={close} dismiss={() => { closeShop(); shopTrigger.current?.focus(); }}/>
            <div className={styles.menuFooter}>
              <Link className="action-secondary" href="/partners" onClick={close}>Explore all partners <ActionArrow size={15}/></Link>
              <Link className="action-secondary" href="/contact" onClick={close}>Need help with fitment? <ActionArrow size={15}/></Link>
            </div>
          </div>}
        </div>
        <Link href="/partners" onClick={close} aria-current={pathname === '/partners' ? 'page' : undefined}>PARTNERS</Link>
        <Link href="/about" onClick={close} aria-current={pathname === '/about' ? 'page' : undefined}>ABOUT</Link>
      </nav>
      <Link inert={open} className="brand" href="/#top" onClick={event => { close(); if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && window.location.pathname === '/') window.scrollTo({ top: 0, behavior: 'instant' }); }} aria-label="Luxury Performance home"><BrandLogo priority wordmark={false}/></Link>
      <div inert={open} className={`header-shop-actions ${styles.actions}`}>
        <div className={styles.utilityActions}>
          <HeaderSearch onOpen={close}/>
          <span onClick={close}><CartButton/></span>
        </div>
        <Link className="header-contact" href="/contact" onClick={close}>CONTACT <ActionArrow/></Link>
      </div>
    </header>
    {shopMenu && <div ref={shopGlass} className={`navigation-glass-surface navigation-shop-glass ${styles.shopGlass}`} aria-hidden="true" />}
    {open && <div className="navigation-glass-surface" aria-hidden="true" />}
    {open && <div ref={panel} className={`mobile-menu ${styles.mobile}`} id="full-navigation"><nav aria-label="Full navigation"><div className={styles.fullShop}>
      <ShopContents selected={mobileSection} select={setMobileSection} prefix="full-shop" close={close} label="SHOP"/>
      </div><div className={styles.mobileLinks}><span className={styles.sectionLabel}>Explore Luxury Performance</span>{links.map(link => <Link key={link.name} href={link.href} onClick={close} aria-current={pathname === link.href ? 'page' : undefined}>{link.name}<ArrowUpRight size={20}/></Link>)}
        <div className={styles.menuDetails}>
          <p className={styles.menuMotto}>Beyond Ordinary.</p>
          <a className={`${styles.menuAddress} action-secondary`} href={contact.maps} target="_blank" rel="noopener noreferrer">4th Street, Al Quoz Industrial 3<br/>Dubai, United Arab Emirates <ActionArrow size={12} /><span className="sr-only"> (opens in a new tab)</span></a>
          <SocialLinks/>
        </div>
      </div>
    </nav></div>}
  </>;
}
