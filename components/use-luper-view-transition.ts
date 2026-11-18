'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { flushSync } from 'react-dom';

type View = 'home' | 'luper';

/** Animate the content and measured height, leaving the glass shell in place. */
export function useLuperViewTransition(content: RefObject<HTMLDivElement | null>, open: boolean) {
  const [view, setView] = useState<View>('home');
  const active = useRef<{ animations: Animation[] } | null>(null);

  useEffect(() => () => {
    const transition = active.current;
    active.current = null;
    transition?.animations.forEach(animation => animation.cancel());
    content.current?.removeAttribute('aria-busy');
  }, [open, content]);

  async function changeView(next: View) {
    if (next === view || active.current) return;
    const panel = content.current;
    if (!panel || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      flushSync(() => setView(next));
      if (next === 'home') panel?.querySelector<HTMLButtonElement>('[data-luper-choice]')?.focus({ preventScroll: true });
      return;
    }

    const transition = { animations: [] as Animation[] };
    active.current = transition;
    panel.setAttribute('aria-busy', 'true');
    const direction = next === 'luper' ? 1 : -1;
    // Finish any initial popover entrance before measuring its unscaled height.
    panel.getAnimations().forEach(animation => animation.finish());
    const height = panel.getBoundingClientRect().height;
    const screens = () => Array.from(panel.children).filter((element): element is HTMLElement => element instanceof HTMLElement);
    const outgoing = screens().map(element => element.animate([
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: `translateX(${-14 * direction}px)` },
    ], { duration: 90, easing: 'ease-in', fill: 'forwards' }));
    transition.animations.push(...outgoing);
    await Promise.all(outgoing.map(animation => animation.finished.catch(() => {})));
    if (active.current !== transition || !panel.isConnected) return;

    flushSync(() => setView(next));
    outgoing.forEach(animation => animation.cancel());
    const targetHeight = panel.getBoundingClientRect().height;
    const timing = { duration: 160, easing: 'cubic-bezier(.16,1,.3,1)' };
    const incoming = screens().map(element => element.animate([
      { opacity: 0, transform: `translateX(${18 * direction}px)` },
      { opacity: 1, transform: 'translateX(0)' },
    ], timing));
    const resize = panel.animate([{ height: `${height}px` }, { height: `${targetHeight}px` }], timing);
    transition.animations.push(...incoming, resize);
    await Promise.all([...incoming, resize].map(animation => animation.finished.catch(() => {})));
    if (active.current !== transition) return;
    transition.animations.forEach(animation => animation.cancel());
    active.current = null;
    panel.removeAttribute('aria-busy');
    if (next === 'home') panel.querySelector<HTMLButtonElement>('[data-luper-choice]')?.focus({ preventScroll: true });
  }

  return { view, changeView };
}
