import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ActionArrow } from '@/components/action-arrow';
import { nlargoAvailable, nlargoCta } from '@/lib/nlargo-allocation';
import { nlargoHeroImages, type NlargoHeroImage } from '@/lib/nlargo-hero-images';
import styles from './nlargo.module.css';

export function AllocationHeroArt({ image, children }: { image: NlargoHeroImage; children?: ReactNode }) {
  return (<div className={styles.heroArt} style={{ '--nlargo-image-shift': `${image.shift}%`, '--nlargo-image-scale': image.scale ?? 1, '--nlargo-image-offset-x': `${image.offsetX ?? 0}%`, backgroundColor: image.background } as CSSProperties}>
        <div className={styles.heroExtension} aria-hidden="true" style={{ backgroundImage: image.extension ?? `url(${image.edge})` }} />
        <Image key={image.id} src={image.src} alt={image.alt} width={3200} height={2133} quality={95}
          sizes="(max-width: 760px) 147vw, 83vw" loading="eager" fetchPriority="high"
 />
        {children}
      </div>);
}

export function AllocationHero({ image = nlargoHeroImages[0], enquiryHref = '#private-enquiry', effect }: {
  image?: NlargoHeroImage; enquiryHref?: string; effect?: ReactNode;
}) {
  return (
    <section className={styles.hero} data-light={image.lighting === 'light'} data-header-hero data-fluid-reveal={!!effect} aria-labelledby="nlargo-title">
      <AllocationHeroArt image={image}>{effect}</AllocationHeroArt>
      <div className={styles.heroCopy}>
        <Link className={styles.back} href="/partners/novitec">NOVITEC</Link>
        <p className={styles.kicker}>Ferrari 12Cilindri</p>
        <h1 id="nlargo-title">N-LARGO</h1>
        <p className={styles.heroStatement}>{nlargoAvailable ? <>One exclusive<br />allocation available.</> : <>An exceptional chapter.<br />Fully allocated.</>}</p>
        <p className={styles.heroIntro}>{nlargoAvailable ? 'Luxury Performance has secured the first N-LARGO reveal vehicle and one additional conversion allocation, available for a private client.' : 'Luxury Performance’s additional N-LARGO conversion allocation has been secured. Discover the project and speak with us about future opportunities.'}</p>
        <a className={styles.button} href={enquiryHref}>{nlargoCta}<ActionArrow size={18} /></a>
        <p className={styles.packageNote}>An N-LARGO conversion for your Ferrari 12Cilindri Coupé, or the opportunity to purchase a complete N-LARGO vehicle.</p>
      </div>
      <div className={styles.heroFoot}><span>Luxury Performance / Dubai</span><span>Official NOVITEC release</span></div>
    </section>
  );
}
