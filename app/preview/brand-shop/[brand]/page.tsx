import { notFound, permanentRedirect } from 'next/navigation';
import { shopBrandHref } from '@/lib/shop/routes';
import { previewBrands } from '../../shop/brand-catalogue';
export default async function Page({ params, searchParams }: { params: Promise<{ brand: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { brand } = await params;
  if (!previewBrands.some(item => item === brand)) notFound();
  permanentRedirect(shopBrandHref(brand, Object.fromEntries(Object.entries(await searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]))));
}
