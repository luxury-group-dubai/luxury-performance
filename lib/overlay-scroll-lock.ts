let locks = 0;
let restore: (() => void) | undefined;

/** Let fullscreen overlays cover the scrollbar gutter without widening the page beneath. */
export function lockOverlayScroll() {
  if (locks++ === 0) {
    const root = document.documentElement;
    const body = document.body;
    const previous = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter, padding: body.style.paddingRight };
    const gap = Math.max(0, window.innerWidth - root.getBoundingClientRect().width);
    const padding = getComputedStyle(body).paddingRight;
    root.style.overflow = 'hidden';
    root.style.scrollbarGutter = 'auto';
    if (gap) body.style.paddingRight = `calc(${padding} + ${gap}px)`;
    restore = () => {
      root.style.overflow = previous.overflow;
      root.style.scrollbarGutter = previous.gutter;
      body.style.paddingRight = previous.padding;
    };
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--locks === 0) { restore?.(); restore = undefined; }
  };
}
