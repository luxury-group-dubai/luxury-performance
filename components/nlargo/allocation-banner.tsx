import { ActionLabel } from '@/components/action-label';
import Link from 'next/link';
import Image from 'next/image';
import { ActionArrow } from '@/components/action-arrow';
import { nlargoCta, nlargoPath, nlargoStatus } from '@/lib/nlargo-allocation';
import styles from './nlargo.module.css';

export function AllocationBanner({ compact = false, view = 'front' }: { compact?: boolean; view?: 'front' | 'rear' }) {
  return <aside className={`${styles.banner} ${compact ? styles.compact : ''}`}  aria-label="N-LARGO private allocation">
    {compact && <span className={`${styles.compactArtwork} ${view === 'rear' ? styles.rearArtwork : ''}`}  aria-hidden="true"><Image src={view === 'rear' ? '/images/nlargo/gallery-low-rear-light.webp' : '/images/nlargo/hero-front-quarter-light.webp'} alt="" fill sizes="(max-width: 700px) 260px, 360px" quality={60} /></span>}
    <div><span className={styles.eyebrow}>{nlargoStatus}</span><h2>Ferrari 12Cilindri N-LARGO</h2>{!compact && <p>Enquire about an N-LARGO conversion allocation or a complete vehicle.</p>}</div>
    <Link className={styles.button} href={nlargoPath}><ActionLabel>{nlargoCta}</ActionLabel><ActionArrow size={18} /></Link>
  </aside>;
}
