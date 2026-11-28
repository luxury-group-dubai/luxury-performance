'use client';

import { BrandArtwork } from '../brand-artwork';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import logoSelection from '../shop/logo-selection.module.css';
import styles from './partner-marquee.module.css';

type PartnerLogo = { name: string; slug: string; href?: string; label?: string };

// Use the same transparent brand artwork as the hero wherever available.
const partners: PartnerLogo[] = [
  { name: 'NOVITEC', slug: 'novitec' },
  { name: 'Valvetronic Designs', slug: 'valvetronic' },
  { name: 'TECHART', slug: 'techart' },
  { name: 'FI Exhaust', slug: 'fi-exhaust' },
  { name: 'Gintani', slug: 'gintani', href: '/partners/gintani', label: 'Explore Gintani' },
  { name: 'Liberty Walk', slug: 'liberty-walk', href: '/contact?programme=Liberty%20Walk', label: 'Enquire about Liberty Walk' },
  { name: 'Voltrix', slug: 'voltrix', href: '/contact?programme=Voltrix', label: 'Enquire about Voltrix' },
];

const ribbons = [
  { layout: styles.desktop, logos: partners },
  { layout: styles.mobile, logos: partners.slice(0, 4) },
  { layout: `${styles.mobile} ${styles.reverse}`, logos: partners.slice(4) },
];

export function PartnerMarquee() {
  const sectionRef = useRef<HTMLElement>(null);
  const [logosReady, setLogosReady] = useState(false);
  const ribbonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => setLogosReady(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio > 0)) {
        setLogosReady(true);
        observer.disconnect();
      }
    }, { threshold: .01 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const tracks = ribbonsRef.current?.querySelectorAll(`.${styles.track}`);
    if (!tracks || typeof ResizeObserver === 'undefined') return;

    // Each row travels its own width at the same speed.
    const observer = new ResizeObserver(entries => {
      for (const { target } of entries) {
        const width = target.getBoundingClientRect().width;
        if (width > 0) target.parentElement?.style.setProperty('--partner-duration', `${width / 28}s`);
      }
    });
    tracks.forEach(track => {
      if (track.firstElementChild) observer.observe(track.firstElementChild, { box: 'border-box' });
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} id="brands" aria-label="Authorised partners" onFocusCapture={() => setLogosReady(true)}>
      <div className={styles.heading}>
        <p>Authorised partners</p>
      </div>
      <div className={`${styles.ribbons} ${logoSelection.grid}`} id="partner-logos" ref={ribbonsRef}>
        {ribbons.map(({ layout, logos }) => (
          <div key={layout} className={`${styles.viewport} ${layout}`}>
            <div className={styles.track}>
              {[false, true].map(duplicate => (
                <div key={String(duplicate)} className={styles.group} aria-hidden={duplicate || undefined}>
                  {logos.map(partner => (
                    <Link
                      key={partner.slug}
                      href={partner.href ?? `/partners/${partner.slug}`}
                      prefetch={false}
                      tabIndex={duplicate ? -1 : undefined}
                      aria-label={duplicate ? undefined : partner.label ?? `Explore ${partner.name}`}
                      className={`${styles.logo} ${logoSelection.item}`}
                      data-brand={partner.slug}
                    >
                      <span className="sr-only">{partner.label ?? `Explore ${partner.name}`}</span>
                      {logosReady ? <BrandArtwork brand={partner.slug} labelled={!duplicate} /> : <noscript><BrandArtwork brand={partner.slug} labelled={!duplicate} className={styles.noscriptLogo} loading="lazy" /></noscript>}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
