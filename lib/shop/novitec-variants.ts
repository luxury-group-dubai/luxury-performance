import type { Filters } from './taxonomy';

type Variant = { key: string; name: string; model: string; tag: string };
export const novitecVariantFamilies: Record<string, Record<string, readonly Variant[]>> = {
  ferrari: {
    '12cilindri': [
      { key: 'coupe', name: '12Cilindri Coupé', model: '12cilindri_coupe', tag: '12cilindri' },
      { key: 'spider', name: '12Cilindri Spider', model: '12cilindri_spider', tag: '12cilindri' },
    ],
    '812': [
      { key: 'superfast', name: '812 Superfast', model: '812_superfast', tag: '812_superfast' },
      { key: 'gts', name: '812 GTS', model: '812_gts', tag: '812_gts' },
    ],
    f8: [
      { key: 'tributo', name: 'F8 Tributo', model: 'f8_tributo', tag: 'f8' },
      { key: 'spider', name: 'F8 Spider', model: 'f8_spider', tag: 'f8' },
    ],
    sf90: [
      { key: 'stradale', name: 'SF90 Stradale', model: 'sf90_stradale', tag: 'sf90' },
      { key: 'spider', name: 'SF90 Spider', model: 'sf90_spider', tag: 'sf90' },
    ],
  },
  lamborghini: { urus: [
    { key: 'original', name: 'Urus', model: 'urus_original', tag: 'urus' },
    { key: 's', name: 'Urus S', model: 'urus_s', tag: 'urus_s' },
    { key: 'performante', name: 'Urus Performante', model: 'urus_performante', tag: 'urus_performante' },
  ] },
  rolls_royce: { cullinan: [
    { key: 'series_i', name: 'Cullinan', model: 'cullinan_series_i', tag: 'cullinan' },
    { key: 'series_ii', name: 'Cullinan Series II', model: 'cullinan_series_ii', tag: 'cullinan_series_ii' },
  ] },
};

export function novitecFilterVariants(filters: Filters) {
  if (filters.brand !== 'novitec' || !filters.make || !filters.model) return [];
  return novitecVariantFamilies[filters.make]?.[filters.model] ?? [];
}

export function normalizeNovitecFilters(filters: Filters): Filters {
  if (filters.brand !== 'novitec' || !filters.make || !filters.model) return filters;
  for (const [family, variants] of Object.entries(novitecVariantFamilies[filters.make] ?? {})) {
    if (family === filters.model) return filters;
    const selected = variants.find(variant => variant.model === filters.model);
    if (selected) return { ...filters, model: family, body: filters.body ?? selected.key };
  }
  return filters;
}

export function novitecFilterModelKeys(filters: Filters) {
  const variants = novitecFilterVariants(filters);
  if (!variants.length) return filters.model ? [filters.model] : [];
  const selected = filters.body ? variants.filter(variant => variant.key === filters.body) : variants;
  return [...new Set(selected.map(variant => variant.tag))];
}
