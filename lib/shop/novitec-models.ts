import { label, supplierOf, tagsFor, type Filters } from './taxonomy';
import type { CatalogProduct } from './types';

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
  purosangue: 'purosangue', revuelto: 'revuelto', urus: 'urus',
  urus_performante: 'urus-performante', urus_s: 'urus-s',
  sf90: 'sf90', sf90_stradale: 'sf90', sf90_spider: 'sf90-spider',
  '12cilindri': '12cilindri', f8: 'f8', f8_tributo: 'f8-tributo', f8_spider: 'f8-spider',
  '812': '812-superfast', '812_superfast': '812-superfast', '812_gts': '812-gts',
  '750s': '750s', senna: 'senna', cullinan: 'cullinan',
  cullinan_series_ii: 'cullinan-series-ii', spectre: 'spectre',
};

const ferrariVersions: Record<string, readonly string[]> = {
  '812': ['812_superfast', '812_gts'],
  f8: ['f8_tributo', 'f8_spider'],
  sf90: ['sf90_stradale', 'sf90_spider'],
};

export function novitecModelName(model: string) {
  if (model === '750s') return '750S';
  if (model === 'cullinan_series_ii') return 'Cullinan Series II';
  return label(model).replace(/^F8 /i, 'F8 ').replace(/^SF90 /i, 'SF90 ');
}

export function novitecModelCover(model: string) {
  return Object.hasOwn(covers, model) ? '/images/novitec-models/official-covers/' + covers[model] + '.jpg' : undefined;
}

const graphiteProfiles = new Set(['senna', '812-superfast', 'urus']);

export function novitecShopProfile(model: string, body?: string) {
  const version = body && (model === 'sf90' || model === 'f8') ? `${model}_${body}` : model;
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
    make === 'ferrari' && (key === '812_superfast' || key === '812_gts') ? '812' : key,
  ))].sort((a, b) => novitecModelName(a).localeCompare(novitecModelName(b), 'en', { numeric: true }));
}

export function novitecModelVersions(make: string, model: string) {
  return make === 'ferrari' && Object.hasOwn(ferrariVersions, model) ? ferrariVersions[model] : [];
}

export function novitecModelScope(make: string, model: string): Filters {
  const scope = { brand: 'novitec', make, model };
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
  const keys = make === 'ferrari' && model === '812'
    ? [model, ...novitecModelVersions(make, model)]
    : [scope.model ?? model];
  return novitecProductsForMake(products, make).filter(product => tagsFor(product, 'model').some(key => keys.includes(key)));
}
