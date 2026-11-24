import type { CatalogProduct } from './types';
import { filterProducts, label, supplierOf, suppliers, tagsFor, techartFitmentLabel, type Filters } from './taxonomy';
import { shopBrandHref, shopPathFilters } from './routes';
import { techartSelection, vehicleBodyMatch } from './techart-fitment';
import { capristoProductFitments } from './capristo-fitment';
import { valvetronicProductFitments } from './valvetronic-fitment';

export type ProductCrumb = { label: string; href?: string };

// Treat incoming navigation context as a suggestion, never as fitment evidence.
function matchingContext(product: CatalogProduct, from?: string): Filters | undefined {
  if (!from || from.length > 1800 || !from.startsWith('/shop/') || /[\\\\#]/.test(from)) return;
  const url = new URL(from, 'https://www.luxuryperformance.com');
  const scope = shopPathFilters(url.pathname);
  if (scope.brand !== supplierOf(product) || scope.view || !scope.model || !scope.make) return;
  const filters: Filters = { ...Object.fromEntries(['generation', 'fit'].flatMap(key => url.searchParams.get(key) ? [[key, url.searchParams.get(key)!]] : [])), ...Object.fromEntries(Object.entries(scope).filter(([, value]) => value !== undefined)) };
  if (!filterProducts([product], filters).length) return;
  const selection = techartSelection(filters);
  if (filters.brand === 'techart' && (filters.body || filters.fit) && (!selection?.body || vehicleBodyMatch(product, selection) !== 'allowed')) return;
  return { ...filters, ...Object.fromEntries(['category', 'sort', 'page'].flatMap(key => url.searchParams.get(key) ? [[key, url.searchParams.get(key)!]] : [])) };
}

export function productBreadcrumbs(product: CatalogProduct, from?: string): ProductCrumb[] {
  const brand = supplierOf(product);
  const crumbs: ProductCrumb[] = [{ label: 'SHOP', href: '/shop' }, { label: suppliers.find(item => item.slug === brand)?.name || product.vendor, href: shopBrandHref(brand) }];
  const context = matchingContext(product, from);
  const makes = tagsFor(product, 'make'), models = tagsFor(product, 'model');
  const filters = context || (makes.length === 1 && models.length === 1 ? { brand, make: makes[0], model: models[0] } : undefined);
  if (filters?.make && filters.model) {
    const base = { make: filters.make, model: filters.model };
    if (brand !== 'techart') crumbs.push({ label: label(filters.make), href: shopBrandHref(brand, { make: filters.make }) });
    crumbs.push({ label: label(filters.model), href: shopBrandHref(brand, base) });
    const generation = filters.generation;
    const fitment = filters.fit && ['capristo', 'valvetronic'].includes(brand) ? (brand === 'capristo' ? capristoProductFitments : valvetronicProductFitments)(product, filters.make, filters.model).find(item => item.key === filters.fit) : undefined;
    if (generation) crumbs.push({ label: fitment?.generationLabel || generation.replaceAll('_', '.').toUpperCase(), href: shopBrandHref(brand, { ...base, generation }) });
    if (filters.fit) crumbs.push({ label: brand === 'techart' ? filters.body === 'targa' ? techartFitmentLabel(filters.fit).replace(/^Carrera /, 'Targa ') : techartFitmentLabel(filters.fit) : fitment?.version || label(filters.fit), href: shopBrandHref(brand, { ...base, generation, fit: filters.fit, ...(filters.body === 'targa' ? { body: 'targa' } : {}) }) });
    if (filters.body && filters.body !== 'targa') crumbs.push({ label: filters.body === 'coupe' ? 'Coupé' : label(filters.body), href: shopBrandHref(brand, filters) });
  }
  crumbs.push({ label: product.title });
  return crumbs;
}
