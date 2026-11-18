import type { CatalogProduct } from '@/lib/shop/types';
import { label, supplierOf, tagsFor } from '@/lib/shop/taxonomy';
import { valvetronicVehicles } from '@/lib/shop/valvetronic-fitment';
import { valvetronicModelKey } from '@/lib/shop/valvetronic-models';

export const previewBrands = ['capristo', 'valvetronic', 'gintani', 'techart'] as const;
export function previewBrandPath(brand: string) {
  return `/shop/${brand}`;
}

// Preview-only repairs for the old import's incomplete and tokenised vehicle tags.
// Titles supply missing model names; Shopify data is left unchanged.
export function prepareBrandCatalogue(products: CatalogProduct[]) {
  return products.map(product => {
    if (supplierOf(product) !== 'valvetronic') return product;
    const makes = [...new Set(tagsFor(product, 'make').map(make => make === 'corvette' ? 'chevrolet' : make))];
    if (!makes.length) {
      for (const [name, key] of [['Lotus', 'lotus'], ['Subaru', 'subaru'], ['Range Rover', 'range_rover']]) {
        if (product.title.includes(name)) makes.push(key);
      }
    }
    let models = tagsFor(product, 'model');
    const title = product.title.toLowerCase();
    if (makes.includes('ferrari')) {
      models = ['f12', '812', '296', 'sf90', 'f430', 'f8', '458', '488'].filter(model => new RegExp(`\\b${model}\\b`).test(title));
      if (/gtc4\s*lusso/.test(title)) models.push('gtc4lusso');
    } else if (makes.includes('porsche')) {
      models = ['boxster', 'cayman', 'macan'].filter(model => title.includes(model));
      if (/\b718\b/.test(title)) models.push('718');
      if (/\b(?:911|991|992)\b/.test(title)) models.push('911');
    } else {
      const noise = /^(?:lotus|subaru|cs|alpina|40i|m40|m40i|m50|m60|darkhorse|hellcat|sv|svj|ultimae|sto|performante|tecnica|technica|s550|s650|a90|a91|r35|fl5|mk[37]|463a)$/;
      models = models.filter(model => !noise.test(model));
      if (makes.includes('bmw')) models = models.filter(model => !/^[efg]\d{2,3}$/.test(model));
      if (makes.includes('mercedes')) {
        models = models.filter(model => !/^w\d{3}$/.test(model));
        if (/g-wagon/.test(title)) models.push('g_class');
        if (/\bamg gt\b/.test(title)) models.push('gt');
      }
      if (makes.includes('ford')) models = models.filter(model => model !== 'gt');
      if (makes.includes('audi')) models = models.filter(model => !['gallardo', 'huracan', 'b8', 'b9', 'c7'].includes(model));
      if (makes.includes('range_rover')) models = ['sport'];
    }
    const verifiedVehicles = valvetronicVehicles(product);
    models = verifiedVehicles ? verifiedVehicles.filter(vehicle => makes.includes(vehicle.make)).map(vehicle => vehicle.model) : models.map(valvetronicModelKey);
    return { ...product, tags: [...new Set([...product.tags.filter(tag => !/^(?:car_make_|make_|car_model_|model_)/.test(tag)), ...makes.map(make => `make_${make}`), ...models.map(model => `model_${model}`)])] };
  });
}

const names: Record<string, string> = { '812': '812', '12cilindri': '12Cilindri', '575m': '575M', ff: 'FF', gtc4lusso: 'GTC4Lusso', huracan: 'Huracán', murcielago: 'Murciélago', granturismo: 'GranTurismo', rcf: 'RC F', gt_r: 'GT-R', gtr: 'GT-R', tt_rs: 'TT RS', ttrs: 'TT RS', rs_q3: 'RS Q3', rs_q8: 'RS Q8', rsq8: 'RS Q8', gr_supra: 'GR Supra', gti: 'Golf GTI', wrx: 'WRX', c8: 'Corvette C8', z06: 'Corvette Z06' };
export function brandVehicleName(key: string) {
  return names[key] ?? (/^(?:[a-z]{1,4}\d+[a-z\d]*|\d+[a-z]+)$/.test(key) ? key.toUpperCase() : label(key));
}

export function brandMakes(products: CatalogProduct[]) {
  return [...new Set(products.flatMap(product => tagsFor(product, 'make')))].map(key => ({ key, name: label(key) })).sort((a, b) => a.name.localeCompare(b.name));
}
