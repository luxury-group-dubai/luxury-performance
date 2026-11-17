import publishedOrder from './novitec-programme-order.json';
import { categoryOf, supplierOf, tagsFor, type Filters } from './taxonomy';
import type { CatalogProduct } from './types';
import { novitecFilterVariants } from './novitec-variants';

export const novitecProgrammeCategories = ['Performance & Exhaust', 'Wheels', 'Suspension', 'Aerodynamics', 'Special Parts'] as const;

export function compareProgrammeCategories(a: string, b: string) {
  const rank = (name: string) => {
    const index = novitecProgrammeCategories.findIndex(category => category === name);
    return index < 0 ? novitecProgrammeCategories.length : index;
  };
  return rank(a) - rank(b) || a.localeCompare(b);
}

// NOVITEC abbreviates variants: F1 012 10 / 30 means F1 012 10 and F1 012 30.
// Read complete article numbers first; never sort by the numeric suffix itself.
export function novitecArticleNumbers(value: string) {
  const numbers: string[] = [];
  for (const match of value.toUpperCase().matchAll(/\b([A-Z]\d)[\s-]*(\d{3})[\s-]*(\d{2})((?:\s*[/,]\s*\d{2}\b)*)/g)) {
    const prefix = match[1] + match[2];
    numbers.push(prefix + match[3]);
    for (const suffix of match[4].matchAll(/\d{2}/g)) numbers.push(prefix + suffix[0]);
  }
  return [...new Set(numbers)];
}

type Programme = { source: string; sections: { name: string; entries: { title: string; article: string }[] }[] };
const programmes: Record<string, Programme> = publishedOrder.models;
const aliases: Record<string, string> = { '12cilindri': '12cilindri_coupe', urus: 'urus_original', cullinan: 'cullinan_series_i' };

export function prepareNovitecProgramme(products: CatalogProduct[], model: string) {
  const programme = programmes[aliases[model] ?? model];
  const positions = new Map<string, { category: string; position: number }>();
  for (const section of programme?.sections ?? []) {
    section.entries.forEach((entry, position) => {
      for (const article of novitecArticleNumbers(entry.article)) {
        if (!positions.has(article)) positions.set(article, { category: section.name, position });
      }
    });
  }

  return products.map(product => {
    const articles = novitecArticleNumbers(product.title + ' ' + product.handle);
    const published = articles.map(article => positions.get(article)).find(Boolean);
    const category = categoryOf(product);
    // Keep small exterior pieces with the rest of the bodywork in our shop.
    // NOVITEC lists the F8 reflector alone under Special Parts.
    const programmeCategory = published?.category === 'Special Parts' && /\breflectors?\b/i.test(product.title)
      ? 'Aerodynamics' : published?.category ?? (['Exhaust', 'Performance'].includes(category)
      ? 'Performance & Exhaust' : ['Interior', 'Accessories', 'Other parts'].includes(category) ? 'Special Parts' : category);
    return { product: { ...product, programmeCategory }, position: published?.category === programmeCategory ? published.position : Number.MAX_SAFE_INTEGER };
  }).sort((a, b) => compareProgrammeCategories(a.product.programmeCategory, b.product.programmeCategory)
    || a.position - b.position
    || a.product.title.localeCompare(b.product.title, 'en', { numeric: true }))
    .map(({ product }) => product);
}

// The shop spans multiple cars. Keep each car's published sequence together
// within a category, and use the selected body style when one is specified.
export function prepareNovitecShop(products: CatalogProduct[], filters: Filters) {
  if (filters.brand !== 'novitec') return products;
  const buckets = new Map<string, CatalogProduct[]>();
  const others: CatalogProduct[] = [];
  const variants = novitecFilterVariants(filters);
  const selectedVariant = variants.find(variant => variant.key === filters.body);
  for (const product of products) {
    if (supplierOf(product) !== 'novitec') { others.push(product); continue; }
    const model = (variants.length && !selectedVariant ? undefined : filters.model) ?? tagsFor(product, 'model')[0] ?? '';
    const version = selectedVariant?.model ?? (model === 'f8' ? `f8_${filters.body === 'spider' ? 'spider' : 'tributo'}`
      : model === 'sf90' ? `sf90_${filters.body === 'spider' ? 'spider' : 'stradale'}`
      : model === '12cilindri' && filters.body === 'spider' ? '12cilindri_spider' : model);
    const bucket = buckets.get(version) ?? [];
    bucket.push(product);
    buckets.set(version, bucket);
  }
  const prepared = [...buckets].sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))
    .flatMap(([model, items]) => prepareNovitecProgramme(items, model))
    .sort((a, b) => compareProgrammeCategories(categoryOf(a), categoryOf(b)));
  return [...prepared, ...others];
}
