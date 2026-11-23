import Link from 'next/link';
import { techartShopCopy } from '@/lib/shop/techart-seo';
import styles from './techart-guide.module.css';

export function TechartGuide({ model }: { model?: string }) {
  const copy = techartShopCopy(model);
  return <section className={styles.guide} aria-labelledby="techart-guide-title">
    <h2 id="techart-guide-title">{copy.rangeHeading}</h2>
    <div>
      <p>{copy.range}</p>
      <h3>Confirm the right fit.</h3>
      <p>{copy.fitment}</p>
      <p>Ask our Dubai team to confirm the supplied components, finish, availability and delivery estimate before ordering. We can also discuss installation options for your chosen specification.</p>
      <nav aria-label="Explore TECHART" className={styles.links}>
        {model !== '911' && <Link href="/shop/techart/porsche/911">Shop TECHART Porsche 911 parts</Link>}
        {model !== 'cayenne' && <Link href="/shop/techart/porsche/cayenne">Shop TECHART Porsche Cayenne parts</Link>}
        <Link href="/partners/techart">Explore TECHART at Luxury Performance</Link>
        <Link href="/contact?programme=TECHART">Discuss your Porsche specification</Link>
      </nav>
    </div>
  </section>;
}
