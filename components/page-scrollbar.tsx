'use client';

import { useEffect, useRef } from 'react';
import styles from './page-scrollbar.module.css';

/** An overlay scrollbar: the document stays native and keeps its full width. */
export function PageScrollbar() {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current!;
    const thumb = thumbRef.current!;
    const root = document.documentElement;
    const desktop = window.matchMedia('(hover: hover) and (pointer: fine)');
    const forcedColors = window.matchMedia('(forced-colors: active)');
    let frame = 0;
    let drag: { id: number; offset: number; selection: string } | undefined;
    let metrics = { max: 0, travel: 0, height: 0, top: 0 };

    function update() {
      frame = 0;
      const enhanced = desktop.matches && !forcedColors.matches;
      root.toggleAttribute('data-lxp-scrollbar', enhanced);
      const viewport = root.clientHeight;
      const total = root.scrollHeight;
      const max = Math.max(0, total - viewport);
      const height = Math.min(viewport, Math.max(36, viewport * viewport / total));
      const travel = Math.max(0, viewport - height);
      const position = max ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      metrics = { max, travel, height, top: position * travel };
      const locked = ['hidden', 'clip'].includes(getComputedStyle(root).overflowY) || ['hidden', 'clip'].includes(getComputedStyle(document.body).overflowY);
      track.hidden = !enhanced || !max || locked;
      thumb.style.height = `${height}px`;
      thumb.style.transform = `translateY(${metrics.top}px)`;
      track.setAttribute('aria-valuenow', String(Math.round(position * 100)));
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(update); }
    function scrollTo(top: number) {
      const destination = Math.max(0, Math.min(metrics.max, top));
      // SmoothScroll handles this when Lenis is active; otherwise stay native.
      const event = new CustomEvent('lxp:scroll-to', { detail: destination, cancelable: true });
      if (window.dispatchEvent(event)) window.scrollTo({ top: destination, behavior: 'instant' });
      schedule();
    }
    function move(event: PointerEvent) {
      if (!drag || drag.id !== event.pointerId || !metrics.travel) return;
      scrollTo((event.clientY - track.getBoundingClientRect().top - drag.offset) / metrics.travel * metrics.max);
    }
    function release() {
      if (!drag) return;
      const completed = drag;
      drag = undefined;
      root.style.userSelect = completed.selection;
      if (track.hasPointerCapture(completed.id)) track.releasePointerCapture(completed.id);
      track.removeAttribute('data-dragging');
    }
    function down(event: PointerEvent) {
      if (event.button !== 0 || track.hidden) return;
      event.preventDefault();
      update();
      const y = event.clientY - track.getBoundingClientRect().top;
      drag = { id: event.pointerId, offset: event.target === thumb ? y - metrics.top : metrics.height / 2, selection: root.style.userSelect };
      root.style.userSelect = 'none';
      track.setPointerCapture(event.pointerId);
      track.setAttribute('data-dragging', '');
      track.focus({ preventScroll: true });
      move(event);
    }
    function key(event: KeyboardEvent) {
      const page = root.clientHeight * 0.9;
      const destinations: Record<string, number> = {
        ArrowDown: window.scrollY + 48, ArrowUp: window.scrollY - 48,
        PageDown: window.scrollY + page, PageUp: window.scrollY - page,
        Home: 0, End: metrics.max, ' ': window.scrollY + (event.shiftKey ? -page : page),
      };
      if (!(event.key in destinations)) return;
      event.preventDefault(); scrollTo(destinations[event.key]);
    }
    const resize = new ResizeObserver(schedule);
    resize.observe(root); resize.observe(document.body);
    const mutations = new MutationObserver(schedule);
    mutations.observe(root, { attributes: true, attributeFilter: ['style', 'class'] });
    mutations.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    desktop.addEventListener('change', schedule); forcedColors.addEventListener('change', schedule);
    track.addEventListener('pointerdown', down); track.addEventListener('pointermove', move);
    track.addEventListener('pointerup', release); track.addEventListener('pointercancel', release);
    track.addEventListener('lostpointercapture', release); track.addEventListener('keydown', key);
    update();
    return () => {
      release(); cancelAnimationFrame(frame); resize.disconnect(); mutations.disconnect();
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
      desktop.removeEventListener('change', schedule); forcedColors.removeEventListener('change', schedule);
      track.removeEventListener('pointerdown', down); track.removeEventListener('pointermove', move);
      track.removeEventListener('pointerup', release); track.removeEventListener('pointercancel', release);
      track.removeEventListener('lostpointercapture', release); track.removeEventListener('keydown', key);
      root.removeAttribute('data-lxp-scrollbar');
    };
  }, []);

  return <div ref={trackRef} className={styles.track} hidden role="scrollbar" tabIndex={0}
    aria-label="Scroll page" aria-controls="site-shell" aria-orientation="vertical"
    aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}>
    <span ref={thumbRef} className={styles.thumb} />
  </div>;
}
