import Image from 'next/image';
import styles from './techart-personal-headline.module.css';

export function TechartPersonalHeadline() {
  return <><span className={styles.firstLine}>Your{' '}
    <span className={styles.badge} aria-hidden="true">
      <span className={styles.rotor}>
        {/* Each side uses its own shield silhouette so no backing protrudes
            beyond the face when the badges have different contours. */}
        {[-1.5, -1, -.5, 0, .5, 1, 1.5].map(depth => <span key={depth} className={styles.slices}>
          <span className={`${styles.core} ${styles.porscheCore}`} style={{ transform: `translateZ(${depth}px)` }} />
          <span className={`${styles.core} ${styles.techartCore}`} style={{ transform: `rotateY(180deg) translateZ(${depth}px)` }} />
        </span>)}
        <span className={`${styles.face} ${styles.porsche}`}>
          <Image src="/brand/crests/porsche-metal-small.webp" alt="" width={128} height={145} sizes="56px" quality={75} />
        </span>
        <span className={`${styles.face} ${styles.techart}`}>
          <Image src="/brand/crests/techart-black-lion-small.webp" alt="" width={128} height={152} sizes="56px" quality={75} />
        </span>
      </span>
    </span>{' '}Porsche</span><br />made personal.</>;
}
