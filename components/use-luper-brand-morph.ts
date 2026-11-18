'use client';

import { useEffect, useRef } from 'react';

// The original vector contours from public/brand/lxp.svg, in its 1088 × 280 viewBox.
export const lxpLetterPaths = [
  'M8 10 H66 V182 A50 50 0 0 0 116 232 H312 V290 H116 A108 108 0 0 1 8 182 Z',
  'M331 10 L413.0244 10 L515.5147 112.4903 A12 12 0 0 0 532.4853 112.4903 L634.9756 10 L717 10 L585.4853 141.5147 A12 12 0 0 0 585.4853 158.4853 L717 290 L634.9756 290 L532.4853 187.5097 A12 12 0 0 0 515.5147 187.5097 L413.0244 290 L331 290 L462.5147 158.4853 A12 12 0 0 0 462.5147 141.5147 Z',
  'M740 10 H1000 A96 96 0 0 1 1000 202 H798 V290 H740 V144 H1000 A38 38 0 0 0 1000 68 H740 Z',
];

// Hard cuts, a terminal cursor and sequential glyphs make this a digital boot,
// rather than an organic contour morph. All artwork remains sharp SVG geometry.
export function useLuperBrandMorph() {
  const avatarRef = useRef<SVGSVGElement>(null);
  const frame = useRef<number | null>(null);
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);

  const playBrandAnimation = () => {
    const svg = avatarRef.current;
    if (!svg || frame.current !== null) return;
    const group = svg.querySelector<SVGGElement>('[data-brand-contours]')!;
    const letters = group.querySelector<SVGGElement>('[data-brand-letters]')!;
    const paths = Array.from(letters.querySelectorAll('path'));
    const squareEyes = group.querySelector<SVGGElement>('[data-brand-square-eyes]')!;
    const cursor = group.querySelector<SVGRectElement>('[data-brand-cursor]')!;
    const glitch = group.querySelector<SVGGElement>('[data-brand-glitch]')!;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduced ? 900 : 2080;
    const started = performance.now();
    const cursorPositions = [8, 331, 740, 1125];

    const draw = (now: number) => {
      const elapsed = now - started;
      if (elapsed >= duration) {
        // Reveal the live expression, including any chat state change during playback.
        svg.dataset.brandActive = 'false';
        frame.current = null;
        return;
      }
      const bootEyes = !reduced && (elapsed < 180 || elapsed >= 1920);
      const count = reduced ? 3 : elapsed < 500 ? 0 : elapsed < 720 ? 1
        : elapsed < 940 ? 2 : elapsed < 1500 ? 3 : elapsed < 1630 ? 2
        : elapsed < 1760 ? 1 : 0;
      paths.forEach((path, index) => path.setAttribute('opacity', !bootEyes && index < count ? '1' : '0'));
      squareEyes.setAttribute('opacity', bootEyes ? '1' : '0');
      cursor.setAttribute('x', String(cursorPositions[count]));
      cursor.setAttribute('opacity', !reduced && !bootEyes && Math.floor(elapsed / 160) % 2 === 1 ? '1' : '0');
      const scanning = !reduced && elapsed >= 1030 && elapsed < 1160;
      const shift = Math.floor(elapsed / 45) % 2 === 0 ? 48 : -48;
      letters.setAttribute('transform', scanning ? `translate(${shift} 0)` : 'translate(0 0)');
      glitch.setAttribute('transform', `translate(${-shift * 2} 0)`);
      glitch.setAttribute('opacity', scanning ? '.8' : '0');
      svg.dataset.brandActive = 'true';
      frame.current = requestAnimationFrame(draw);
    };
    draw(started);
  };

  return { avatarRef, playBrandAnimation };
}
