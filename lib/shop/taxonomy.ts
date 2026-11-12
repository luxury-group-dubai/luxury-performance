import { ferrariVersionMatch, is812Selection, isSF90Body, isSF90Selection } from './novitec-ferrari-fitment';
import { matchesSearch } from './search';
import { f8BodyMatch, isF8Body, isF8Selection } from './novitec-f8-fitment';
import type { CatalogProduct } from './types';
export const suppliers = [
  { slug: 'novitec', name: 'NOVITEC', image: 'ferrari', line: 'Individuality, without compromise.', description: 'Explore by vehicle, then discover the exhaust, aerodynamic, wheel and suspension programme.', categories: ['Aerodynamics', 'Exhaust', 'Wheels', 'Suspension', 'Performance'] },
  { slug: 'techart', name: 'TECHART', image: 'porsche', line: 'Your Porsche. Your signature.', description: 'Start with your Porsche model and exact fitment group. Build a specification across exterior, interior and performance.', categories: ['Aerodynamics', 'Wheels', 'Exhaust', 'Suspension', 'Performance', 'Interior', 'Accessories'] },
  { slug: 'valvetronic', name: 'Valvetronic Designs', image: 'lamborghini', line: 'A voice of its own.', description: 'Find your vehicle, then explore valved systems, downpipes and exhaust components.', categories: ['Valved exhaust systems', 'Downpipes', 'Front pipes', 'Exhaust components'] },
  { slug: 'capristo', name: 'CAPRISTO', image: 'ferrari', line: 'Performance and sound.', description: 'Explore exhaust systems, carbon components and performance parts for your vehicle.', categories: ['Exhaust', 'Aerodynamics', 'Wheels', 'Performance', 'Interior'] },
  { slug: 'urban', name: 'URBAN Automotive', image: 'wheel', line: 'Distinctive details.', description: 'Selected used URBAN components, limited to the stock available.', categories: ['Wheels', 'Aerodynamics', 'Accessories', 'Other parts'] },
  { slug: 'oem', name: 'Genuine OEM', image: 'sf90', line: 'Original engineering.', description: 'Selected original components. Review the individual listing for condition, included parts and vehicle compatibility.', categories: ['Exhaust', 'Aerodynamics', 'Performance', 'Other parts'] },
  { slug: 'collectibles', name: 'Collectibles', image: 'mclaren', line: 'Performance, in another form.', description: 'Scale models and automotive pieces for your collection.', categories: ['Collectibles'] },
];
export function supplierOf(p: CatalogProduct) {
  const v = p.vendor.toLowerCase();
  if (v.includes('novitec')) return 'novitec'; if (v.includes('techart')) return 'techart'; if (v.includes('valvetronic')) return 'valvetronic';
  if (v.includes('capristo')) return 'capristo'; if (v.includes('urban')) return 'urban';
  if (v.includes('collectible')) return 'collectibles'; return 'oem';
}
const exact: Record<string, string> = { bmw: 'BMW', amg: 'AMG', mclaren: 'McLaren', rolls_royce: 'Rolls-Royce', mercedes: 'Mercedes-Benz', mercedes_benz: 'Mercedes-Benz', porsche: 'Porsche', audi: 'Audi', f12: 'F12', f8: 'F8', sf90: 'SF90', '812_gts': '812 GTS', '812_superfast': '812 Superfast', '12cilindri': '12Cilindri', '911': '911', gt3: 'GT3', g63: 'G63', m3: 'M3', m4: 'M4', m5: 'M5', x5: 'X5', x6: 'X6' };
export function label(value: string) { return value === 'suv' ? 'SUV' : exact[value] || value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
export function tagsFor(p: CatalogProduct, type: 'make' | 'model' | 'fit') {
  const prefixes = type === 'make' ? ['car_make_', 'make_', 'car_'] : type === 'model' ? ['car_model_', 'model_'] : ['fit_'];
  const result = p.tags.flatMap(t => { const prefix = prefixes.find(pre => t.startsWith(pre)); return prefix ? [t.slice(prefix.length)] : []; });
  const junk = /^(model_|make_|sports$|waitlist$|exclusivecarbon$|muffler$|nsactive$|standar$|tecnic$|technica$|sports$|truck$|v8$|vtec$|n55$|fa20$|lp$|vw$)/;
  return [...new Set(result.filter(v => !junk.test(v)))];
}
export function fitLabel(v: string) {
  const display = v.replace(/_gt3_gt3_touring$/, v.startsWith('991_1_') ? '_gt3' : '_gt3_touring').replace(/_gt3_with_wing$/, '_gt3')
    .replace(/_gt3_rs_st$/, '_gt3_RS_/_S/T').replace(/_st$/, '_S/T');
  return label(display.replace(/^(99[12]|e3)_([12])(?=_|$)/, '$1.$2')).replace(/\b4s\b/gi, '4S').replace(/Turbo S/gi, 'Turbo S').replace(/Gt3/gi, 'GT3').replace(/Gts/gi, 'GTS').replace(/\bRs\b/g, 'RS').replace(/\bE Hybrid\b/g, 'E-Hybrid').replace(/\bTurbo Gt\b/g, 'Turbo GT');
}
export function techartGeneration(fit?: string) {
  return /^(99[12]_[12]|e3_[12])(?:_|$)/.exec(fit ?? '')?.[1];
}
export function techartFitmentLabel(fit: string) {
  const generation = techartGeneration(fit);
  return generation && fit !== generation ? fitLabel(fit).slice(fitLabel(generation).length + 1) : fitLabel(fit);
}
export function categoryOf(p: CatalogProduct) {
  const type = p.productType.toLowerCase(), tags = p.tags.join(' '), title = p.title.toLowerCase();
  if (supplierOf(p) === 'collectibles') return 'Collectibles';
  if (supplierOf(p) === 'valvetronic') {
    const name = title.replace(/[–—-]/g, ' ');
    // Accessories can mention an exhaust system without being a system themselves.
    if (/\b(?:replacement|controller|control box|control kit|harness|antenna|exhaust tips|valve motors?)\b/.test(name)) return 'Exhaust components';
    if (/\bdown\s*pipes?\b/.test(name)) return 'Downpipes';
    if (/\bfront pipes?\b/.test(name) && !/\bexhaust system\b/.test(name)) return 'Front pipes';
    // Some genuine system names end at “Valved Sport Exhaust”, including the E46 M3.
    if (/\b(?:valved (?:sport |axleback )?exhaust|exhaust (?:system|package))\b/.test(name)) return 'Valved exhaust systems';
    return 'Exhaust components';
  }
  if (/category_(aero|aerodynamic)/.test(tags) || /aero|spoiler|bumper|splitter|diffuser/.test(type)) return 'Aerodynamics';
  if (/category_exhaust/.test(tags) || /exhaust/.test(type)) return 'Exhaust';
  if (/category_wheels/.test(tags) || /wheel/.test(type)) return 'Wheels';
  if (/category_suspension/.test(tags) || /suspension|spring|lift/.test(type)) return 'Suspension';
  if (/category_interior/.test(tags) || /interior|seat|door sill/.test(type)) return 'Interior';
  if (/category_(performance|engine)/.test(tags) || /performance|turbo|engine/.test(type)) return 'Performance';
  return /accessor/.test(type) ? 'Accessories' : 'Other parts';
}
export const inStockShopPath = '/shop?stock=in-stock';
export type Filters = { brand?: string; stock?: string; make?: string; model?: string; generation?: string; fit?: string; body?: string; category?: string; q?: string; sort?: string; page?: string };
export function techartFitKeys(fit: string, body?: string) {
  // Both distinct 992.1 cars have parts in this shared manufacturer column.
  // Model-specific approval is applied separately by bodyMatch.
  if (/^992_1_(gt3_rs|st)$/.test(fit)) return [fit, '992_1_gt3_rs_st'];
  // Rear-wing GT3 selections also consider shared GT3 listings. The body-fitment
  // evidence must still approve each part for the winged car, excluding Touring-only parts.
  const gt3 = /^(991_2|992_[12])_gt3_with_wing$/.exec(fit)?.[1];
  if (gt3) return [fit, `${gt3}_gt3_gt3_touring`];
  // TECHART uses two catalogue columns for the same Targa 4 GTS when body is Targa.
  const generation = body === 'targa' && /^(99[12]_[12])_carrera_(?:4_gts|targa_gts)$/.exec(fit)?.[1];
  return generation ? [`${generation}_carrera_4_gts`, `${generation}_carrera_targa_gts`] : [fit];
}
export function filterProducts(products: CatalogProduct[], f: Filters) {
  const f8Body = isF8Selection(f) && isF8Body(f.body) ? f.body : undefined;
  const sf90Body = isSF90Selection(f) && isSF90Body(f.body) ? f.body : undefined;
  const version812 = is812Selection(f) ? (f.model === '812_gts' ? 'gts' : 'superfast') : undefined;
  const fits = f.fit ? f.brand === 'techart' && f.model === '911' ? techartFitKeys(f.fit, f.body) : [f.fit] : [];
  const generation = f.brand === 'techart' && !f.fit ? f.generation : undefined;
  const result = products.filter(p => (!f.brand || supplierOf(p) === f.brand) && (!f.make || tagsFor(p, 'make').includes(f.make)) && (!f.model || tagsFor(p, 'model').includes(f.model)) && (!generation || tagsFor(p, 'fit').some(fit => techartGeneration(fit) === generation)) && (!fits.length || tagsFor(p, 'fit').some(fit => fits.includes(fit))) && (!f8Body || f8BodyMatch(p, f8Body) === 'allowed') && (!sf90Body || ferrariVersionMatch(p, sf90Body) === 'allowed') && (!version812 || ferrariVersionMatch(p, version812) === 'allowed') && (!f.category || categoryOf(p) === f.category) && (!f.q || matchesSearch(p, f.q)));
  if (f.sort === 'price-up') result.sort((a,b) => Number(a.priceRange.minVariantPrice.amount) - Number(b.priceRange.minVariantPrice.amount));
  if (f.sort === 'price-down') result.sort((a,b) => Number(b.priceRange.minVariantPrice.amount) - Number(a.priceRange.minVariantPrice.amount));
  if (f.sort === 'name') result.sort((a,b) => a.title.localeCompare(b.title));
  return result;
}

// Vehicle selections form a hierarchy; never carry a previous car's fitment forward.
export function updateFilters(current: Filters, changes: Partial<Filters>): Filters {
  const next = { ...current, ...changes, page: undefined };
  if ('brand' in changes) return { brand: changes.brand, ...(next.stock ? { stock: next.stock } : {}) };
  if ('make' in changes) next.model = undefined;
  if ('make' in changes || 'model' in changes) next.generation = undefined;
  if ('make' in changes || 'model' in changes || 'generation' in changes) {
    next.fit = undefined;
    next.body = undefined;
  } else if ('fit' in changes) {
    // Fit-only links from the partner page imply their generation.
    if (current.brand === 'techart') next.generation ||= techartGeneration(changes.fit || current.fit);
    next.body = undefined;
  }
  return next;
}
export function filterUrl(basePath: string, filters: Filters) {
  const params = new URLSearchParams();
  for (const key of ['stock', 'brand', 'make', 'model', 'generation', 'fit', 'body', 'category', 'q', 'sort', 'page'] as const) {
    const value = filters[key]?.trim();
    if (value) params.set(key, value);
  }
  return params.size ? `${basePath}?${params}` : basePath;
}

export function fitOptions(products: CatalogProduct[], filters: Filters) {
  const scope = filterProducts(products, { brand: filters.brand, make: filters.make, model: filters.model });
  // Shared parts can have tags for both Porsche families. Only show the chosen family's generations.
  const family = filters.brand === 'techart'
    ? filters.model === 'cayenne' ? /^e3_/ : filters.model === '911' ? /^99[12]_/ : null
    : null;
  const fits = scope.flatMap(p => tagsFor(p, 'fit'));
  if (filters.brand === 'techart' && filters.model === '911') {
    for (const fit of [...fits]) {
      if (/^(991_2|992_[12])_gt3_gt3_touring$/.test(fit)) fits.push(fit.replace(/_gt3_gt3_touring$/, '_gt3_with_wing'));
      if (fit === '992_1_gt3_rs_st') fits.push('992_1_gt3_rs', '992_1_st');
    }
  }
  return [...new Set(fits)].filter(fit => !family || family.test(fit)).sort();
}
