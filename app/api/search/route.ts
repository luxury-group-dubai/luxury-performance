import { getCatalog } from '@/lib/shop/storefront';
import { searchProducts } from '@/lib/shop/search';
import { buildVehicleChoices } from '@/app/preview/shop/vehicle-data';
import { prepareBrandCatalogue } from '@/app/preview/shop/brand-catalogue';
import { searchShopDestinations } from '@/app/preview/shop/search';

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get('q')?.trim().slice(0, 100) || '';
  if (query.length < 2) return Response.json({ products: [], total: 0 });
  try {
    const catalog = await getCatalog();
    const matches = searchProducts(catalog, query);
    const destinations = searchShopDestinations(buildVehicleChoices(prepareBrandCatalogue(catalog)), query);
    return Response.json({ ...destinations, total: matches.length, products: matches.slice(0, 6).map(product => ({
      id: product.id, title: product.title, handle: product.handle, vendor: product.vendor,
      image: product.featuredImage, price: product.priceRange.minVariantPrice,
    })) }, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
  } catch {
    return Response.json({ message: 'Search is temporarily unavailable. Please try again.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
