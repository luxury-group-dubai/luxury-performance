'use client';

import { useEffect } from 'react';

/** Keep touch and reduced-motion scrolling native. */
export function SmoothScroll() {
  useEffect(() => {
    const preference = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let instance: { destroy: () => void; stop: () => void; start: () => void } | undefined;
    let generation = 0;
    let locked = false;
    let initializing = false;
    const syncLock = () => {
      const next = document.body.style.overflow === 'hidden' || document.documentElement.style.overflow === 'hidden';
      if (!instance || next === locked) return;
      locked = next;
      if (locked) instance.stop(); else instance.start();
    };
    const observer = new MutationObserver(syncLock);
    async function start() {
      if (!preference.matches || instance || initializing) return;
      initializing = true;
      const current = ++generation;
      try {
        const { default: Lenis } = await import('lenis');
        if (current !== generation || !preference.matches) return;
        instance = new Lenis({ autoRaf: true, lerp: 0.14, syncTouch: false, allowNestedScroll: true, stopInertiaOnNavigate: true });
        observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
        locked = false;
        syncLock();
      } catch {
        // Native scrolling remains available if the enhancement cannot load.
      } finally {
        initializing = false;
      }
    }
    const onIntent = () => { void start(); };
    const reset = () => {
      generation++;
      instance?.destroy();
      instance = undefined;
      observer.disconnect();
    };
    // Optional desktop scrolling is activated by intent, outside initial hydration.
    const events = ['pointermove', 'pointerdown', 'wheel', 'keydown'] as const;
    events.forEach(event => window.addEventListener(event, onIntent, { passive: true }));
    preference.addEventListener('change', reset);
    return () => {
      reset();
      events.forEach(event => window.removeEventListener(event, onIntent));
      preference.removeEventListener('change', reset);
    };
  }, []);
  return null;
}
