"use client";

import Link from 'next/link';
import type { ComponentProps } from 'react';

type HomeLinkProps = Omit<ComponentProps<typeof Link>, 'href'>;

export function HomeLink({ onClick, ...props }: HomeLinkProps) {
  return <Link {...props} href="/" onClick={event => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || window.location.pathname !== '/') return;

    // Reset Lenis as well as native scrolling when already on the homepage.
    const scroll = new CustomEvent('lxp:scroll-to', { detail: 0, cancelable: true });
    if (window.dispatchEvent(scroll)) window.scrollTo({ top: 0, behavior: 'instant' });
  }} />;
}
