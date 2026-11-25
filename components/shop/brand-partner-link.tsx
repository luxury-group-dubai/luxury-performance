import Link from 'next/link';
import type { ReactNode } from 'react';
import { partners } from '@/lib/partners';
import styles from './brand-partner-link.module.css';

export function BrandPartnerLink({ brand, children }: { brand: string; children: ReactNode }) {
  const partner = partners.find(item => item.slug === brand || item.supplier === brand);
  return partner ? <Link href={`/partners/${partner.slug}`} className={styles.link} aria-label={`Explore ${partner.name}`}>
    {children}
  </Link> : children;
}
