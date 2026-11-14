'use client';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
export function Reveal({ children, className = '', itemSelector }: { children: ReactNode; className?: string; itemSelector?: string }) {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = element.current;
    if (!el || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (itemSelector) {
      const items = el.querySelectorAll(itemSelector);
      const observer = new IntersectionObserver(entries => {
        for (const { target, isIntersecting, boundingClientRect, rootBounds } of entries) {
          if (isIntersecting || boundingClientRect.top < (rootBounds?.top ?? 0)) {
            target.classList.remove('reveal-item-pending');
            observer.unobserve(target);
          } else {
            target.classList.add('reveal-item-pending');
          }
        }
      }, { rootMargin: '0px 0px -56px 0px' });
      items.forEach(item => observer.observe(item));
      return () => {
        observer.disconnect();
        items.forEach(item => item.classList.remove('reveal-item-pending'));
      };
    }
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
  }, [itemSelector]);
  return <div ref={element} className={`reveal ${className}`}>{children}</div>;
}
