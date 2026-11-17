import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { legacyShopHref } from '@/lib/shop/routes';
import { ShopEntryPage } from './entry-page';
export const metadata: Metadata = { title: 'Shop Performance Parts', description: 'Find performance parts by brand or vehicle, or explore available stock at Luxury Performance, Dubai.', alternates: { canonical: '/shop' } };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = Object.fromEntries(Object.entries(await searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
  const target = legacyShopHref(query);
  if (target !== '/shop') permanentRedirect(target);
  return <ShopEntryPage />;
}
