import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { partners } from '@/lib/partners';
import { partnerHeroImages } from '@/lib/brand-hero-images';
import { BrandArtwork } from '@/components/brand-artwork';
import { ActionArrow } from '@/components/action-arrow';
import styles from './directory.module.css';

export const metadata: Metadata = { title: 'Our Partners', description: 'Discover NOVITEC, TECHART, Valvetronic Designs, CAPRISTO, FI Exhaust and Gintani with Luxury Performance, Dubai.', alternates: { canonical: '/partners' }, robots: { index: process.env.SHOP_SEO_LIVE === 'true', follow: true } };

export default function Partners() {
  return <div className={styles.directory}>
    <header className={styles.intro}>
      <h1>Partners.</h1>
      <p>Specialists in performance, sound and design.</p>
    </header>
    <section className={styles.grid} aria-label="Our partner brands">
      {partners.filter(partner => !partner.stockOnly).map((partner, index) => {
        const artwork = partner.slug === 'novitec'
          ? { image: '/images/nlargo/gallery-low-front-red.webp', alt: 'Ferrari 12Cilindri N-LARGO in red studio lighting' }
          : partner.slug === 'valvetronic'
            ? { image: partnerHeroImages.valvetronic!.mobile.src, alt: 'Rear wing and exposed Valvetronic exhaust on a Porsche GT3 RS' }
          : partner.slug === 'techart'
            ? { image: '/images/partners/techart-gt3-touring-rear.webp', alt: 'Rear view of a grey TECHART Porsche 992.2 GT3 Touring in an amber-lit garage' }
          : partner.slug === 'gintani'
            ? { image: '/images/partners/gintani-svj-flames-cinematic.webp', alt: 'Red Lamborghini Aventador SVJ with Gintani exhaust shooting blue flames at night' }
          : partnerHeroImages[partner.slug];
        return <Link key={partner.slug} href={`/partners/${partner.slug}`} className={styles.card} data-brand={partner.slug} aria-label={`Explore ${partner.name}`}>
          <Image className={styles.photo} src={artwork?.image || partner.image} alt={artwork?.alt || partner.imageAlt} fill sizes={partner.slug === 'novitec' ? '(max-width: 700px) 135vw, 68vw' : '(max-width: 700px) calc(100vw - 32px), calc(50vw - 32px)'} quality={90} loading={index < 2 ? 'eager' : 'lazy'} />
          <div className={styles.caption}>
            <h2 className={styles.brand}><span className="sr-only">{partner.name}</span><BrandArtwork brand={partner.slug} labelled={false} className={styles.logo} sizes="(max-width: 700px) 180px, 250px" /></h2>
            <span className={styles.explore}><span>Explore</span><ActionArrow size={23} strokeWidth={1.3} /></span>
          </div>
        </Link>;
      })}
    </section>
  </div>;
}
