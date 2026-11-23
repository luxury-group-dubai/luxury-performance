import Link from 'next/link';
import { ActionArrow } from '@/components/action-arrow';
import { nlargoCta, nlargoPath, nlargoStatus } from '@/lib/nlargo-allocation';
import styles from './nlargo.module.css';

export function AllocationBanner({ compact = false }: { compact?: boolean }) {
  return <aside className={`${styles.banner} ${compact ? styles.compact : ''}`}  aria-label="N-LARGO private allocation">
    <div><span className={styles.eyebrow}>{nlargoStatus}</span><h2>Ferrari 12Cilindri N-LARGO</h2>{!compact && <p>Enquire about an N-LARGO conversion allocation or a complete vehicle.</p>}</div>
    <Link className={styles.button} href={nlargoPath}>{nlargoCta}<ActionArrow size={18} /></Link>
  </aside>;
}
