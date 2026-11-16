import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { filterUrl } from '@/lib/shop/taxonomy';
import { nlargoPath } from '@/lib/nlargo-allocation';
import models from '../../[make]/models.module.css';
import styles from './versions.module.css';

export const metadata: Metadata = {
  title: 'NOVITEC Ferrari 12Cilindri, Spider and N-LARGO',
  description: 'Choose the Ferrari 12Cilindri, 12Cilindri Spider or N-LARGO to explore NOVITEC parts and private projects with Luxury Performance.',
  alternates: { canonical: '/partners/novitec/ferrari/12cilindri' },
  robots: { index: process.env.SHOP_SEO_LIVE === 'true', follow: true },
};

const versions = [
  {
    name: '12Cilindri N-LARGO', image: '/images/novitec-models/12cilindri-nlargo-side.jpg',
    href: nlargoPath, action: 'Explore N-LARGO',
    description: 'Discover the widebody project and discuss a conversion allocation or complete vehicle.',
  },
  {
    name: '12Cilindri Spider', image: '/images/novitec-models/12cilindri-spider-side.jpg',
    href: '/contact?' + new URLSearchParams({ programme: 'NOVITEC 12Cilindri Spider', vehicle: 'Ferrari 12Cilindri Spider' }).toString(),
    action: 'Enquire about Spider upgrades',
    description: 'Speak with our team about NOVITEC options and fitment for your Spider.',
  },
  {
    name: '12Cilindri', image: '/images/novitec-models/12cilindri-coupe-side.jpg',
    href: filterUrl('/shop', { brand: 'novitec', make: 'ferrari', model: '12cilindri' }),
    action: 'Explore 12Cilindri parts',
    description: 'Browse the NOVITEC parts catalogue for the Ferrari 12Cilindri Coupé.',
  },
];

export default function Novitec12CilindriVersions() {
  return <div className={models.page}><div className={models.inner}>
    <Link href="/partners/novitec/ferrari" className={models.back}><ArrowLeft size={16} aria-hidden="true" /> All Ferrari models</Link>
    <header className={models.heading}><div><p className={models.eyebrow}>NOVITEC / Ferrari / 12Cilindri</p><h1>Choose your 12Cilindri.</h1><p>Explore the Coupé, Spider or N-LARGO.</p></div></header>
    <ul className={`${models.grid} ${styles.grid}`} aria-label="Ferrari 12Cilindri versions">
      {versions.map(version => <li key={version.name}><Link className={models.card} href={version.href}>
        <span className={models.picture}><Image src={version.image} alt={`Ferrari ${version.name} by NOVITEC`} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 45vw, 30vw" quality={90} className={models.image} /></span>
        <span className={models.cardLabel}><span><small>Ferrari</small><strong>{version.name}</strong></span><ArrowUpRight size={20} aria-hidden="true" /></span>
        <p className={styles.description}>{version.description}</p><span className={styles.action}>{version.action}</span>
      </Link></li>)}
    </ul>
  </div></div>;
}
