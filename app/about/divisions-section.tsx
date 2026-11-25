'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './divisions-timeline.module.css';

export function DivisionsSection({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section || !window.ResizeObserver) return;

    const midpoints = new Map<Element, number>();
    const observer = new ResizeObserver(entries => {
      for (const { target, contentRect } of entries) {
        // Use the copy and link, excluding the padding reserved for the next story.
        const midpoint = contentRect.height / 2;
        midpoints.set(target, midpoint);
        target.closest('li')?.style.setProperty('--story-midpoint', `${midpoint}px`);
      }
      section.style.setProperty('--tallest-midpoint', `${Math.max(...midpoints.values())}px`);
    });
    section.querySelectorAll(`.${styles.story}`).forEach(story => observer.observe(story));
    return () => observer.disconnect();
  }, []);

  return <section id="our-divisions" aria-labelledby="divisions-title" ref={ref} className={styles.archive}>
    {children}
  </section>;
}
