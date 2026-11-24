import type { Filters } from './taxonomy';
import { normalizeNovitecFilters } from './novitec-variants';
import { valvetronicModelKey } from './valvetronic-models';
import { normalizeTechartRoute, parseTechartPath, techartPath } from './techart-routes';

export type ShopRouteFilters = Filters & { choose?: string; view?: string; stock_group?: string; show?: string };
const slug = (value: string) => encodeURIComponent(value.replaceAll('_', '-'));
const key = (value?: string) => value?.replaceAll('-', '_');
const extraKeys = ['category', 'sort', 'q', 'fit', 'generation', 'choose', 'view', 'stock_group', 'show', 'page'] as const;
function extras(path: string, filters: ShopRouteFilters, omit: string[] = []) {
  const query = new URLSearchParams();
  for (const name of extraKeys) if (filters[name] && !omit.includes(name)) query.set(name, filters[name]!);
  return path + (query.size ? `?${query}` : '');
}
export function shopBrandHref(brand: string, values: ShopRouteFilters = {}) {
  const filters = normalizeNovitecFilters({ ...values, brand, ...(brand === 'valvetronic' && values.model ? { model: valvetronicModelKey(values.model) } : {}) });
  if (brand === 'techart' && (!filters.make || filters.make === 'porsche')) return extras(techartPath(normalizeTechartRoute(filters), values.choose === '1'), filters, ['fit', 'generation', 'choose']);
  const path = ['/shop', slug(brand), ...(filters.make ? [slug(filters.make)] : []), ...(filters.make && filters.model ? [slug(filters.model)] : []), ...(filters.make && filters.model && filters.body ? [slug(filters.body)] : [])].join('/');
  return extras(path, { ...values, ...filters });
}
export function vehicleBrowseHref(make?: string, model?: string, body?: string) {
  return ['/shop/vehicles', ...(make ? [slug(make)] : []), ...(make && model ? [slug(model)] : []), ...(make && model && body ? [slug(body)] : [])].join('/');
}
export function stockBrowseHref(values: ShopRouteFilters = {}) {
  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(values)) if (value && !['view', 'stock'].includes(name)) query.set(name, value);
  return '/shop/in-stock' + (query.size ? `?${query}` : '');
}
export function shopPathFilters(pathname: string): ShopRouteFilters {
  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] !== 'shop' || !segments[1]) return {};
  if (segments[1] === 'vehicles') return { view: 'vehicles', make: key(segments[2]), model: key(segments[3]), body: key(segments[4]) };
  if (segments[1] === 'in-stock') return { view: 'stock' };
  if (segments[1] === 'search') return {};
  if (segments[1] === 'techart' && segments[2] === 'porsche' && segments[3]) {
    const selection = parseTechartPath(segments[3], segments.slice(4));
    return { brand: 'techart', make: 'porsche', model: key(segments[3]), ...(selection ?? { generation: 'invalid' }) };
  }
  return { brand: key(segments[1]), make: key(segments[2]), model: key(segments[3]), body: key(segments[4]) };
}
export function legacyShopHref(values: ShopRouteFilters) {
  if (values.q) return `/shop/search?${new URLSearchParams({ q: values.q })}`;
  if (values.stock === 'in-stock' || values.view === 'stock') return stockBrowseHref(values);
  if (values.brand) return shopBrandHref(values.brand, values);
  if (values.make || values.view === 'vehicles') return vehicleBrowseHref(values.make, values.model, values.body);
  return '/shop';
}

// Navigation context does not change the product's canonical URL.
export function productHref(handle: string, from?: string) {
  const path = `/products/${handle}`;
  return from?.startsWith('/shop/') ? `${path}?${new URLSearchParams({ from })}` : path;
}
