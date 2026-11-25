'use client';

import { useEffect, useRef, useState } from 'react';

type Chapter = { id: string; title: string; detail?: string };

export function ChapterNav({ chapters, label, activeAt }: { chapters: Chapter[]; label: string; activeAt?: string }) {
  const [active, setActive] = useState(chapters[0]?.id);
  const offset = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sections = chapters.flatMap(({ id }) => {
      const section = document.getElementById(id);
      return section ? [section] : [];
    });
    let observer: IntersectionObserver;

    const observe = () => {
      observer?.disconnect();
      const line = Math.min(window.innerHeight - 1, offset.current?.offsetHeight || Math.floor(window.innerHeight / 2));
      observer = new IntersectionObserver(entries => {
        const visible = entries.find(entry => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      }, { rootMargin: `-${line}px 0px -${Math.max(0, window.innerHeight - line - 1)}px 0px` });
      sections.forEach(section => observer.observe(section));
    };

    observe();
    const resize = offset.current ? new ResizeObserver(observe) : undefined;
    if (offset.current) resize?.observe(offset.current);
    window.addEventListener('resize', observe);
    return () => {
      observer.disconnect();
      resize?.disconnect();
      window.removeEventListener('resize', observe);
    };
  }, [chapters, activeAt]);

  return <nav aria-label={label}>
    {activeAt && <span ref={offset} aria-hidden="true"
      style={{ position: 'absolute', height: activeAt, width: 0, visibility: 'hidden', pointerEvents: 'none' }} />}
    {chapters.map(({ id, title, detail }) => (
      <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined}>
        {detail ? <><span>{title}</span><span>{detail}</span></> : title}
      </a>
    ))}
  </nav>;
}
