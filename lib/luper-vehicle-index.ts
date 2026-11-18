import { prepareBrandCatalogue } from '@/app/preview/shop/brand-catalogue';
import { buildVehicleChoices } from '@/app/preview/shop/vehicle-data';
import { label, suppliers } from './shop/taxonomy';
import { shopBrandHref, vehicleBrowseHref } from './shop/routes';
import { normalizeSearch } from './shop/search';
import type { CatalogProduct } from './shop/types';
import type { VehicleChoice } from '@/app/preview/shop/vehicle-navigation';

export const vehicleQuery = (text: string) => normalizeSearch(text).replace(/\b1\s*cilindri\b/g, '12cilindri');
export const vehicleMakeAliases = (make: string) => [...new Set([normalizeSearch(make), normalizeSearch(label(make)),
  ...(make === 'mercedes' || make === 'mercedes_benz' ? ['mercedes', 'mercedes benz', 'mercedes amg'] : []),
  ...(make === 'range_rover' ? ['land rover range rover'] : [])])];
const aliasesFor = (names: string[]) => [...new Set(names.filter(Boolean).flatMap(name => {
  const normalized = vehicleQuery(name);
  return [normalized, normalized.replaceAll(' ', '')];
}))];
export type LuperVehicleDestination = {
  make: string; model: string; body?: string; brand?: string; name: string; title: string;
  href: string; aliases: string[]; phrases: string[];
};

const cache = new WeakMap<CatalogProduct[], { products: CatalogProduct[]; destinations: LuperVehicleDestination[] }>();

/** Share the live shop's repairs, families, versions and verified brand destinations. */
export function luperVehicleIndex(raw: CatalogProduct[]) {
  const cached = cache.get(raw);
  if (cached) return cached;
  const products = prepareBrandCatalogue(raw);
  const choices = buildVehicleChoices(products);
  const destinations: LuperVehicleDestination[] = [];
  for (const [make, models] of Object.entries(choices)) for (const model of models) {
    const add = (choice: VehicleChoice, brand?: string, href?: string) => {
      const brandName = suppliers.find(supplier => supplier.slug === brand)?.name;
      const parentAliases = aliasesFor([model.slug, model.name]);
      const aliases = aliasesFor([choice.name, `${choice.slug} ${choice.body || ''}`])
        .filter(alias => !choice.body || !parentAliases.includes(alias));
      const names = aliases.flatMap(alias => [alias, ...vehicleMakeAliases(make).map(name => `${name} ${alias}`)]);
      const phrases = brand ? aliasesFor([brand, brandName || brand]).flatMap(name => names.map(phrase => `${name} ${phrase}`)) : names;
      destinations.push({ make, model: choice.slug, body: choice.body, brand, name: choice.name,
        title: `${brandName ? `${brandName} · ` : ''}${label(make)} ${choice.name}`,
        href: href || vehicleBrowseHref(make, choice.slug, choice.body), aliases, phrases });
    };
    add(model);
    for (const brand of model.brands) add(model, brand.slug, brand.href);
    for (const brand of new Set(model.variants?.flatMap(variant => variant.brands.map(item => item.slug)) || [])) {
      add(model, brand, shopBrandHref(brand, { make, model: model.slug }));
    }
    for (const variant of model.variants || []) {
      add(variant);
      for (const brand of variant.brands) add(variant, brand.slug, brand.href);
    }
  }
  const result = { products, destinations };
  cache.set(raw, result);
  cache.set(products, result);
  return result;
}
