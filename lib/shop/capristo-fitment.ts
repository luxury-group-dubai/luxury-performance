import type { CatalogProduct } from './types';

export type CapristoFitment = { key: string; generation?: string; generationLabel?: string; version: string };

const bmwChassis: Record<string, readonly string[]> = {
  '550i': ['f10', 'f11'], '650i': ['f06', 'f12', 'f13'],
  m2: ['f87', 'g87'], m3: ['e92', 'f80', 'g80', 'g81'],
  m4: ['f82', 'f83', 'g82', 'g83'], m5: ['f10', 'f90', 'g90', 'g99'],
  m6: ['f12', 'f13'], m8: ['f91', 'f92', 'f93'], m850i: ['g15'],
  x3_m: ['f97'], x4_m: ['f98'], x5_m: ['f85', 'f95'], x6_m: ['f86', 'f96'], xm: ['g09'],
};

export function capristoFitLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
    .replace(/\b(?:gt[234bo]|gts|rs|rs[345678]|opf|pse|oem|suv|us|euro|v[68]|w12|amg|cs|csl|qv|trx)\b/gi, word => word.toUpperCase())
    .replace(/\b4s\b/gi, '4S').replace(/\bE Hybrid\b/g, 'E-Hybrid')
    .replace(/\bPre Facelift\b/g, 'Pre-facelift').replace(/\bVor Facelift\b/g, 'Pre-facelift')
    .replace(/\bEuropa Version\b/g, 'European version');
}

export function capristoFitment(key: string, make: string, model: string): CapristoFitment | undefined {
  let value = key;
  if (make === 'porsche') {
    const families: Record<string, RegExp> = {
      '911': /^(99[127]_[12])(?:_|$)/,
      '718': /^(982)(?:_|$)/,
      boxster: /^(987_[12]|981|982)(?:_|$)/,
      cayman: /^(987_[12]|981|982)(?:_|$)/,
      cayenne: /^(92a|po536)(?:_|$)/,
      macan: /^(95b)(?:_|$)/,
      panamera: /^(970|971)(?:_|$)/,
    };
    const generation = families[model]?.exec(key)?.[1];
    if (!generation) return undefined;
    const version = key.slice(generation.length).replace(/^_/, '');
    if (model === 'boxster' && /(?:^|_)(?:cayman|gt4)(?:_|$)/.test(version)) return undefined;
    if (model === 'cayman' && /(?:^|_)(?:boxster|spyder)(?:_|$)/.test(version)) return undefined;
    return {
      key, generation,
      generationLabel: generation.replace(/^(99[127]|987)_([12])$/, '$1.$2').toUpperCase(),
      version: version ? capristoFitLabel(version) : 'Standard',
    };
  }

  if (key.startsWith(`${model}_`)) value = key.slice(model.length + 1);
  else if (make === 'bmw') {
    const chassis = key.split('_')[0];
    if (!bmwChassis[model]?.includes(chassis)) return undefined;
  } else return undefined;

  const generation = /(?:^|_)(\d+(?:st|nd|rd|th)_generation|[a-z]{1,3}\d{1,3}[a-z]?|\d[a-z][a-z0-9]?|42)(?=_|$)/.exec(value)?.[1];
  const version = generation ? value.replace(generation, '').replace(/^_|_$/g, '').replace(/__+/g, '_') : value;
  return {
    key, generation,
    generationLabel: generation ? capristoFitLabel(generation).replace(/\b[a-z]+\d+[a-z]?\b/gi, word => word.toUpperCase()) : undefined,
    version: version ? capristoFitLabel(version) : 'Standard',
  };
}

export function capristoProductFitments(product: CatalogProduct, make: string, model: string) {
  return [...new Set(product.tags.filter(tag => tag.startsWith('fit_')))].flatMap(tag => {
    const fitment = capristoFitment(tag.slice(4), make, model);
    return fitment ? [fitment] : [];
  });
}

export function capristoFitmentOptions(products: CatalogProduct[], make: string, model: string) {
  const options = new Map<string, CapristoFitment & { count: number }>();
  for (const product of products) {
    for (const fitment of capristoProductFitments(product, make, model)) {
      const option = options.get(fitment.key);
      options.set(fitment.key, { ...fitment, count: (option?.count ?? 0) + 1 });
    }
  }
  return [...options.values()].sort((a, b) => a.key.localeCompare(b.key, 'en', { numeric: true }));
}
