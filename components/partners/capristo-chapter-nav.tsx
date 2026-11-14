'use client';

import { useEffect, useState } from 'react';

export function CapristoChapterNav({ chapters, label = 'Capristo product types' }: {
  chapters: { id: string; title: string }[];
  label?: string;
}) {
  const [active, setActive] = useState(chapters[0]?.id);

  useEffect(() => {
    const vehicles = document.getElementById('vehicles');
    if (!vehicles) return;

    const measure = () => {
      vehicles.style.setProperty('--capristo-vehicle-height', `${vehicles.getBoundingClientRect().height}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(vehicles, { box: 'border-box' });
    return () => {
      observer.disconnect();
      vehicles.style.removeProperty('--capristo-vehicle-height');
    };
  }, []);

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

  return <nav aria-label={label}>
    {chapters.map(({ id, title }) => (
      <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined}>{title}</a>
    ))}
  </nav>;
}
