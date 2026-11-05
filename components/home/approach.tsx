import Image from 'next/image';
import { ArrowLink, Eyebrow } from '@/components/ui';
import { Reveal } from '@/components/reveal';
import styles from './approach.module.css';

export function HomeApproach() {
  return <section id="approach" className={styles.section} aria-labelledby="home-approach-title">
    <div className={styles.image}>
      <Image src="/images/home/ferrari-sf90-workshop.webp" alt="Technician working on a red Ferrari SF90 in the workshop" fill sizes="(max-width: 850px) 100vw, 55vw" quality={90} />
    </div>
    <div className={styles.copy}>
      <Reveal>
        <Eyebrow dark number="02">The Luxury Performance approach</Eyebrow>
        <h2 id="home-approach-title">Good parts.<br />Great judgement.</h2>
        <p>From genuine components to fitment advice and installation support, we help you choose what works for your car.</p>
        <ArrowLink href="/about" light>Our story</ArrowLink>
      </Reveal>
    </div>
  </section>;
}
