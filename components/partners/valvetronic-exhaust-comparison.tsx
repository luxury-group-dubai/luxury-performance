'use client';

import { useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { MoveHorizontal } from 'lucide-react';
import { Eyebrow } from '@/components/ui';
import styles from './valvetronic-exhaust-comparison.module.css';

const imageSizes = '(max-width: 700px) 100vw, (max-width: 800px) 90vw, 720px';

export function ValvetronicExhaustComparison() {
  const [split, setSplit] = useState(50);

  return (
    <section id="exhaust-comparison" className={styles.section} aria-labelledby="exhaust-comparison-title">
      <div className={styles.copy}>
        <Eyebrow dark>BMW M3 / G80</Eyebrow>
        <h2 id="exhaust-comparison-title">Stock vs. Valvetronic.</h2>
        <p id="exhaust-comparison-instructions">Drag the divider to compare the exhausts.</p>
      </div>
      <figure className={styles.figure}>
        <div className={styles.stage} style={{ '--split': split / 100 } as CSSProperties}>
          <picture>
            <source media="(max-width: 480px)" type="image/avif" srcSet="/images/partners/valvetronic-mobile/g80.avif" />
          <Image
            className={styles.image}
            src="/images/partners/valvetronic-g80-cutout.webp"
            alt="BMW M3 underside with the Valvetronic exhaust, bronze pipework and four carbon-sleeved tips"
            fill
            sizes={imageSizes}
            quality={60}
            draggable={false}
          />
          </picture>
          <picture>
            <source media="(max-width: 480px)" type="image/avif" srcSet="/images/partners/valvetronic-mobile/g80-stock.avif" />
          <Image
            className={`${styles.image} ${styles.stock}`}
            src="/images/partners/valvetronic-g80-stock-patch.webp"
            alt="Factory BMW M3 exhaust with a wide silver rear muffler"
            fill
            sizes={imageSizes}
            quality={60}
            draggable={false}
          />
          </picture>
          <input
            className={styles.range}
            type="range"
            min={0}
            max={100}
            value={split}
            aria-label="Compare stock and Valvetronic exhausts"
            aria-describedby="exhaust-comparison-instructions"
            aria-valuetext={`${split}% stock, ${100 - split}% Valvetronic`}
            onInput={event => setSplit(event.currentTarget.valueAsNumber)}
          />
          <span className={styles.divider} aria-hidden="true" />
          <span className={styles.handle} aria-hidden="true"><MoveHorizontal size={20} strokeWidth={1.5} /></span>
        </div>
        <div className={styles.labels} aria-hidden="true"><span>Stock</span><span>Valvetronic</span></div>
        <figcaption className={styles.caption}>Illustrative renders based on Valvetronic reference photos.</figcaption>
      </figure>
    </section>
  );
}
