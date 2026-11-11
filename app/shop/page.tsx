import type { Metadata } from 'next';
import { getCatalog, getCollection } from '@/lib/shop/storefront';
import { filterUrl, suppliers, type Filters } from '@/lib/shop/taxonomy';
import { Catalog } from '@/components/shop/catalog';
import { catalogSeo } from '@/lib/shop/catalog-seo';
import { techartSelection, vehicleImage, vehicleName } from '@/lib/shop/techart-fitment';
import { cayenneImage, cayenneName } from '@/lib/shop/techart-cayenne';
type Props = { searchParams: Promise<Record<string,string|string[]|undefined>> };
function shopFilters(query: Awaited<Props['searchParams']>): Filters {
  const filters = Object.fromEntries(Object.entries(query).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
  return { ...filters, stock: filters.stock === 'in-stock' ? filters.stock : undefined };
}

async function shopProducts(filters: Filters) {
  if (filters.stock !== 'in-stock') return getCatalog();
  const collection = await getCollection('in-stock');
  return collection?.products.filter(product => product.availableForSale) ?? [];
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = await searchParams;
  const filters = shopFilters(query);
  const products = await shopProducts(filters);
  const brand = suppliers.find(item => item.slug === filters.brand);
  const { page, ...seo } = catalogSeo('/shop', query, products, process.env.SHOP_SEO_LIVE === 'true');
  const selection = techartSelection(filters);
  if (selection) {
    const { fit } = selection;
    const name = selection.model === 'cayenne' ? cayenneName(fit, selection.body) : vehicleName(fit, selection.body);
    const profile = selection.model === 'cayenne' ? cayenneImage(fit, selection.body) : vehicleImage(fit, selection.body);
    const title = `TECHART Parts for Porsche ${name}`;
    const description = `Browse TECHART parts for the Porsche ${name} at Luxury Performance in Dubai.`;
    const image = { url: profile.src, width: profile.width, height: profile.height, alt: 'Porsche vehicle profile' };
    return {
      ...seo,
      title: page > 1 ? `${title} — Page ${page}` : title,
      description,
      openGraph: { title, description, url: filterUrl('/shop', { ...selection, brand: 'techart', generation: filters.generation, stock: filters.stock }), type: 'website', images: [image] },
      twitter: { card: 'summary_large_image', title, description, images: [image] },
    };
  }
  const title = filters.stock ? 'In Stock' : brand ? `${brand.name} Parts` : 'Shop Performance Parts';
  return { title: page > 1 ? `${title} — Page ${page}` : title, description: brand?.description || 'Explore NOVITEC, TECHART, Valvetronic Designs and genuine OEM parts from Luxury Performance, Dubai.', ...seo };
}
export default async function Shop({ searchParams }: Props) {
  const filters = shopFilters(await searchParams);
  const inStock = filters.stock === 'in-stock';
  const [products, otherTotal] = await Promise.all([
    shopProducts(filters),
    shopProducts({ stock: inStock ? undefined : 'in-stock' })
      .then(otherProducts => otherProducts.length)
      .catch(() => undefined),
  ]);
  const tabTotals = inStock ? { all: otherTotal, stock: products.length } : { all: products.length, stock: otherTotal };
  return <Catalog products={products} filters={filters} tabTotals={tabTotals} />;
}
