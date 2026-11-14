'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function StickyIntro({ children }: { children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = panel.current;
    if (!element || !('ResizeObserver' in window)) return;
    const measure = () => element.style.setProperty('--intro-panel-height', `${element.offsetHeight}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div className="home-intro-pin" ref={panel}>{children}</div>;
}
