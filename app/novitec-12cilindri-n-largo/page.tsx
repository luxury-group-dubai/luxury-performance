import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ActionArrow } from '@/components/action-arrow';
import { AllocationForm } from '@/components/nlargo/allocation-form';
import { nlargoAllocation, nlargoAvailable, nlargoCta, nlargoGallery, nlargoPath, nlargoStatus } from '@/lib/nlargo-allocation';
import { contact } from '@/lib/content';
import styles from '@/components/nlargo/nlargo.module.css';

const description = nlargoAvailable
  ? 'Discover Luxury Performance’s private NOVITEC Ferrari 12Cilindri N-LARGO conversion allocation. First reveal vehicle secured for Dubai. Conversion package only; Ferrari vehicle not included.'
  : 'Luxury Performance’s NOVITEC Ferrari 12Cilindri N-LARGO conversion allocation is fully allocated. Discover the project and enquire about future opportunities.';
export const metadata: Metadata = {
  title: 'Ferrari 12Cilindri N-LARGO | Private Allocation', description,
  alternates: { canonical: nlargoPath },
  openGraph: { title: 'Ferrari 12Cilindri N-LARGO — Luxury Performance', description, url: nlargoPath,
    images: [{ url: '/images/nlargo/hero.webp', width: 1920, height: 1080, alt: 'NOVITEC Ferrari 12Cilindri N-LARGO' }] },
};

export default function NlargoAllocationPage() {
  const teaser = nlargoAllocation.mediaStage === 'teaser';
  return <div className={styles.page}>
    <section className={styles.hero} data-header-hero aria-labelledby="nlargo-title">
      <div className={styles.heroArt}><Image src="/images/nlargo/story.webp" alt="Front view of the Ferrari 12Cilindri N-LARGO against red lighting, official NOVITEC teaser" fill sizes="(max-width: 760px) 100vw, 56vw" loading="eager" fetchPriority="high" /></div>
      <div className={styles.heroCopy}>
        <Link className={styles.back} href="/partners/novitec">NOVITEC / Private commissions</Link>
        <p className={styles.kicker}>Ferrari 12Cilindri</p>
        <h1 id="nlargo-title">N-LARGO</h1>
        <p className={styles.heroStatement}>{nlargoAvailable ? <>One exclusive<br />allocation available.</> : <>An exceptional chapter.<br />Fully allocated.</>}</p>
        <p className={styles.heroIntro}>{nlargoAvailable ? 'Luxury Performance has secured the first N-LARGO reveal vehicle and one additional conversion allocation, available for a private client.' : 'Luxury Performance’s additional N-LARGO conversion allocation has been secured. Discover the project and speak with us about future opportunities.'}</p>
        <a className={styles.button} href="#private-enquiry">{nlargoCta}<ActionArrow size={18} /></a>
        <p className={styles.packageNote}>NOVITEC conversion package only.<br />Ferrari vehicle not included.</p>
      </div>
      <div className={styles.heroFoot}><span>Luxury Performance / Dubai</span><span>{teaser ? 'Official NOVITEC preview' : 'Official NOVITEC release'}</span></div>
    </section>

    <div className={styles.statusBar}><span className={styles.status}>{nlargoStatus}</span><span>For private clients worldwide</span><a href="#private-enquiry">Private enquiry <ActionArrow size={16} /></a></div>

    <section className={styles.introduction} aria-labelledby="conversion-title">
      <p className={styles.eyebrow}>The conversion</p>
      <div><h2 id="conversion-title">A different presence.<br /><span>A singular opportunity.</span></h2><p>N-LARGO brings NOVITEC’s distinctive widebody design language to the Ferrari 12Cilindri. An expressive interpretation of the V12 grand tourer, commissioned around an exceptional car.</p><p>Our team in Dubai will guide you through the available specification, vehicle compatibility and the next steps for your project. Every commercial detail is discussed personally.</p></div>
    </section>

    <section className={styles.filmSection} aria-labelledby="film-title">
      <div className={styles.sectionLabel}><h2 id="film-title">{teaser ? 'The first glimpse.' : 'The unveiling.'}</h2><span>NOVITEC / 12Cilindri N-LARGO</span></div>
      <video className={styles.film} controls playsInline preload="none" poster="/images/nlargo/hero.webp" aria-label={teaser ? 'Official NOVITEC N-LARGO teaser film' : 'Official NOVITEC N-LARGO release film'}><source src="/videos/nlargo/teaser.mp4" type="video/mp4" />Your browser does not support this video. <a href="/videos/nlargo/teaser.mp4">Download the film</a>.</video>
      <p className={styles.caption}>{teaser ? 'Official NOVITEC teaser film. Full release photography will follow the unveiling.' : 'Official NOVITEC release imagery and film.'}</p>
    </section>

    <section className={styles.allocation} aria-labelledby="allocation-title">
      <div className={styles.allocationIntro}><p className={styles.eyebrow}>The Luxury Performance allocation</p><h2 id="allocation-title">The first car.<br />Your next chapter.</h2><p>Two distinct commitments. The reveal vehicle secured by Luxury Performance, and a separate conversion allocation for a private client.</p></div>
      <div className={styles.commitments}>
        <article><div><h3>The reveal vehicle</h3><p>Luxury Performance has secured the very first N-LARGO reveal vehicle. Its arrival marks the beginning of this project’s next chapter in Dubai.</p><span className={styles.detailLine}>{nlargoAllocation.arrival}</span></div></article>
        <article><div><h3>{nlargoAvailable ? 'Your private allocation' : 'The private allocation'}</h3><p>{nlargoAvailable ? 'One additional NOVITEC N-LARGO conversion allocation is available for a customer’s Ferrari 12Cilindri. Enquiries are welcomed from owners and collectors worldwide.' : 'The additional NOVITEC N-LARGO conversion allocation is now fully allocated. Our team remains available to discuss future NOVITEC projects.'}</p><span className={styles.detailLine}>{nlargoStatus}</span></div></article>
        <dl className={styles.delivery}><div><dt>Expected package delivery</dt><dd>{nlargoAllocation.deliveryWindow ?? 'Timing confirmed privately'}</dd></div><div><dt>Allocation includes</dt><dd>NOVITEC conversion package only</dd></div><div><dt>Ferrari vehicle</dt><dd>Not included</dd></div></dl>
        <p className={styles.caption}>Package delivery is an estimate, separate from vehicle arrival and conversion completion. This allocation is for the Ferrari 12Cilindri Coupé. Final specification and timing are confirmed with our team.</p>
      </div>
    </section>

    <section className={styles.gallery} aria-label={teaser ? 'Official NOVITEC teaser stills' : 'Official NOVITEC release gallery'}>
      {nlargoGallery.map((photo) => <figure key={photo.src}><div><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 760px) 100vw, 50vw" /></div><figcaption>{teaser ? 'From the official NOVITEC teaser' : 'Official NOVITEC release'}</figcaption></figure>)}
    </section>

    <section id="private-enquiry" className={styles.enquiry} aria-labelledby="enquiry-title">
      <div className={styles.enquiryIntro}><p className={styles.eyebrow}>A private conversation</p><span className={styles.status}>{nlargoStatus}</span><h2 id="enquiry-title">{nlargoAvailable ? 'Make it yours.' : 'Stay in the conversation.'}</h2><p>{nlargoAvailable ? 'Tell us about your Ferrari and your plans. Our sales team will discuss the allocation, specification and next steps with you personally.' : 'Leave your details for a personal conversation about future NOVITEC opportunities.'}</p><p className={styles.scope}>This opportunity is for the NOVITEC N-LARGO conversion package for the Ferrari 12Cilindri Coupé. It is not an offer for a complete Ferrari vehicle.</p><a className={styles.direct} href={contact.whatsapp} target="_blank" rel="noopener noreferrer">Prefer to speak directly?<br /><strong>WhatsApp {contact.phone}</strong><ActionArrow size={18} /></a></div>
      <AllocationForm available={nlargoAvailable} />
    </section>
    <nav className={styles.related} aria-label="Explore NOVITEC"><Link href="/partners/novitec">Explore NOVITEC <ActionArrow size={16} /></Link><Link href="/shop?brand=novitec&make=ferrari&model=12cilindri">12Cilindri parts <ActionArrow size={16} /></Link></nav>
  </div>;
}
