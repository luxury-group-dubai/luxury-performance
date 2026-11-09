'use client';

import { useEffect, useRef } from 'react';
import styles from './techart-page-motion.module.css';

export function TechartPageMotion() {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = marker.current?.closest('[data-partner="techart"]');
    if (!root) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    root.classList.add(styles.motionRoot);
    const seen = new WeakSet<Element>();
    const cleanups: (() => void)[] = [];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.removeAttribute('data-reveal-pending');
        entry.target.removeAttribute('data-fan-pending');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });

    function prepare() {
      if (!root) return;
      root.querySelectorAll('#vehicles > header, #vehicles aside, #vehicles h3, #vehicles a[aria-label^="Shop"], #departments > header, #departments [aria-label="TECHART product swatches"], #selected h2, #selected .shop-product-card, #faq h2, #faq details').forEach((el, index) => {
        if (seen.has(el)) return;
        seen.add(el);
        // Deep links and first paint stay visible; only reveal upcoming content.
        if (reduced.matches || el.getBoundingClientRect().top < window.innerHeight) return;
        el.setAttribute('data-reveal-pending', '');
        (el as HTMLElement).style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 55}ms`);
        if (el.getAttribute('aria-label') === 'TECHART product swatches') el.setAttribute('data-fan-pending', '');
        observer.observe(el);
      });
      root.querySelectorAll<HTMLImageElement>('#vehicles a[aria-label^="Shop"] img[loading="lazy"], #departments img[data-range-photo], #selected .shop-product-image img').forEach(img => {
        if (seen.has(img)) return;
        seen.add(img);
        const finish = () => { img.removeAttribute('data-image-pending'); };
        if (!img.complete) img.setAttribute('data-image-pending', '');
        img.addEventListener('load', finish);
        img.addEventListener('error', finish);
        cleanups.push(() => { img.removeEventListener('load', finish); img.removeEventListener('error', finish); finish(); });
      });
    }
    prepare();
    const mutations = new MutationObserver(prepare);
    mutations.observe(root, { childList: true, subtree: true });
    const showAll = () => root.querySelectorAll('[data-reveal-pending], [data-fan-pending]').forEach(el => { el.removeAttribute('data-reveal-pending'); el.removeAttribute('data-fan-pending'); });
    reduced.addEventListener('change', showAll);
    return () => { observer.disconnect(); mutations.disconnect(); reduced.removeEventListener('change', showAll); showAll(); cleanups.forEach(cleanup => cleanup()); root.classList.remove(styles.motionRoot); };
  }, []);
  return <span ref={marker} hidden />;
}
