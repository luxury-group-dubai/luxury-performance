import { permanentRedirect } from 'next/navigation';
import { shopBrandHref } from '@/lib/shop/routes';
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  permanentRedirect(shopBrandHref('novitec', Object.fromEntries(Object.entries(await searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]))));
}
