import Link from 'next/link';
import styles from './partner-breadcrumbs.module.css';

type Props = { partner: { slug: string; name: string }; marque?: string };

export function PartnerBreadcrumbs({ partner, marque }: Props) {
  return <nav className={styles.trail} aria-label="Breadcrumb">
    <Link href="/partners">PARTNERS</Link><span aria-hidden="true">/</span>
    {marque ? <><Link href={`/partners/${partner.slug}`}>{partner.name}</Link><span aria-hidden="true">/</span><span aria-current="page">{marque}</span></> : <span aria-current="page">{partner.name}</span>}
  </nav>;
}
