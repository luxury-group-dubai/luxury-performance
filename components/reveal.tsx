'use client';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
export function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = element.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Observer geometry is supplied after layout; do not force a synchronous
    // page layout during hydration just to prepare an offscreen entrance.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
        el.classList.remove('reveal-pending');
        observer.disconnect();
      } else if (entry.boundingClientRect.top >= (entry.rootBounds?.bottom ?? window.innerHeight)) {
        el.classList.add('reveal-pending');
      }
    }, { threshold: 0.08 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return <div ref={element} className={`reveal ${className}`}>{children}</div>;
}
