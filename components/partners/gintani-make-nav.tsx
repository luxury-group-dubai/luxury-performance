'use client';

import { useEffect, useState } from 'react';

export function GintaniMakeNav({ chapters }: { chapters: { id: string; title: string }[] }) {
  const [active, setActive] = useState(chapters[0]?.id);

  useEffect(() => {
    const sections = chapters.flatMap(({ id }) => {
      const section = document.getElementById(id);
      return section ? [section] : [];
    });
    let observer: IntersectionObserver;

    const observe = () => {
      observer?.disconnect();
      const midpoint = Math.floor(window.innerHeight / 2);
      observer = new IntersectionObserver(entries => {
        const visible = entries.find(entry => entry.isIntersecting);
        if (visible) setActive(visible.target.id);
      }, { rootMargin: `-${midpoint}px 0px -${Math.max(0, window.innerHeight - midpoint - 1)}px 0px` });
      sections.forEach(section => observer.observe(section));
    };

    observe();
    window.addEventListener('resize', observe);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', observe);
    };
  }, [chapters]);

  return <nav aria-label="Gintani vehicle makes">
    {chapters.map(({ id, title }) => (
      <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined}>{title}</a>
    ))}
  </nav>;
}
