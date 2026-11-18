'use client';

import { useEffect, type RefObject } from 'react';

/** Mobile keyboards resize the visual viewport, which can differ from 100dvh. */
export function useLuperMobileKeyboard(content: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const viewport = window.visualViewport;
    let baseline = Math.max(window.innerHeight, document.documentElement.clientHeight);
    let width = window.innerWidth;
    let frame = 0;
    let scrollFrame = 0;
    let panel: HTMLDivElement | null = null;
    let wrapper: HTMLElement | null = null;

    const update = () => {
      panel = content.current;
      if (!panel || (viewport && Math.abs(viewport.scale - 1) > .05)) return;
      wrapper = panel.closest<HTMLElement>('[data-radix-popper-content-wrapper]');
      if (Math.abs(window.innerWidth - width) > 40) {
        baseline = Math.max(window.innerHeight, document.documentElement.clientHeight);
        width = window.innerWidth;
      }
      const height = viewport?.height ?? window.innerHeight;
      baseline = Math.max(baseline, window.innerHeight, document.documentElement.clientHeight);
      const editing = panel.contains(document.activeElement) && document.activeElement?.tagName === 'TEXTAREA';
      const keyboard = baseline - height > 120 && (editing || panel.dataset.keyboardOpen === 'true');
      const messages = panel.querySelector<HTMLElement>('[data-luper-viewport]');
      const atBottom = messages && messages.scrollHeight - messages.scrollTop - messages.clientHeight < 80;
      panel.style.setProperty('--luper-viewport-height', `${height}px`);
      panel.style.setProperty('--luper-viewport-top', `${viewport?.offsetTop ?? 0}px`);
      panel.dataset.keyboardOpen = String(keyboard);
      wrapper?.toggleAttribute('data-luper-keyboard', keyboard);
      cancelAnimationFrame(scrollFrame);
      if (atBottom) scrollFrame = requestAnimationFrame(() => { messages.scrollTop = messages.scrollHeight; });
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    schedule();
    viewport?.addEventListener('resize', schedule);
    viewport?.addEventListener('scroll', schedule);
    window.addEventListener('resize', schedule);
    document.addEventListener('focusin', schedule);
    document.addEventListener('focusout', schedule);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scrollFrame);
      viewport?.removeEventListener('resize', schedule);
      viewport?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('focusin', schedule);
      document.removeEventListener('focusout', schedule);
      wrapper?.removeAttribute('data-luper-keyboard');
      if (panel) {
        delete panel.dataset.keyboardOpen;
        panel.style.removeProperty('--luper-viewport-height');
        panel.style.removeProperty('--luper-viewport-top');
      }
    };
  }, [content, enabled]);
}
