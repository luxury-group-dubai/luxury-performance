import { cayenneBodyMatch, type CayenneBody } from './techart-cayenne-body-fitment';
import type { VehicleGeneration, VehicleProfile } from './techart-fitment';
import type { CatalogProduct } from './types';

const trims: Record<string, string> = {
  cayenne: 'Cayenne',
  e_hybrid: 'E-Hybrid',
  s: 'S',
  s_e_hybrid: 'S E-Hybrid',
  gts: 'GTS',
  turbo: 'Turbo',
  turbo_s_e_hybrid: 'Turbo S E-Hybrid',
  turbo_e_hybrid: 'Turbo E-Hybrid',
  turbo_gt: 'Turbo GT',
};

// The Q4 price list shares trim columns across both generations. Use Porsche's
// model lineups for the picker and keep existing catalogue fit tags addressable.
const generations = [
  { key: 'e3_1', name: 'E3.1', trims: ['cayenne', 'e_hybrid', 's', 'gts', 'turbo', 'turbo_s_e_hybrid', 'turbo_gt'] },
  { key: 'e3_2', name: 'E3.2', trims: ['cayenne', 'e_hybrid', 's', 's_e_hybrid', 'gts', 'turbo_e_hybrid', 'turbo_gt'] },
];

export const cayenneBodies = [{ key: 'suv', name: 'SUV' }, { key: 'coupe', name: 'Coupé' }] as const;

export function isCayenneFit(fit?: string): fit is string {
  return !!fit && /^e3_[12]_/.test(fit) && Object.hasOwn(trims, fit.slice(5));
}

export function isCayenneLineupFit(fit: string) {
  return generations.some(generation => fit === generation.key || fit.startsWith(`${generation.key}_`) && generation.trims.includes(fit.slice(5)));
}

export function isCayenneBody(body?: string): body is CayenneBody {
  return body === 'suv' || body === 'coupe';
}

export function cayenneImage(fit: string, body: CayenneBody = 'suv'): VehicleProfile {
  const trim = fit.slice(5);
  if (fit.startsWith('e3_2_') && isCayenneLineupFit(fit)) {
    const style = trim === 'turbo_gt' ? 'coupe' : body;
    return { src: `/vehicle-selector/porsche/cayenne-${style}-${trim}.webp`, width: 800, height: 270 };
  }
  const image = trim === 'turbo_gt' ? 'turbo-gt' : trim === 'gts' ? `${body}-gts` : trim.startsWith('turbo') ? `${body}-turbo` : body;
  return { src: `/vehicle-selector/vehicle-selector-cayenne-${image}.webp`, width: 794, height: 270 };
}

export function cayenneName(fit: string, body?: CayenneBody) {
  const generation = fit.slice(0, 4).toUpperCase().replace('_', '.');
  const trim = fit.slice(5);
  const style = cayenneBodies.find(item => item.key === body);
  return `Cayenne ${generation}${trim === 'cayenne' ? '' : ` ${trims[trim]}`}${style && trim !== 'turbo_gt' ? ` · ${style.name}` : ''}`;
}

export function cayenneOptions(products: Pick<CatalogProduct, 'handle' | 'tags'>[]): VehicleGeneration[] {
  return generations.map(generation => {
    const choices = generation.trims.map(trim => {
      const fit = `${generation.key}_${trim}`;
      return { trim, fit, products: products.filter(product => product.tags.includes(`fit_${fit}`)) };
    }).filter(item => item.products.length);

    const bodies = [...cayenneBodies, { key: 'coupe' as const, name: 'Turbo GT' }].flatMap(body => {
      const options = choices.filter(({ trim }) => (trim === 'turbo_gt') === (body.name === 'Turbo GT')).map(({ fit, trim, products }) => ({
        fit,
        name: trims[trim],
        count: products.filter(product => cayenneBodyMatch(product, fit, body.key) === 'allowed').length,
        image: cayenneImage(fit, body.key),
      }));
      return options.length ? [{ ...body, choices: options }] : [];
    });

    return { key: generation.key, name: generation.name, bodies };
  });
}
