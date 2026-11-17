import { label, supplierOf, tagsFor, type Filters } from './taxonomy';
import type { CatalogProduct } from './types';
import { is12CilindriSpiderProduct } from './novitec-12cilindri-fitment';
import { novitecVariantFamilies } from './novitec-variants';

export const novitecMakes = {
  ferrari: { tag: 'ferrari', name: 'Ferrari' },
  lamborghini: { tag: 'lamborghini', name: 'Lamborghini' },
  mclaren: { tag: 'mclaren', name: 'McLaren' },
  'rolls-royce': { tag: 'rolls_royce', name: 'Rolls-Royce' },
} as const;

export function novitecMake(slug: string) {
  return Object.hasOwn(novitecMakes, slug) ? novitecMakes[slug as keyof typeof novitecMakes] : undefined;
}

const covers: Record<string, string> = {
  purosangue: 'purosangue', revuelto: 'revuelto', urus: 'urus', urus_original: 'urus',
  urus_performante: 'urus-performante', urus_s: 'urus-s',
  sf90: 'sf90', sf90_stradale: 'sf90', sf90_spider: 'sf90-spider',
  '12cilindri': '12cilindri', f8: 'f8', f8_tributo: 'f8-tributo', f8_spider: 'f8-spider',
  '812': '812-superfast', '812_superfast': '812-superfast', '812_gts': '812-gts',
  '750s': '750s', senna: 'senna', cullinan: 'cullinan',
  cullinan_series_i: 'cullinan', cullinan_series_ii: 'cullinan-series-ii', spectre: 'spectre',
};

const versionsByMake = Object.fromEntries(Object.entries(novitecVariantFamilies).map(([make, families]) =>
  [make, Object.fromEntries(Object.entries(families).map(([family, variants]) => [family, variants.map(variant => variant.model)]))],
));

// Separate the family selector from the original version's product collection.
const versionModels: Record<string, string> = { urus_original: 'urus', cullinan_series_i: 'cullinan', '12cilindri_coupe': '12cilindri', '12cilindri_spider': '12cilindri' };

export function novitecModelName(model: string) {
  if (model === '12cilindri_coupe') return '12Cilindri Coupé';
  if (model === '12cilindri_spider') return '12Cilindri Spider';
  if (model === 'urus_original') return 'Urus';
  if (model === 'cullinan_series_i') return 'Cullinan';
  if (model === '750s') return '750S';
  if (model === 'cullinan_series_ii') return 'Cullinan Series II';
  return label(model).replace(/^F8 /i, 'F8 ').replace(/^SF90 /i, 'SF90 ');
}

export function novitecModelCover(model: string) {
  if (model === '12cilindri_spider' || model === '12cilindri_coupe') return '/images/novitec-models/' + model.replace('_', '-') + '-side.jpg';
  return Object.hasOwn(covers, model) ? '/images/novitec-models/official-covers/' + covers[model] + '.jpg' : undefined;
}

const graphiteProfiles = new Set(['senna', '812-superfast', 'urus']);

export function novitecShopProfile(model: string, body?: string) {
  const version = body ? `${model}_${body}` : model;
  if (version === '12cilindri_spider') return { src: '/images/novitec-models/shop-profiles/12cilindri-spider.png', name: novitecModelName(version) };
  if (version === '12cilindri_coupe') return { src: '/images/novitec-models/shop-profiles/12cilindri.webp', name: novitecModelName(version) };
  const profileModel = Object.hasOwn(covers, version) ? version : model;
  if (!Object.hasOwn(covers, profileModel)) return undefined;
  const slug = profileModel === 'f8' ? covers.f8_spider : covers[profileModel];
  const artwork = graphiteProfiles.has(slug) ? `${slug}-graphite` : slug;
  return {
    src: `/images/novitec-models/shop-profiles/${artwork}.webp`,
    name: novitecModelName(profileModel),
  };
}

export function novitecModelPath(make: string, model: string) {
  return '/partners/novitec/' + make + '/' + model.replaceAll('_', '-');
}

export function novitecProductsForMake(products: CatalogProduct[], make: string) {
  return products.filter(product => supplierOf(product) === 'novitec' && tagsFor(product, 'make').includes(make));
}

export function novitecModelKeys(products: CatalogProduct[], make: string) {
  return [...new Set(products.flatMap(product => tagsFor(product, 'model')).filter(key => /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(key)).map(key =>
    novitecModelFamily(make, key) ?? key,
  ))].sort((a, b) => novitecModelName(a).localeCompare(novitecModelName(b), 'en', { numeric: true }));
}

export function novitecModelVersions(make: string, model: string) {
  const families = versionsByMake[make];
  return families && Object.hasOwn(families, model) ? families[model] : [];
}

export function novitecModelFamily(make: string, model: string) {
  return Object.entries(versionsByMake[make] ?? {}).find(([, versions]) => versions.includes(model))?.[0];
}

export function novitecModelScope(make: string, model: string): Filters {
  const scope = { brand: 'novitec', make, model: versionModels[model] ?? model };
  if (make !== 'ferrari') return scope;
  const [family, body] = model.split('_');
  if ((family === 'f8' || family === 'sf90') && novitecModelVersions(make, family).includes(model)) {
    return { ...scope, model: family, body };
  }
  if (model === '812') return { brand: 'novitec', make };
  return scope;
}

export function novitecModelProducts(products: CatalogProduct[], make: string, model: string) {
  const scope = novitecModelScope(make, model);
  const versions = novitecModelVersions(make, model);
  const keys = versions.length
    ? [model, ...versions.map(version => novitecModelScope(make, version).model ?? version)]
    : [scope.model ?? model];
  return novitecProductsForMake(products, make).filter(product => tagsFor(product, 'model').some(key => keys.includes(key))
    && (make !== 'ferrari' || model !== '12cilindri_spider' || is12CilindriSpiderProduct(product)));
}
