import { novitecModelShopMetadata } from '@/lib/shop/novitec-model-seo';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getCatalog } from '@/lib/shop/storefront';
import { label, suppliers, supplierOf, tagsFor } from '@/lib/shop/taxonomy';
import { shopBrandHref, shopPathFilters } from '@/lib/shop/routes';
import { novitecVariantFamilies } from '@/lib/shop/novitec-variants';
import { nlargoPath } from '@/lib/nlargo-allocation';
import { NovitecShopPreview } from '../../preview/novitec-shop/shop-preview';
import { BrandShopPreview } from '../../preview/brand-shop/shop-preview';
import { prepareBrandCatalogue, previewBrands } from '../../preview/shop/brand-catalogue';
import { buildVehicleChoices } from '../../preview/shop/vehicle-data';
import { Catalog } from '@/components/shop/catalog';
import { ShopEntryPage } from '../entry-page';
import { vehicleOptions } from '@/lib/shop/techart-fitment';
import { cayenneOptions } from '@/lib/shop/techart-cayenne';
import { filterProducts } from '@/lib/shop/taxonomy';
import { normalizeTechartRoute } from '@/lib/shop/techart-routes';
import { techartStep } from '@/lib/shop/techart-steps';
import { techartShopMetadata } from '@/lib/shop/techart-seo';
type Props = { params: Promise<{ path: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { path } = await params;
  const scope = shopPathFilters('/shop/' + path.join('/'));
  if (scope.brand === 'techart' && (!scope.make || scope.make === 'porsche')) return techartShopMetadata(scope, await searchParams, process.env.SHOP_SEO_LIVE === 'true');
  const modelMetadata = novitecModelShopMetadata(scope, await searchParams, process.env.SHOP_SEO_LIVE === 'true');
  if (modelMetadata) return modelMetadata;
  const brand = suppliers.find(item => item.slug === scope.brand);
  const name = [brand?.name, scope.make && label(scope.make), scope.model && label(scope.model), scope.body && label(scope.body)].filter(Boolean).join(' ');
  const title = scope.view === 'stock' ? 'In Stock' : scope.view === 'vehicles' ? `Shop by Vehicle${name ? ` — ${name}` : ''}` : `${name} Parts`;
  const filtered = Object.keys(await searchParams).some(key => ['q', 'category', 'sort', 'choose', 'fit', 'generation', 'view', 'stock_group', 'show', 'page'].includes(key));
  return { title, description: `Explore ${name || 'performance'} parts at Luxury Performance, Dubai. Choose your vehicle and discover compatible programmes.`, alternates: { canonical: '/shop/' + path.join('/') }, robots: { index: !filtered, follow: true } };
}
export default async function Page({ params, searchParams }: Props) {
  const { path } = await params;
  if (path.length > (path[0] === 'techart' ? 6 : 4) || path.some(part => !/^[a-z0-9_-]+$/.test(part))) notFound();
  const pathname = '/shop/' + path.join('/');
  const scope = shopPathFilters(pathname);
  if (scope.brand === 'techart' && (scope.generation === 'invalid' || scope.make && scope.make !== 'porsche')) notFound();
  const query = Object.fromEntries(Object.entries(await searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
  if (scope.view === 'stock') {
    if (path.length !== 1) notFound();
    return <ShopEntryPage inStock />;
  }
  const catalog = prepareBrandCatalogue(await getCatalog());
  const choices = buildVehicleChoices(catalog);
  if (scope.view === 'vehicles') {
    const models = scope.make ? choices[scope.make] : undefined;
    if (scope.make && !models) notFound();
    const model = models?.find(item => item.slug === scope.model);
    if (scope.model && !model) notFound();
    if (scope.body && !model?.variants?.some(item => item.body === scope.body)) notFound();
    return <ShopEntryPage />;
  }
  const brand = suppliers.find(item => item.slug === scope.brand);
  if (!brand) notFound();
  if (scope.brand === 'novitec' && scope.make === 'ferrari' && scope.model === '12cilindri' && scope.body === 'n_largo') permanentRedirect(nlargoPath);
  const filters = normalizeTechartRoute({ ...query, ...Object.fromEntries(Object.entries(scope).filter(([, value]) => value !== undefined)) });
  if (brand.slug === 'techart' && filters.model) {
    if (filters.model !== '911' && filters.model !== 'cayenne') notFound();
    const matching = filterProducts(catalog, { brand: 'techart', make: 'porsche', model: filters.model });
    const options = filters.model === '911' ? vehicleOptions(matching) : cayenneOptions(matching);
    const step = techartStep(options, filters);
    if (step.invalid) notFound();
    if (step.next) permanentRedirect(shopBrandHref('techart', step.next));
  }
  const canonical = shopBrandHref(brand.slug, filters);
  if (canonical.split('?')[0] !== pathname || brand.slug === 'techart' && ['fit', 'generation', 'body', 'choose', 'model', 'make'].some(key => !!query[key])) permanentRedirect(canonical);
  const products = catalog.filter(product => supplierOf(product) === brand.slug);
  if (scope.make && !products.some(product => tagsFor(product, 'make').includes(scope.make!))) notFound();
  if (scope.model && !choices[scope.make!]?.some(item => item.slug === scope.model) && !products.some(product => tagsFor(product, 'model').includes(scope.model!))) notFound();
  if (brand.slug === 'novitec' && scope.body && !novitecVariantFamilies[scope.make!]?.[scope.model!]?.some(item => item.key === scope.body)) notFound();
  if (brand.slug === 'novitec') return <NovitecShopPreview products={products} />;
  if (previewBrands.some(item => item === brand.slug)) return <BrandShopPreview key={brand.slug} brand={brand.slug} products={products} />;
  return <Catalog products={products} filters={filters} title={`${brand.name} Parts`} basePath="/shop" />;
}
