'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function StickyIntro({ children }: { children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = panel.current;
    if (!element || !('ResizeObserver' in window)) return;
    const mobile = window.matchMedia('(max-width: 700px)');
    const measure = () => {
      const height = element.offsetHeight;
      // The minimum height is the small viewport minus the header, even while browser chrome moves.
      const available = mobile.matches ? parseFloat(getComputedStyle(element).minHeight) : NaN;
      element.style.setProperty('--intro-panel-height', `${height}px`);
      element.toggleAttribute('data-intro-overflow', height > available + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return <div className="home-intro-pin" ref={panel}>{children}</div>;
}
