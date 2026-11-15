import Link from 'next/link';
import { ActionArrow } from '@/components/action-arrow';
import { nlargoCta, nlargoPath, nlargoStatus } from '@/lib/nlargo-allocation';
import styles from './nlargo.module.css';

export function AllocationBanner() {
  return <aside className={styles.banner} aria-label="N-LARGO private allocation">
    <div><span className={styles.eyebrow}>{nlargoStatus}</span><h2>Ferrari 12Cilindri N-LARGO</h2><p>NOVITEC conversion package only. Ferrari vehicle not included.</p></div>
    <Link className={styles.button} href={nlargoPath}>{nlargoCta}<ActionArrow size={18} /></Link>
  </aside>;
}
