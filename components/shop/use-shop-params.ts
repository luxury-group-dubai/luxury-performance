'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { shopPathFilters } from '@/lib/shop/routes';

export function useShopParams() {
  const params = new URLSearchParams(useSearchParams());
  const scope = shopPathFilters(usePathname());
  for (const [key, value] of Object.entries(scope)) {
    if (value) params.set(key, value);
    else params.delete(key);
  }
  return params;
}
