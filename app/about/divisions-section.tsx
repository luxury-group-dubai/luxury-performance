'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './divisions-timeline.module.css';

export function DivisionsSection({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section || CSS.supports('(animation-timeline: --division-logo) and (view-timeline-name: --division-logo)')) return;

    // Mirror the native view timeline in browsers without scroll-driven CSS animations.
    const tiles = Array.from(section.querySelectorAll<HTMLElement>('[data-division-mark]'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = document.documentElement.clientHeight;
      const bounds = tiles.map(tile => tile.getBoundingClientRect());
      bounds.forEach(({ top, height: tileHeight }, index) => {
        const progress = Math.max(0, Math.min(1, (height - top) / (height + tileHeight)));
        const delay = `${-progress}s`;
        if (tiles[index].style.getPropertyValue('--mark-seek') !== delay) {
          tiles[index].style.setProperty('--mark-seek', delay);
        }
      });
    };
    const schedule = () => {
      if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(update);
    };
    section.dataset.scrubMarks = '';
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reducedMotion.addEventListener('change', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reducedMotion.removeEventListener('change', schedule);
      cancelAnimationFrame(frame);
      delete section.dataset.scrubMarks;
    };
  }, []);

  useEffect(() => {
    const section = ref.current;
    if (!section || !window.ResizeObserver) return;

    const midpoints = new Map<Element, number>();
    const observer = new ResizeObserver(entries => {
      for (const { target, contentRect } of entries) {
        // Center the heading and paragraph, excluding the gap before the next story.
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
