'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './divisions-timeline.module.css';

export function DivisionsSection({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section || CSS.supports('(animation-timeline: --division-logo) and (view-timeline-name: --division-logo)')) return;

    // Give older browsers the same scroll progress as a CSS view timeline.
    const logos = Array.from(section.querySelectorAll<HTMLElement>(`.${styles.logoFrame}`));
    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = document.documentElement.clientHeight;
      const bounds = logos.map(logo => logo.getBoundingClientRect());
      bounds.forEach((rect, index) => {
        const progress = Math.max(0, Math.min(1, (height - rect.top) / (height + rect.height)));
        const delay = `${-progress}s`;
        if (logos[index].style.getPropertyValue('--logo-seek') !== delay) logos[index].style.setProperty('--logo-seek', delay);
      });
      section.dataset.scrubLogos = '';
    };
    const schedule = () => {
      if (motion.matches && !frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
      delete section.dataset.scrubLogos;
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
