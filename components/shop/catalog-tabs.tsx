"use client";

import { useLayoutEffect, useRef, type ReactNode } from 'react';

export function CatalogTabs({ activeTab, children }: { activeTab: string; children: ReactNode }) {
  const strip = useRef<HTMLElement>(null);
  const previousTab = useRef(activeTab);

  useLayoutEffect(() => {
    const nav = strip.current;
    const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !active) return;

    const mobile = window.matchMedia('(max-width: 700px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const tabChanged = previousTab.current !== activeTab;
    previousTab.current = activeTab;

    const centerTab = (behavior: ScrollBehavior) => {
      if (!mobile.matches) return;
      const tab = active.getBoundingClientRect();
      const viewport = nav.getBoundingClientRect();
      const centered = nav.scrollLeft + tab.left - viewport.left + (tab.width - nav.clientWidth) / 2;
      const max = nav.scrollWidth - nav.clientWidth;
      nav.scrollTo({ left: Math.min(max, Math.max(0, centered)), behavior });
    };

    const geometry = () => [nav.clientWidth, ...Array.from(nav.children, tab => tab.getBoundingClientRect().width)].join(':');
    let previousGeometry = geometry();
    centerTab(tabChanged && !reducedMotion.matches ? 'smooth' : 'instant');
    const observer = new ResizeObserver(() => {
      const currentGeometry = geometry();
      if (currentGeometry === previousGeometry) return;
      previousGeometry = currentGeometry;
      centerTab('instant');
    });
    observer.observe(nav);
    for (const tab of nav.children) observer.observe(tab);
    return () => observer.disconnect();
  }, [activeTab]);

  return <nav ref={strip} className="supplier-tabs" aria-label="Suppliers">{children}</nav>;
}
