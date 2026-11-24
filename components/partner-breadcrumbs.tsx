import Link from 'next/link';
import styles from './partner-breadcrumbs.module.css';

type Props = { partner: { slug: string; name: string }; marque?: string; model?: string };

export function PartnerBreadcrumbs({ partner, marque, model }: Props) {
  const items = [
    { name: 'PARTNERS', href: '/partners' },
    { name: partner.name, href: `/partners/${partner.slug}` },
    ...(marque ? [{ name: marque, href: `/partners/${partner.slug}/${marque.toLowerCase().replaceAll(' ', '-')}` }] : []),
    ...(model ? [{ name: model, href: '' }] : []),
  ];
  return <nav className={styles.trail} aria-label="Breadcrumb">
    {items.map((item, index) => <span key={item.name} className={styles.item}>
      {index > 0 && <span aria-hidden="true">/</span>}
      {index === items.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.href}>{item.name}</Link>}
    </span>)}
  </nav>;
}
