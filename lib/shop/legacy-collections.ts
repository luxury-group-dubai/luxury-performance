import { shopBrandHref, stockBrowseHref, vehicleBrowseHref } from './routes';

const brands = new Set(['novitec', 'techart', 'valvetronic', 'capristo', 'gintani', 'urban', 'oem', 'collectibles']);
const vehicles: Record<string, [string, string]> = {
  'ferrari-purosangue': ['ferrari', 'purosangue'], 'ferrari-sf90': ['ferrari', 'sf90'],
  'ferrari-12cilindri': ['ferrari', '12cilindri'], 'ferrari-f8': ['ferrari', 'f8'], 'ferrari-812': ['ferrari', '812'],
  'lamborghini-revuelto': ['lamborghini', 'revuelto'], 'lamborghini-urus': ['lamborghini', 'urus'],
  'mclaren-750s': ['mclaren', '750s'], 'rolls-royce-cullinan': ['rolls_royce', 'cullinan'],
  'rolls-royce-spectre': ['rolls_royce', 'spectre'],
};
const makes = new Set(['ferrari', 'lamborghini', 'mclaren', 'rolls-royce', 'porsche', 'bmw', 'mercedes', 'audi']);

/** Retired collection URLs lead into the current shop, never the old catalog UI. */
export function legacyCollectionHref(handle: string, query: Record<string, string | string[] | undefined> = {}): string {
  if (['used-parts', 'lxp-used', 'in-stock'].includes(handle)) return stockBrowseHref();
  const requestedBrand = Array.isArray(query.brand) ? query.brand[0] : query.brand;
  const handleBrand = handle.replace(/^brand-/, '');
  const brand = requestedBrand && brands.has(requestedBrand) ? requestedBrand : brands.has(handleBrand) ? handleBrand : undefined;
  const vehicle = Object.hasOwn(vehicles, handle) ? vehicles[handle] : undefined;
  if (vehicle) return brand ? shopBrandHref(brand, { make: vehicle[0], model: vehicle[1] }) : vehicleBrowseHref(vehicle[0], vehicle[1]);
  if (makes.has(handle)) return brand ? shopBrandHref(brand, { make: handle.replaceAll('-', '_') }) : vehicleBrowseHref(handle.replaceAll('-', '_'));
  return brand ? shopBrandHref(brand) : '/shop';
}
