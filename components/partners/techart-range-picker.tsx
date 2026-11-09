'use client';

import Image from 'next/image';
import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ArrowLink } from '@/components/ui';
import type { TechartRangeOption } from '@/lib/techart-range';
import styles from './techart-range-picker.module.css';

export function TechartRangePicker({ options }: { options: TechartRangeOption[] }) {
  const [selected, setSelected] = useState(options[0]?.id);
  const controls = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = Math.max(0, options.findIndex(option => option.id === selected));
  const active = options[activeIndex];
  if (!active) return null;

  function moveSelection(event: KeyboardEvent<HTMLDivElement>) {
    let next: number;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (activeIndex + 1) % options.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (activeIndex - 1 + options.length) % options.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    else return;
    event.preventDefault();
    setSelected(options[next].id);
    controls.current[next]?.focus();
  }

  return <section id="departments" className={styles.section} aria-labelledby="techart-range-title">
    <header className={styles.heading}>
      <div><span className={styles.eyebrow}>Made personal, down to the detail</span><h2 id="techart-range-title">The product range.</h2></div>
      <ArrowLink href="/shop?brand=techart" light>All TECHART parts</ArrowLink>
    </header>

    <div className={styles.choices} role="group" aria-label="Choose a TECHART product category" onKeyDown={moveSelection}>
      {options.map((option, index) => <button
        key={option.id} ref={element => { controls.current[index] = element; }}
        type="button" aria-pressed={option.id === active.id} aria-controls="techart-range-detail"
        tabIndex={option.id === active.id ? 0 : -1}
        onClick={() => setSelected(option.id)}
      >{option.label}</button>)}
    </div>

    <div className={styles.presentation}>
      <div className={styles.fan} aria-label="TECHART product swatches">
        {options.map((option, index) => {
          const rank = (index - activeIndex + options.length) % options.length;
          return <button
            key={option.id} type="button" className={styles.swatch}
            data-selected={rank === 0} style={{ '--rank': rank, zIndex: options.length - rank } as CSSProperties}
            tabIndex={-1} aria-label={`Preview ${option.title}`} aria-pressed={rank === 0}
            onClick={() => setSelected(option.id)}
          >
            <span className={styles.photo}><Image src={`/images/techart-range/${option.image}.webp`} alt={option.alt} fill quality={90} sizes="(max-width: 700px) 58vw, (max-width: 1100px) 50vw, 620px" /></span>
            <span className={styles.swatchLabel}>
              <Image className={styles.wordmark} src="/brand/techart.svg" alt="TECHART" width={487} height={35} />
              <span className={styles.swatchTitle}>{option.title}</span>
            </span>
          </button>;
        })}
        <span className={styles.pivot} aria-hidden="true" />
      </div>

      <div id="techart-range-detail" className={styles.detail} aria-live="polite" aria-atomic="true">
        <span className={styles.count}>{active.count} {active.count === 1 ? 'part' : 'parts'} in the collection</span>
        <h3>{active.title}</h3>
        <p>{active.description}</p>
        <ArrowLink href={active.href} light>Explore {active.label.toLowerCase()}</ArrowLink>
      </div>
    </div>
    <p className={styles.hint}>Select a category or a swatch.</p>
  </section>;
}
