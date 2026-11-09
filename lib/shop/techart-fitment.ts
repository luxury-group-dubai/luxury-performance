import bodyFitment from './techart-body-fitment.json';
import rsStFitment from './techart-rs-st-fitment.json';
import { isCayenneBody, isCayenneFit } from './techart-cayenne';
import { cayenneBodyMatch, type CayenneBody } from './techart-cayenne-body-fitment';
import { techartFitKeys, type Filters } from './taxonomy';
import type { CatalogProduct } from './types';

export const bodyStyles = [{ key: 'coupe', name: 'Coupé' }, { key: 'cabriolet', name: 'Cabriolet' }, { key: 'targa', name: 'Targa' }] as const;
export type BodyStyle = typeof bodyStyles[number]['key'];
export const generations = ['991.1', '991.2', '992.1', '992.2'];
export const vehicleNames: Record<string, string> = {
  carrera: 'Carrera', carrera_4: 'Carrera 4', carrera_t: 'Carrera T', carrera_s: 'Carrera S', carrera_4s: 'Carrera 4S', carrera_gts: 'Carrera GTS',
  carrera_4_gts: 'Carrera 4 GTS', carrera_targa_gts: 'Targa GTS', turbo: 'Turbo', turbo_s: 'Turbo S',
  // Retain the catalogue fit keys in URLs while showing Porsche's model names.
  gt3_with_wing: 'GT3', gt3_gt3_touring: 'GT3 Touring', gt3_rs: 'GT3 RS', st: 'S/T',
  // Retain the shared catalogue URL for existing links, but not as a vehicle card.
  gt3_rs_st: 'GT3 RS / S/T', dakar: 'Dakar',
};
const factoryCarreraAndTurbo = ['carrera', 'carrera_t', 'carrera_s', 'carrera_4s', 'carrera_gts', 'carrera_4_gts', 'turbo_s'];
const factory9922Profiles: Record<BodyStyle, readonly string[]> = {
  coupe: [...factoryCarreraAndTurbo, 'gt3_with_wing', 'gt3_gt3_touring'],
  cabriolet: factoryCarreraAndTurbo,
  targa: ['carrera_4s', 'carrera_4_gts'],
};
const specialCoupeProfiles: Record<string, string> = { gt3_rs: 'gt3_rs', st: 'st', gt3_rs_st: 'st', dakar: 'dakar' };
type BodyRecord = { allowed: string[]; excluded: string[] };
const records: Record<string, Record<string, BodyRecord>> = bodyFitment;
const rsStRecords: Record<string, Partial<Record<'gt3_rs' | 'st', string>>> = rsStFitment.products;

export function isBodyStyle(value?: string): value is BodyStyle { return bodyStyles.some(body => body.key === value); }
export function is911Fit(fit?: string): fit is string {
  return !!fit && /^99[12]_[12]_/.test(fit) && !!vehicleNames[fit.slice(6)]
    && (fit.slice(6) !== 'st' || fit.startsWith('992_1_'));
}
export function supportsBody(fit: string, body: BodyStyle) {
  const trim = fit.slice(6);
  if (/^gt3|^dakar$|^st$/.test(trim)) return body === 'coupe';
  if (trim === 'carrera_t' && !fit.startsWith('992_2_')) return body === 'coupe';
  if (trim === 'carrera_targa_gts') return body === 'targa';
  if (body !== 'targa') return true;
  if (trim === 'carrera_4') return !fit.startsWith('992_2_');
  return trim === 'carrera_4s' || trim === 'carrera_4_gts';
}
export function is911LineupFit(fit: string, body?: BodyStyle) {
  if (generations.some(generation => generation.replace('.', '_') === fit)) return true;
  if (!is911Fit(fit) || body && !supportsBody(fit, body)) return false;
  // GT3 RS and S/T are separate cars; the manufacturer's shared column is not.
  if (fit.endsWith('_gt3_rs_st')) return false;
  // The 991.1 shared GT3 catalogue key represents its single, fixed-wing GT3.
  if (fit === '991_1_gt3_with_wing') return false;
  if (!fit.startsWith('992_2_')) return true;
  // Shared parts tags also contain older trims. They are not a model lineup.
  // Keep those tags addressable in the shop without creating fictitious 992.2 cards.
  const trim = fit.slice(6);
  const factoryTrim = trim === 'carrera_targa_gts' ? 'carrera_4_gts' : trim;
  return body ? factory9922Profiles[body].includes(factoryTrim)
    : Object.values(factory9922Profiles).some(trims => trims.includes(factoryTrim));
}
export function bodyMatch(product: Pick<CatalogProduct, 'handle'>, fit: string, body: BodyStyle) {
  if (!supportsBody(fit, body)) return 'excluded';
  const rsStTrim = /^992_1_(gt3_rs|st|gt3_rs_st)$/.exec(fit)?.[1];
  // Candidate tags may be shared, but each actual model needs an audited decision.
  // New, unverified shared listings stay in the confirmation group.
  if (rsStTrim === 'gt3_rs_st') {
    const decisions = ['gt3_rs', 'st'].map(trim => rsStRecords[product.handle]?.[trim as 'gt3_rs' | 'st']);
    return decisions.includes('allowed') ? 'allowed' : decisions.every(decision => decision === 'excluded') ? 'excluded' : 'review';
  }
  if (rsStTrim === 'gt3_rs' || rsStTrim === 'st') {
    const decision = rsStRecords[product.handle]?.[rsStTrim];
    return decision === 'allowed' || decision === 'excluded' ? decision : 'review';
  }
  // A shared GT3 tag is insufficient for the winged car: its specific price-list
  // record distinguishes shared hardware from Touring-only or unconfirmed parts.
  const keys = fit.endsWith('_gt3_with_wing') ? [fit] : techartFitKeys(fit, body);
  const entries = keys.map(key => records[product.handle]?.[`fit_${key}`]);
  const allowed = entries.some(entry => entry?.allowed.includes(body));
  const excluded = entries.some(entry => entry?.excluded.includes(body));
  return allowed === excluded ? 'review' : allowed ? 'allowed' : 'excluded';
}
export function techartSelection({ brand, model, fit, body }: Filters) {
  if (brand !== 'techart') return undefined;
  if (model === '911' && is911Fit(fit)) return { model, fit, body: isBodyStyle(body) ? body : /^(?:gt3|st$|dakar$)/.test(fit.slice(6)) ? 'coupe' : undefined } as const;
  if (model === 'cayenne' && isCayenneFit(fit)) return { model, fit, body: isCayenneBody(body) ? body : undefined } as const;
  return undefined;
}
export type TechartSelection = NonNullable<ReturnType<typeof techartSelection>>;

export function vehicleBodyMatch(product: Pick<CatalogProduct, 'handle'>, selection: TechartSelection) {
  if (!selection.body) return 'allowed';
  return selection.model === '911'
    ? bodyMatch(product, selection.fit, selection.body)
    : cayenneBodyMatch(product, selection.fit, selection.body);
}

export function filterBodyProducts<T extends Pick<CatalogProduct, 'handle'>>(products: T[], selection?: TechartSelection): T[] {
  return selection?.body ? products.filter(product => vehicleBodyMatch(product, selection) === 'allowed') : products;
}
export function vehicleImage(fit: string, body?: BodyStyle): VehicleProfile {
  const trim = fit.slice(6);
  const style = body ?? (trim === 'carrera_targa_gts' ? 'targa' : 'coupe');
  // Images illustrate the body and trim family across generations. Fitment uses
  // the original fit key independently of this shared imagery.
  if (trim === 'carrera_4' && style === 'targa') {
    return { src: '/vehicle-selector/porsche/911-9921-targa-carrera_4.webp', width: 800, height: 270 };
  }
  if (style === 'coupe' && Object.hasOwn(specialCoupeProfiles, trim)) {
    return { src: `/vehicle-selector/porsche/911-9921-coupe-${specialCoupeProfiles[trim]}.webp`, width: 800, height: 270 };
  }
  const closestTrim = trim === 'carrera_4' ? 'carrera_4s'
    : trim === 'turbo' ? 'turbo_s'
    : trim === 'gt3_gt3_touring' && fit.startsWith('991_1_') ? 'gt3_with_wing'
    : trim === 'carrera_targa_gts' ? 'carrera_4_gts' : trim;
  const profile = factory9922Profiles[style].includes(closestTrim) ? closestTrim
    : style === 'targa' ? 'carrera_4s' : 'carrera';
  return { src: `/vehicle-selector/porsche/911-${style}-${profile}.webp`, width: 800, height: 270 };
}
function trimName(fit: string, body?: BodyStyle) {
  const trim = fit.slice(6);
  if (trim === 'gt3_gt3_touring' && fit.startsWith('991_1_')) return 'GT3';
  if (trim === 'carrera_targa_gts') return 'Targa 4 GTS';
  const name = vehicleNames[trim] || '';
  return body === 'targa' ? name.replace(/^Carrera /, 'Targa ') : name;
}
export function vehicleName(fit: string, body?: BodyStyle) {
  const bodyLabel = body && body !== 'targa' ? ` · ${bodyStyles.find(item => item.key === body)!.name}` : '';
  return `911 ${fit.slice(0, 5).replace('_', '.')} ${trimName(fit, body)}${bodyLabel}`.trim();
}
export type VehicleProfile = { src: string; width: number; height: number };
export type VehicleChoice = { fit: string; name: string; count: number; image: VehicleProfile };
export type VehicleBody = { key: BodyStyle | CayenneBody; name: string; choices: VehicleChoice[] };
export type VehicleGeneration = { key: string; name: string; bodies: VehicleBody[] };

export function vehicleOptions(products: Pick<CatalogProduct, 'handle' | 'tags'>[]): VehicleGeneration[] {
  return generations.map(generation => {
    const key = generation.replace('.', '_');
    const bodies = bodyStyles.flatMap(body => {
      const choices = Object.keys(vehicleNames).flatMap(trim => {
        const fit = `${key}_${trim}`;
        if (trim === 'carrera_targa_gts' || !is911LineupFit(fit, body.key)) return [];
        const fitTags = techartFitKeys(fit, body.key).map(value => `fit_${value}`);
        const matches = products.filter(product => fitTags.some(tag => product.tags.includes(tag)));
        return matches.length ? [{
          fit,
          name: trimName(fit, body.key),
          count: matches.filter(product => bodyMatch(product, fit, body.key) === 'allowed').length,
          image: vehicleImage(fit, body.key),
        }] : [];
      });
      return choices.length ? [{ ...body, choices }] : [];
    });
    return { key, name: generation, bodies };
  });
}
