'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './divisions-timeline.module.css';

export function DivisionTrack({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !('ResizeObserver' in window)) return;

    // Reserve the real text height while CSS pins each caption to the shared marker.
    const captions = track.querySelectorAll<HTMLElement>(`.${styles.caption}`);
    const lastCaption = captions[captions.length - 1];
    const observer = new ResizeObserver(entries => {
      for (const { target } of entries) {
        const height = `${target.getBoundingClientRect().height}px`;
        target.closest('li')?.style.setProperty('--caption-height', height);
        if (target === lastCaption) track.style.setProperty('--last-caption-height', height);
      }
      track.dataset.measured = '';
    });
    captions.forEach(caption => observer.observe(caption));
    return () => observer.disconnect();
  }, []);

  return <div className={styles.track} ref={trackRef}>
    <div aria-hidden="true" className={styles.rail}><span className={styles.marker} /></div>
    <ol className={styles.chapters}>{children}</ol>
  </div>;
}
