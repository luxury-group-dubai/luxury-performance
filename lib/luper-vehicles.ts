import { normalizeSearch } from './shop/search';
import { luperVehicleIndex, vehicleQuery } from './luper-vehicle-index';
import type { CatalogProduct } from './shop/types';
import type { LuperProfile } from './luper-shopping';

/** A compact list of vehicle families with actual parts, not partner marketing ranges. */
export type LuperVehicleCatalog = Record<string, string[]>;
const makeName = (value: string) => normalizeSearch(value).replace(/^mercedes benz$/, 'mercedes').replace(/^range rover$/, 'land rover');
const contains = (text: string, term: string) => ` ${text} `.includes(` ${term} `);

export function luperVehicleCatalog(products: CatalogProduct[]): LuperVehicleCatalog {
  const vehicles = new Map<string, Set<string>>();
  for (const item of luperVehicleIndex(products).destinations) {
    if (item.brand) continue;
    const make = makeName(item.make);
    if (!vehicles.has(make)) vehicles.set(make, new Set());
    for (const alias of item.aliases) vehicles.get(make)!.add(alias);
  }
  return Object.fromEntries([...vehicles].sort(([a], [b]) => a.localeCompare(b))
    .map(([make, models]) => [make, [...models].sort()]));
}

export function luperVehicleCoverage(profile: Pick<LuperProfile, 'make' | 'model'>, catalog: LuperVehicleCatalog): 'listed' | 'not_listed' | 'unknown' {
  const make = makeName(profile.make), model = vehicleQuery(profile.model);
  if (!make) return 'unknown';
  if (!Object.hasOwn(catalog, make)) return 'not_listed';
  if (!model || !catalog[make].length) return 'unknown';
  // A family match is not confirmation of a particular year, trim or fitment.
  return catalog[make].some(listed => contains(model, listed) || contains(listed, model)) ? 'listed' : 'not_listed';
}
