import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionArrow } from '@/components/action-arrow';
import { AllocationHero } from '@/components/nlargo/allocation-hero';
import { FluidTrail } from '@/components/nlargo/fluid-trail';
import { nlargoHeroImages } from '@/lib/nlargo-hero-images';
import { AllocationForm } from '@/components/nlargo/allocation-form';
import { RevealFilm } from '@/components/nlargo/reveal-film';
import { RevealGallery } from '@/components/nlargo/reveal-gallery';
import { nlargoAllocation, nlargoAvailable, nlargoPath, nlargoStatus } from '@/lib/nlargo-allocation';
import { contact } from '@/lib/content';
import styles from '@/components/nlargo/nlargo.module.css';

const description = nlargoAvailable
  ? 'Discover Luxury Performance’s private NOVITEC Ferrari 12Cilindri N-LARGO allocation. First reveal vehicle secured for Dubai. Enquire privately.'
  : 'Luxury Performance’s NOVITEC Ferrari 12Cilindri N-LARGO conversion allocation is fully allocated. Discover the project and enquire about future opportunities.';
export const metadata: Metadata = {
  title: 'Ferrari 12Cilindri N-LARGO | Private Allocation', description,
  alternates: { canonical: nlargoPath },
  openGraph: { title: 'Ferrari 12Cilindri N-LARGO — Luxury Performance', description, url: nlargoPath,
    images: [{ url: '/images/nlargo/release-front.webp', width: 1920, height: 1280, alt: 'NOVITEC Ferrari 12Cilindri N-LARGO' }] },
};

export default function NlargoAllocationPage() {
  return <div className={styles.page}>
    <AllocationHero
      image={nlargoHeroImages.find(image => image.id === 'front-quarter-red')!}
      effect={<FluidTrail light={nlargoHeroImages.find(image => image.id === 'front-quarter-light')!} />}
    />

    <div className={styles.statusBar}><span className={styles.status}>{nlargoStatus}</span><span>For private clients worldwide</span><a href="#private-enquiry">Private enquiry <ActionArrow size={16} /></a></div>

    <section className={styles.introduction} aria-labelledby="conversion-title">
      <p className={styles.eyebrow}>The conversion</p>
      <div><h2 id="conversion-title">A different presence.<br /><span>A singular opportunity.</span></h2><p>N-LARGO brings NOVITEC’s distinctive widebody design language to the Ferrari 12Cilindri. An expressive interpretation of the V12 grand tourer, commissioned around an exceptional car.</p><p>Our team in Dubai will guide you through the available specification, vehicle compatibility and the next steps for your project. Every commercial detail is discussed personally.</p></div>
    </section>

    <section className={styles.filmSection} aria-labelledby="film-title">
      <div className={styles.sectionLabel}><h2 id="film-title">The unveiling.</h2><span>NOVITEC / 12Cilindri N-LARGO</span></div>
      <RevealFilm />
      <p className={styles.caption}>Redefining Perfection. The full official NOVITEC Ferrari 12Cilindri N-LARGO reveal film.</p>
    </section>

    <section className={styles.allocation} aria-labelledby="allocation-title">
      <div className={styles.allocationIntro}><p className={styles.eyebrow}>The Luxury Performance allocation</p><h2 id="allocation-title">The first car.<br />Your next chapter.</h2><p>Two distinct commitments. The reveal vehicle secured by Luxury Performance, and a separate conversion allocation for a private client.</p></div>
      <div className={styles.commitments}>
        <article><div><h3>The reveal vehicle</h3><p>Luxury Performance has secured the very first N-LARGO reveal vehicle. Its arrival marks the beginning of this project’s next chapter in Dubai.</p><span className={styles.detailLine}>{nlargoAllocation.arrival}</span></div></article>
        <article><div><h3>{nlargoAvailable ? 'Your private allocation' : 'The private allocation'}</h3><p>{nlargoAvailable ? 'One additional N-LARGO Coupé conversion allocation is available through Luxury Performance. Whether you wish to transform your own Ferrari 12Cilindri Coupé or purchase a complete N-LARGO vehicle, contact our team to discuss your preferred specification.' : 'The additional NOVITEC N-LARGO conversion allocation is now fully allocated. Our team remains available to discuss future NOVITEC projects.'}</p><span className={styles.detailLine}>{nlargoStatus}</span></div></article>
        <dl className={styles.delivery}><div><dt>Project options</dt><dd>Conversion allocation or complete vehicle</dd></div><div><dt>Expected conversion-package delivery</dt><dd>{nlargoAllocation.deliveryWindow ?? 'Timing confirmed privately'}</dd></div><div><dt>Complete-vehicle availability</dt><dd>Enquire privately</dd></div></dl>
        <p className={styles.caption}>Conversion-package delivery is separate from complete-vehicle availability and conversion completion. Final specification and timing are confirmed with our team.</p>
      </div>
    </section>

    <RevealGallery />

    <section id="private-enquiry" className={styles.enquiry} aria-labelledby="enquiry-title">
      <div className={styles.enquiryIntro}><p className={styles.eyebrow}>A private conversation</p><span className={styles.status}>{nlargoStatus}</span><h2 id="enquiry-title">{nlargoAvailable ? 'Make it yours.' : 'Stay in the conversation.'}</h2><p>{nlargoAvailable ? 'Tell us about your plans for the N-LARGO. Our sales team will discuss the allocation, specification and next steps with you personally.' : 'Leave your details for a personal conversation about future NOVITEC opportunities.'}</p><p className={styles.scope}>Specification and commercial details are discussed privately.</p><a className={styles.direct} href={contact.whatsapp} target="_blank" rel="noopener noreferrer">Prefer to speak directly?<br /><strong>WhatsApp {contact.phone}</strong><ActionArrow size={18} /></a></div>
      <AllocationForm available={nlargoAvailable} />
    </section>
    <nav className={styles.related} aria-label="Explore NOVITEC"><Link href="/partners/novitec">Explore NOVITEC <ActionArrow size={16} /></Link><Link href="/shop?brand=novitec&make=ferrari&model=12cilindri">12Cilindri parts <ActionArrow size={16} /></Link></nav>
  </div>;
}
