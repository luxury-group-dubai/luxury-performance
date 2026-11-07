import bodyFitment from './techart-body-fitment.json';
import { isCayenneBody, isCayenneFit } from './techart-cayenne';
import { cayenneBodyMatch, type CayenneBody } from './techart-cayenne-body-fitment';
import { targaFitKeys, type Filters } from './taxonomy';
import type { CatalogProduct } from './types';

export const bodyStyles = [{ key: 'coupe', name: 'Coupé' }, { key: 'cabriolet', name: 'Cabriolet' }, { key: 'targa', name: 'Targa' }] as const;
export type BodyStyle = typeof bodyStyles[number]['key'];
export const generations = ['991.1', '991.2', '992.1', '992.2'];
export const vehicleNames: Record<string, string> = {
  carrera: 'Carrera', carrera_4: 'Carrera 4', carrera_t: 'Carrera T', carrera_s: 'Carrera S', carrera_4s: 'Carrera 4S', carrera_gts: 'Carrera GTS',
  carrera_4_gts: 'Carrera 4 GTS', carrera_targa_gts: 'Targa GTS', turbo: 'Turbo', turbo_s: 'Turbo S', gt3_gt3_touring: 'GT3 / GT3 Touring',
  gt3_with_wing: 'GT3 with rear wing', gt3_rs: 'GT3 RS', gt3_rs_st: 'GT3 RS / 911 S/T', dakar: 'Dakar',
};
const factoryCarreraAndTurbo = ['carrera', 'carrera_t', 'carrera_s', 'carrera_4s', 'carrera_gts', 'carrera_4_gts', 'turbo_s'];
const factory9922Profiles: Record<BodyStyle, readonly string[]> = {
  coupe: [...factoryCarreraAndTurbo, 'gt3_gt3_touring', 'gt3_with_wing'],
  cabriolet: factoryCarreraAndTurbo,
  targa: ['carrera_4s', 'carrera_4_gts'],
};
type BodyRecord = { allowed: string[]; excluded: string[] };
const records: Record<string, Record<string, BodyRecord>> = bodyFitment;

export function isBodyStyle(value?: string): value is BodyStyle { return bodyStyles.some(body => body.key === value); }
export function is911Fit(fit?: string): fit is string { return !!fit && /^99[12]_[12]_/.test(fit) && !!vehicleNames[fit.slice(6)]; }
export function supportsBody(fit: string, body: BodyStyle) {
  const trim = fit.slice(6);
  if (/^gt3|^dakar$/.test(trim)) return body === 'coupe';
  if (trim === 'carrera_targa_gts') return body === 'targa';
  if (body !== 'targa') return true;
  if (trim === 'carrera_4') return !fit.startsWith('992_2_');
  return trim === 'carrera_4s' || trim === 'carrera_4_gts';
}
export function bodyMatch(product: Pick<CatalogProduct, 'handle'>, fit: string, body: BodyStyle) {
  if (!supportsBody(fit, body)) return 'excluded';
  const entries = targaFitKeys(fit, body).map(key => records[product.handle]?.[`fit_${key}`]);
  const allowed = entries.some(entry => entry?.allowed.includes(body));
  const excluded = entries.some(entry => entry?.excluded.includes(body));
  return allowed === excluded ? 'review' : allowed ? 'allowed' : 'excluded';
}
export function techartSelection({ brand, model, fit, body }: Filters) {
  if (brand !== 'techart') return undefined;
  if (model === '911' && is911Fit(fit)) return { model, fit, body: isBodyStyle(body) ? body : undefined } as const;
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
  const factoryTrim = style === 'targa' && trim === 'carrera_targa_gts' ? 'carrera_4_gts' : trim;
  if (fit === '992_1_gt3_rs' && style === 'coupe') {
    return { src: '/vehicle-selector/porsche/911-9921-coupe-gt3_rs.webp', width: 800, height: 270 };
  }
  if (fit.startsWith('992_2_') && factory9922Profiles[style].includes(factoryTrim)) {
    return { src: `/vehicle-selector/porsche/911-${style}-${factoryTrim}.webp`, width: 800, height: 270 };
  }
  const family = /^turbo/.test(trim) ? 'turbo' : /^gt3/.test(trim) ? 'gt3' : /gts/.test(trim) ? 'gts' : 'carrera';
  const image = style === 'coupe' ? family : `${family === 'turbo' ? 'turbo' : family === 'gts' ? 'gts' : 'carrera'}-${style}`;
  return { src: `/vehicle-selector/vehicle-selector-${image}.png`, width: 500, height: 180 };
}
function trimName(trim: string, body?: BodyStyle) {
  if (trim === 'carrera_targa_gts') return 'Targa 4 GTS';
  const name = vehicleNames[trim] || '';
  return body === 'targa' ? name.replace(/^Carrera /, 'Targa ') : name;
}
export function vehicleName(fit: string, body?: BodyStyle) {
  const bodyLabel = body && body !== 'targa' ? ` · ${bodyStyles.find(item => item.key === body)!.name}` : '';
  return `911 ${fit.slice(0, 5).replace('_', '.')} ${trimName(fit.slice(6), body)}${bodyLabel}`.trim();
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
        if (trim === 'carrera_targa_gts' || !supportsBody(fit, body.key)) return [];
        const fitTags = targaFitKeys(fit, body.key).map(value => `fit_${value}`);
        const matches = products.filter(product => fitTags.some(tag => product.tags.includes(tag)));
        return matches.length ? [{
          fit,
          name: trimName(trim, body.key),
          count: matches.filter(product => bodyMatch(product, fit, body.key) === 'allowed').length,
          image: vehicleImage(fit, body.key),
        }] : [];
      });
      return choices.length ? [{ ...body, choices }] : [];
    });
    return { key, name: generation, bodies };
  });
}
