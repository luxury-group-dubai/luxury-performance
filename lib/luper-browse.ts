import type { CatalogProduct } from './shop/types';
import type { LuperCard } from './luper-shopping';
import { luperVehicleIndex, vehicleMakeAliases, vehicleQuery } from './luper-vehicle-index';

const contains = (text: string, term: string) => ` ${text} `.includes(` ${term} `);

/** Match the actual shop destinations, including display names and version aliases. */
export function luperBrowseCards(products: CatalogProduct[], text: string, brand?: string, exact = false): LuperCard[] {
  const query = vehicleQuery(text);
  const { destinations } = luperVehicleIndex(products);
  const mentionedMakes = new Set(destinations.filter(item => vehicleMakeAliases(item.make).some(alias => contains(query, alias))).map(item => item.make));
  const matches = destinations.filter(item => item.brand === brand && (!mentionedMakes.size || mentionedMakes.has(item.make)))
    .map(item => ({ item, exact: item.phrases.includes(query), specificity: Math.max(0, ...item.aliases.filter(alias => contains(query, alias)).map(alias => alias.length)) }))
    .filter(match => exact ? match.exact : match.specificity > 0)
    .sort((a, b) => Number(b.exact) - Number(a.exact) || b.specificity - a.specificity);
  const narrowed = matches.filter(match => !matches.some(other => other.item.href.startsWith(`${match.item.href}/`)
    && (!match.exact || other.exact)));
  const cards = narrowed.map(({ item }): LuperCard => ({ id: `shop:browse:${item.href.slice(6)}`, kind: 'shop',
    title: item.title, href: item.href,
    subtitle: brand ? 'Browse available parts for this vehicle' : 'Browse all available brands for this vehicle' }));
  return [...new Map(cards.map(card => [card.href, card])).values()].slice(0, 3);
}
