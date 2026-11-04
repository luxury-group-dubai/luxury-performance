'use client';

import { useEffect } from 'react';

/** Keep touch and reduced-motion scrolling native. */
export function SmoothScroll() {
  useEffect(() => {
    const preference = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let instance: { destroy: () => void; stop: () => void; start: () => void } | undefined;
    let generation = 0;
    let locked = false;
    const syncLock = () => {
      const next = document.body.style.overflow === 'hidden' || document.documentElement.style.overflow === 'hidden';
      if (!instance || next === locked) return;
      locked = next;
      if (locked) instance.stop(); else instance.start();
    };
    const observer = new MutationObserver(syncLock);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    async function update() {
      const current = ++generation;
      instance?.destroy();
      instance = undefined;
      if (!preference.matches) return;
      const { default: Lenis } = await import('lenis');
      if (current !== generation || !preference.matches) return;
      instance = new Lenis({ autoRaf: true, lerp: 0.14, syncTouch: false, allowNestedScroll: true, stopInertiaOnNavigate: true });
      locked = false;
      syncLock();
    }
    void update();
    preference.addEventListener('change', update);
    return () => { generation++; observer.disconnect(); preference.removeEventListener('change', update); instance?.destroy(); };
  }, []);
  return null;
}
