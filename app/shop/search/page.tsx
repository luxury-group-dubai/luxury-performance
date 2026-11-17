import type { Metadata } from 'next';
import { connection } from 'next/server';
import { getCatalog } from '@/lib/shop/storefront';
import { searchProducts } from '@/lib/shop/search';
import { buildVehicleChoices } from '../../preview/shop/vehicle-data';
import { prepareBrandCatalogue } from '../../preview/shop/brand-catalogue';
import { SearchResults } from '../../preview/shop/search/search-results';

export const metadata: Metadata = { title: 'Search performance parts', robots: { index: false, follow: true } };

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  await connection();
  const params = await searchParams;
  const query = (typeof params.q === 'string' ? params.q : '').trim().slice(0, 100);
  const catalog = await getCatalog();
  return <SearchResults key={query} query={query} products={query ? searchProducts(catalog, query) : []} models={buildVehicleChoices(prepareBrandCatalogue(catalog))} />;
}
