import type { Variant } from './types';

type OptionVariant = Pick<Variant, 'id' | 'selectedOptions' | 'availableForSale'>;
export function productOptionFields(variants: OptionVariant[]) {
  const names = [...new Set(variants.flatMap(variant => variant.selectedOptions.map(option => option.name)))];
  const order = (name: string) => /^(application|vehicle|vehicle version|fitment)$/i.test(name) ? 0
    : /^(configuration|system type|system design)$/i.test(name) ? 1 : /^material$/i.test(name) ? 2 : 3;
  return names.filter(name => variants.every(variant => variant.selectedOptions.some(option => option.name === name))
    && new Set(variants.map(variant => optionValue(variant, name))).size > 1).sort((a, b) => order(a) - order(b));
}
function optionValue(variant: OptionVariant, name: string) {
  return variant.selectedOptions.find(option => option.name === name)?.value;
}
export function productOptionChoices(variants: OptionVariant[], selected: OptionVariant, fields: string[], index: number) {
  const matching = variants.filter(variant => fields.slice(0, index).every(name => optionValue(variant, name) === optionValue(selected, name)));
  return [...new Set(matching.map(variant => optionValue(variant, fields[index])).filter((value): value is string => !!value))]
    .map(value => ({ value, available: matching.some(variant => optionValue(variant, fields[index]) === value && variant.availableForSale) }));
}
// Preserve the earlier choices. Retain as many later choices as possible,
// while always returning an actual Shopify variant, including sold-out variants.
export function selectProductOption(variants: OptionVariant[], selected: OptionVariant, fields: string[], index: number, value: string) {
  const candidates = variants.filter(variant => optionValue(variant, fields[index]) === value
    && fields.slice(0, index).every(name => optionValue(variant, name) === optionValue(selected, name)));
  const score = (variant: OptionVariant) => fields.slice(index + 1).reduce((total, name) => total + (optionValue(variant, name) === optionValue(selected, name) ? 2 : 0), variant.availableForSale ? 1 : 0);
  return candidates.sort((a, b) => score(b) - score(a))[0];
}
export function productOptionLabel(name: string, exhaust: boolean) {
  if (/^(application|vehicle|vehicle version|fitment)$/i.test(name)) return 'Vehicle version';
  if (exhaust && /^(configuration|system type|system design)$/i.test(name)) return 'Exhaust configuration';
  return name;
}
