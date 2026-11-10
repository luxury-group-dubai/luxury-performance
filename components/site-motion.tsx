'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Small, event-driven enhancements. The document remains readable without JS. */
export function SiteMotion() {
  const pathname = usePathname();
  useEffect(() => {
    // The homepage has its own hero motion. Its reading line starts at zero,
    // so no document-wide layout measurement is needed before the first scroll.
    const root = document.documentElement;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    const hero = document.querySelector<HTMLElement>('.hero');
    const images = Array.from(document.querySelectorAll<HTMLElement>('.programme-image, .hero-visual'));
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = document.documentElement.scrollHeight - innerHeight;
      const heroTop = hero && !motion.matches ? hero.getBoundingClientRect().top : null;
      root.style.setProperty('--reading-progress', `${height > 0 ? scrollY / height : 0}`);
      if (heroTop !== null) hero?.style.setProperty('--hero-drift', `${Math.min(28, Math.max(0, -heroTop * .05))}px`);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const pointers = images.map(el => {
      const move = (event: PointerEvent) => {
        if (motion.matches || !finePointer.matches) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--pointer-x', `${((event.clientX - rect.left) / rect.width - .5) * 10}px`);
        el.style.setProperty('--pointer-y', `${((event.clientY - rect.top) / rect.height - .5) * 8}px`);
      };
      const reset = () => { el.style.setProperty('--pointer-x', '0px'); el.style.setProperty('--pointer-y', '0px'); };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', reset);
      return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', reset); reset(); };
    });
    // Arm the entrance while the intro still covers the page. CSS pauses it until
    // the wings reveal, so the finished hero never flashes before animating.
    if (root.dataset.lxpIntro) hero?.classList.add('hero-arrived');
    if (pathname !== '/' || scrollY > 0) update();
    else root.style.setProperty('--reading-progress', '0');
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    const resetMotion = () => { if (motion.matches) hero?.style.setProperty('--hero-drift', '0px'); };
    motion.addEventListener('change', resetMotion);
    return () => {
      cancelAnimationFrame(frame); pointers.forEach(clean => clean());
      removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll);
      motion.removeEventListener('change', resetMotion);
    };
  }, [pathname]);
  return <div className="reading-progress" aria-hidden="true" />;
}
