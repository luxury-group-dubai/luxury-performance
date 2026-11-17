import { normalizeSearch } from '@/lib/shop/search';
import { label } from '@/lib/shop/taxonomy';
import { previewShopBrands } from './navigation';
import { vehicleChoiceHref, vehicleStepHref, type VehicleChoices } from './vehicle-navigation';

export type ShopSearchDestination = { name: string; href: string; note?: string; make?: string; artwork?: string; logoName?: string };
export type ShopSearchDestinations = {
  brands: ShopSearchDestination[];
  vehicles: ShopSearchDestination[];
  collections: ShopSearchDestination[];
};

/** Both shop search and the preview's global search use the actual selector destinations. */
export function searchShopDestinations(models: VehicleChoices, query: string): ShopSearchDestinations {
  const phrase = normalizeSearch(query);
  const terms = phrase.split(' ').filter(Boolean);
  if (phrase.length < 2) return { brands: [], vehicles: [], collections: [] };
  const matches = (text: string) => terms.every(term => normalizeSearch(text).includes(term));
  const rank = (items: ShopSearchDestination[]) => items.sort((a, b) => {
    const score = (name: string) => normalizeSearch(name) === phrase ? 2 : normalizeSearch(name).startsWith(phrase) ? 1 : 0;
    return score(b.name) - score(a.name) || a.name.localeCompare(b.name, 'en', { numeric: true });
  });
  const makes = Object.keys(models).filter(make => models[make].length);
  const brands = rank(previewShopBrands.filter(brand => matches(brand.name))).slice(0, 4);
  const cars = makes.flatMap(make => models[make].flatMap(model => model.variants ?? [model]).map(car => ({ make, car, name: `${label(make)} ${car.name}` })));
  const vehicles = rank([
    ...makes.filter(make => matches(label(make))).map(make => ({ name: label(make), href: vehicleStepHref(make), make, logoName: label(make) })),
    ...cars.filter(({ name }) => matches(name)).map(({ make, car, name }) => ({ name, href: vehicleChoiceHref(make, car), make, logoName: label(make) })),
  ]).slice(0, 6);
  // Always expose compatible brand collections for a matching car, even without a brand in the query.
  const collections = rank(cars.flatMap(({ name, car }) => car.brands
    .filter(brand => matches(`${brand.name} ${name}`))
    .map(brand => ({ name: `${brand.name} · ${name}`, href: brand.href, artwork: brand.artwork ?? brand.slug, logoName: brand.name }))
  )).slice(0, 6);
  return { brands, vehicles, collections };
}
