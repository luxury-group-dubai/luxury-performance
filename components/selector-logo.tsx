'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './selector-logo.module.css';

/** Keep a readable name in place until every part of a logo is ready to paint. */
export function SelectorLogo({ label, children }: { label: string; children: ReactNode }) {
  return <LogoReveal key={label} label={label}>{children}</LogoReveal>;
}

function LogoReveal({ label, children }: { label: string; children: ReactNode }) {
  const artwork = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    let active = true;
    const cleanups: (() => void)[] = [];
    const images = Array.from(artwork.current?.querySelectorAll('img') ?? []);
    // Voltrix uses an external image inside an SVG colour filter.
    for (const embedded of artwork.current?.querySelectorAll('svg image') ?? []) {
      const source = embedded.getAttribute('href') ?? embedded.getAttribute('xlink:href');
      if (source) {
        const image = new window.Image();
        image.src = source;
        images.push(image);
      }
    }
    // Cached logos can be shown before the next paint, without replaying a loader.
    if (images.length && images.every(image => image.complete && image.naturalWidth > 0)) {
      setReady(true);
      return;
    }
    const loaded = images.map(image => new Promise<boolean>(resolve => {
      const finish = () => resolve(image.naturalWidth > 0);
      const fail = () => resolve(false);
      image.addEventListener('load', finish, { once: true });
      image.addEventListener('error', fail, { once: true });
      cleanups.push(() => {
        image.removeEventListener('load', finish);
        image.removeEventListener('error', fail);
      });
      if (image.complete) void finish();
    }));
    void Promise.all(loaded).then(results => {
      if (active && results.length && results.every(Boolean)) setReady(true);
    });
    return () => { active = false; cleanups.forEach(cleanup => cleanup()); };
  }, []);

  const longestWord = Math.max(...label.split(/\s+/).map(word => word.length));
  // The preview bootstrap may add data-logo-loaded before hydration.
  return <span className={styles.logo} data-selector-logo data-ready={ready} suppressHydrationWarning aria-hidden="true" style={{ '--selector-word-length': longestWord } as CSSProperties}>
    <span className={styles.placeholder}><span className={styles.placeholderText}>{label}</span></span>
    <span ref={artwork} data-selector-logo-artwork className={styles.artwork}>{children}</span>
    <span hidden data-selector-logo-end />
  </span>;
}
