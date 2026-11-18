'use client';

import { useEffect, type RefObject } from 'react';

/** Measure the caret using the input's typography, including wrapped lines. */
export function useLuperGaze(composer: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const input = composer.current?.querySelector('textarea');
    const panel = composer.current?.closest<HTMLElement>('[data-lxp-chat]');
    if (!input || !panel) return;

    const mirror = document.createElement('div');
    const text = document.createTextNode('');
    const caret = document.createElement('span');
    caret.textContent = '\u200b';
    mirror.setAttribute('aria-hidden', 'true');
    mirror.style.cssText = 'position:fixed;left:-10000px;top:0;visibility:hidden;pointer-events:none;white-space:pre-wrap;overflow-wrap:break-word;';
    mirror.append(text, caret);
    document.body.append(mirror);

    let frame = 0;
    let disposed = false;
    const update = () => {
      frame = 0;
      if (!input.value) {
        panel.style.setProperty('--luper-gaze-x', '0px');
        return;
      }
      const style = getComputedStyle(input);
      for (const property of ['font-family', 'font-size', 'font-weight', 'font-style', 'font-stretch', 'line-height', 'letter-spacing', 'word-spacing', 'text-transform', 'text-indent', 'text-align', 'direction', 'tab-size', 'word-break', 'padding', 'box-sizing']) {
        mirror.style.setProperty(property, style.getPropertyValue(property));
      }
      mirror.style.width = `${input.clientWidth}px`;
      const position = input.selectionDirection === 'backward' ? input.selectionStart : input.selectionEnd;
      text.textContent = input.value.slice(0, position);
      const paddingLeft = parseFloat(style.paddingLeft) || 0;
      const width = input.clientWidth - paddingLeft - (parseFloat(style.paddingRight) || 0);
      const x = caret.getBoundingClientRect().left - mirror.getBoundingClientRect().left - paddingLeft;
      const progress = Math.max(0, Math.min(1, x / Math.max(1, width)));
      panel.style.setProperty('--luper-gaze-x', `${(progress * 8 - 4).toFixed(2)}px`);
    };
    const schedule = () => {
      if (!disposed && !frame) frame = requestAnimationFrame(update);
    };
    const selectionChanged = () => { if (document.activeElement === input) schedule(); };
    const events = ['input', 'select', 'keyup', 'click', 'focus'] as const;
    events.forEach(event => input.addEventListener(event, schedule));
    document.addEventListener('selectionchange', selectionChanged);
    const resize = new ResizeObserver(schedule);
    resize.observe(input);
    void document.fonts.ready.then(schedule);
    schedule();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      events.forEach(event => input.removeEventListener(event, schedule));
      document.removeEventListener('selectionchange', selectionChanged);
      panel.style.removeProperty('--luper-gaze-x');
      mirror.remove();
    };
  }, [composer]);
}
