import { shopBrandHref, stockBrowseHref, vehicleBrowseHref } from './routes';

const brands = new Set(['novitec', 'techart', 'valvetronic', 'capristo', 'gintani', 'urban', 'oem', 'collectibles']);
const vehicles: Record<string, [make: string, model: string, body?: string]> = {
  'ferrari-purosangue': ['ferrari', 'purosangue'], 'ferrari-sf90': ['ferrari', 'sf90'],
  'ferrari-12cilindri': ['ferrari', '12cilindri'], 'ferrari-f8': ['ferrari', 'f8'], 'ferrari-812': ['ferrari', '812'],
  'ferrari-296': ['ferrari', '296'], 'ferrari-458': ['ferrari', '458'], 'ferrari-488': ['ferrari', '488'],
  'ferrari-california': ['ferrari', 'california'], 'ferrari-gtc-lusso': ['ferrari', 'gtc4lusso'], 'ferrari-roma': ['ferrari', 'roma'],
  'lamborghini-huracan': ['lamborghini', 'huracan'], 'lamborghini-revuelto': ['lamborghini', 'revuelto'], 'lamborghini-urus': ['lamborghini', 'urus'],
  'mclaren-570s': ['mclaren', '570s'], 'mclaren-620r': ['mclaren', '620r'], 'mclaren-720s': ['mclaren', '720s'],
  'mclaren-750s': ['mclaren', '750s'], 'mclaren-765lt': ['mclaren', '765lt'], 'mclaren-artura': ['mclaren', 'artura'], 'mclaren-senna': ['mclaren', 'senna'],
  'rolls-royce-cullinan': ['rolls_royce', 'cullinan'], 'rolls-royce-spectre': ['rolls_royce', 'spectre'],
  '812-gts': ['ferrari', '812', 'gts'], '812-competizione': ['ferrari', '812'], 'f8-spider': ['ferrari', 'f8', 'spider'],
  '750s-coupe': ['mclaren', '750s'], 'urus': ['lamborghini', 'urus'],
  'urus-performante': ['lamborghini', 'urus', 'performante'], 'urus-s': ['lamborghini', 'urus', 's'], 'urus-se': ['lamborghini', 'urus'],
};
const makes = new Set(['ferrari', 'lamborghini', 'mclaren', 'rolls-royce', 'porsche', 'bmw', 'mercedes', 'audi']);
const valvetronicMakes: Record<string, string> = {
  'aston-martin': 'aston_martin', audi: 'audi', dodge: 'dodge', ferrari: 'ferrari', ford: 'ford', honda: 'honda',
  lamborghini: 'lamborghini', lexus: 'lexus', lotus: 'lotus', 'mercedes-amg': 'mercedes', nissan: 'nissan',
  'range-rover': 'range_rover', volkswagen: 'volkswagen',
};
const categorySearches: Record<string, string> = {
  'aerodynamic-styling': 'Aerodynamics', 'category-exhaust': 'Exhaust', 'category-suspension': 'Suspension', 'category-wheels': 'Wheels',
};

/** Return no destination when a retired collection has no relevant current replacement. */
export function legacyCollectionHref(handle: string, query: Record<string, string | string[] | undefined> = {}): string | null {
  const normalized = handle.replace(/-copy(?:-\d+)?$/, '');
  if (['used-parts', 'lxp-used', 'in-stock'].includes(normalized)) return stockBrowseHref();
  if (['category-rev-arts', 'rev-arts-scale-cars'].includes(normalized)) return shopBrandHref('collectibles', { category: 'Model Cars' });
  if (Object.hasOwn(categorySearches, normalized)) return `/shop/search?${new URLSearchParams({ q: categorySearches[normalized] })}`;
  if (normalized === 'valvetronic-products' || normalized === 'valvetronic-jeep') return shopBrandHref('valvetronic');
  const valvetronicMake = normalized.replace(/^valvetronic-/, '');
  if (normalized.startsWith('valvetronic-') && Object.hasOwn(valvetronicMakes, valvetronicMake)) return shopBrandHref('valvetronic', { make: valvetronicMakes[valvetronicMake] });
  if (normalized.startsWith('techart-porsche-')) {
    const model = normalized.slice('techart-porsche-'.length);
    // Only 911 and Cayenne have TECHART model ranges in the current catalogue.
    if (['911', 'cayenne'].includes(model)) return shopBrandHref('techart', { make: 'porsche', model });
    if (['macan', 'panamera'].includes(model)) return shopBrandHref('techart', { make: 'porsche' });
  }
  if (['rolls-royce-dawn', 'rolls-royce-ghost', 'rolls-royce-phantom'].includes(normalized)) return vehicleBrowseHref('rolls_royce');
  const requestedBrand = Array.isArray(query.brand) ? query.brand[0] : query.brand;
  const handleBrand = normalized.replace(/^brand-/, '');
  const brand = requestedBrand && brands.has(requestedBrand) ? requestedBrand : brands.has(handleBrand) ? handleBrand : undefined;
  const vehicle = Object.hasOwn(vehicles, normalized) ? vehicles[normalized] : undefined;
  if (vehicle) return brand ? shopBrandHref(brand, { make: vehicle[0], model: vehicle[1], body: vehicle[2] }) : vehicleBrowseHref(...vehicle);
  const make = normalized.replace(/^car-/, '').replace(/-1$/, '');
  if (makes.has(make)) return brand ? shopBrandHref(brand, { make: make.replaceAll('-', '_') }) : vehicleBrowseHref(make.replaceAll('-', '_'));
  return brand ? shopBrandHref(brand) : null;
}
