import { ActionArrow } from '@/components/action-arrow';
import { BrandLogo } from './brand-logo';
import Link from 'next/link';
import { contact } from '@/lib/content';
import { SocialLinks } from './social-links';
import styles from './footer.module.css';

export function Footer() {
  return <footer className="site-footer">
    <div className={styles.main}>
      <div className={styles.identity}>
        <Link href="/#top" className="footer-brand" aria-label="Luxury Performance home"><BrandLogo /></Link>
        <p className={styles.motto}>Beyond Ordinary.</p>
      </div>
      <div className={styles.group}>
        <span className={styles.label}>Find us</span>
        <a className="action-secondary" href={contact.maps} target="_blank" rel="noopener noreferrer">4th Street, Al Quoz Industrial 3<br />Dubai, United Arab Emirates <ActionArrow size={13} /></a>
        <p className={styles.hours}>Monday–Saturday · 10am–8pm</p>
      </div>
      <div className={styles.group}>
        <span className={styles.label}>Get in touch</span>
        <a href={`tel:${contact.telephone}`}>{contact.phone}</a>
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
        <div className={styles.socials}><SocialLinks /></div>
      </div>
      <nav className={`${styles.group} ${styles.navigation}`} aria-label="Footer navigation">
        <span className={styles.label}>Discover</span>
        <Link href="/partners">PARTNERS</Link>
        <Link href="/about">ABOUT</Link>
        <Link href="/contact">CONTACT</Link>
        <Link href="/shop" className={`${styles.store} action-secondary`}>Online store <ActionArrow size={13} /></Link>
      </nav>
    </div>
    <div className={`footer-bottom ${styles.bottom}`}>
      <span>A division of The Luxury Group Dubai</span>
      <span className={styles.signature}>Luxury Performance</span>
      <span className={styles.meta} data-widget-obstacle>© {new Date().getFullYear()} Luxury Performance</span>
    </div>
  </footer>;
}
