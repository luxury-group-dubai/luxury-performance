'use client';

import { createContext, useContext, useId, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuiState } from '@assistant-ui/react';
import { ArrowUpRight, Check, Plus } from 'lucide-react';
import { parseLuperShopping, shoppingWhatsAppHref, type LuperCard } from '@/lib/luper-shopping';
import { contact } from '@/lib/content';
import { partners } from '@/lib/partners';
import { WhatsAppIcon } from './whatsapp-icon';
import { BrandArtwork } from './brand-artwork';
import { ManufacturerLogo } from './shop/manufacturer-logo';
import { label } from '@/lib/shop/taxonomy';
import styles from './luper-widget.module.css';

const EnquiryContext = createContext<{
  selected: LuperCard[]; toggle: (card: LuperCard) => void; clear: () => void; navigate: () => void;
}>({ selected: [], toggle: () => {}, clear: () => {}, navigate: () => {} });

export function LuperEnquiryProvider({ children, onNavigate }: { children: ReactNode; onNavigate: () => void }) {
  const [selected, setSelected] = useState<LuperCard[]>([]);
  return <EnquiryContext.Provider value={{ selected, navigate: onNavigate, clear: () => setSelected([]),
    toggle: card => setSelected(current => current.some(item => item.id === card.id)
      ? current.filter(item => item.id !== card.id) : [...current, card].slice(0, 3)),
  }}>{children}</EnquiryContext.Provider>;
}

export const useLuperEnquiry = () => useContext(EnquiryContext);

export function LuperRecommendations() {
  const data = useAuiState(state => state.message.metadata.custom?.shopping);
  const shopping = parseLuperShopping(data);
  const { selected, toggle, navigate } = useLuperEnquiry();
  if (!shopping?.recommendations.length) return null;
  return <div className={styles.recommendations} aria-label="Luper’s suggestions">
    {shopping.recommendations.map(card => {
      const included = selected.some(item => item.id === card.id);
      const showVendor = card.kind === 'product' && card.subtitle && !card.title.toLocaleLowerCase().includes(card.subtitle.toLocaleLowerCase());
      const destination = card.href.split('?')[0].split('/');
      // Resolve logos from the destination, not from AI text or vehicle model names.
      const brand = card.kind === 'brand' && destination[1] === 'partners'
        ? partners.find(partner => partner.slug === destination[2])
        : card.kind === 'shop' && destination[1] === 'shop' && destination[2]
          ? partners.find(partner => partner.supplier === destination[2]) : undefined;
      const allBrands = card.kind === 'shop' && destination[2] === 'vehicles';
      const make = allBrands ? destination[3]?.replaceAll('-', '_') : undefined;
      return <article className={styles.recommendation} key={card.id}>
        <Link href={card.href} onClick={navigate} className={styles.cardLink}>
          {brand ? <span className={styles.cardBrandLogo}><BrandArtwork brand={brand.slug} labelled={false} className={styles.brandArtwork} sizes="84px"/></span>
            : make ? <span className={styles.cardVehicleLogo} data-vehicle-logo={make}><ManufacturerLogo make={make} name={label(make)}/></span>
              : card.image && <span className={styles.cardImage}><Image src={card.image} alt="" width={64} height={64} sizes="64px"/></span>}
          <span className={styles.cardCopy}>
            {(card.kind !== 'product' || showVendor) && <small>{card.kind === 'product' || card.kind === 'programme' ? card.subtitle : card.kind === 'brand' ? 'Explore the brand' : allBrands ? 'Browse all brands' : 'Browse the shop'}</small>}
            <strong>{card.title}</strong>
            {card.price && <span>{card.price}</span>}
            <em>{card.kind === 'product' ? 'View product' : card.kind === 'programme' ? 'Enquire about N-LARGO' : 'Explore'} <ArrowUpRight size={12}/></em>
          </span>
        </Link>
        <button type="button" className={styles.addEnquiry} aria-pressed={included}
          aria-label={`${included ? 'Remove' : 'Add'} ${card.title} ${included ? 'from' : 'to'} enquiry`}
          disabled={!included && selected.length >= 3} onClick={() => toggle(card)}>
          {included ? <Check size={12}/> : <Plus size={12}/>} {included ? 'Added to your enquiry' : 'Add to enquiry'}
        </button>
      </article>;
    })}
    <p className={styles.cardNote}>Choose up to 3 options. Our team will confirm fitment and availability.</p>
  </div>;
}

export function LuperSelectedOptions() {
  const { selected, clear } = useLuperEnquiry();
  return selected.length ? <div className={styles.selectedOptions} aria-live="polite">
    <span>{selected.length} {selected.length === 1 ? 'option' : 'options'} in your enquiry</span>
    <button type="button" onClick={clear}>Clear</button>
  </div> : null;
}

export function LuperTeamHandoff() {
  const message = useAuiState(state => state.message);
  const shopping = parseLuperShopping(message.metadata.custom?.shopping);
  const { selected } = useLuperEnquiry();
  const hintId = useId();
  if (message.status?.type !== 'complete' || !shopping?.contactTeam) return null;
  // Each reply owns its draft, even after the visitor discusses another vehicle.
  const options = selected.filter(card => shopping.recommendations.some(option => option.id === card.id));
  const origin = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://luper.invalid');
  const href = shoppingWhatsAppHref(contact.whatsapp, shopping.profile, options, origin, shopping.enquirySummary);
  const hint = shopping.profile.make && shopping.profile.model
    ? 'Your car and request are already filled in.' : 'Your enquiry is already filled in.';
  return <div className={styles.teamHandoff}>
    <a className={styles.teamHandoffButton} data-channel="whatsapp" href={href} target="_blank" rel="noopener noreferrer" aria-describedby={hintId}>
      <WhatsAppIcon size={19}/><span>Ask our team on WhatsApp</span><ArrowUpRight size={15}/>
    </a>
    <p id={hintId}>{hint}</p>
  </div>;
}
