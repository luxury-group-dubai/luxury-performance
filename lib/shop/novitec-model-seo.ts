import type { ShopRouteFilters } from './routes';

export const purosangueShopCopy = {
  make: 'ferrari', model: 'purosangue',
  title: 'NOVITEC Ferrari Purosangue Parts Dubai',
  description: 'Shop NOVITEC Ferrari Purosangue parts in Dubai: exhaust systems, carbon bodywork, forged wheels and suspension. Check finishes, fitment and availability.',
  introduction: 'NOVITEC exhausts, carbon bodywork, forged wheels and suspension for your Ferrari Purosangue. Supplied from Dubai, with help choosing the right parts.',
  heading: 'Choose your Purosangue specification.',
  range: 'Compare exhaust configurations, wheel designs and carbon components in the catalogue above. The Purosangue range includes both individual upgrades and ESTESO components. Read each listing for the supplied parts, material and finish; an individual component should not be assumed to include a complete conversion.',
  fitment: 'Some parts are intended for the ESTESO widebody specification rather than the standard body. Match bodywork, wheel and spacer requirements before combining components. For exhausts, check the listed valve-control configuration and any required supporting modules against your car and the system you are ordering.',
  ordering: 'Prices and available finishes are shown on each product page. Stock and supplier-order status can vary by configuration. Share your vehicle details and the part numbers you are considering with our Dubai team to confirm compatibility, delivery estimates and installation options before ordering.',
};

export function novitecModelShopCopy(scope: ShopRouteFilters) {
  return scope.brand === 'novitec' && scope.make === purosangueShopCopy.make && scope.model === purosangueShopCopy.model ? purosangueShopCopy : undefined;
}

export function novitecModelShopMetadata(scope: ShopRouteFilters, query: Record<string, unknown>, live: boolean) {
  const copy = novitecModelShopCopy(scope);
  if (!copy) return;
  const canonical = `/shop/novitec/${copy.make}/${copy.model}`;
  const filtered = !!scope.body || ['q', 'category', 'sort', 'choose', 'fit', 'generation', 'view', 'stock_group', 'show', 'page'].some(key => Array.isArray(query[key]) ? query[key].some(Boolean) : Boolean(query[key]));
  return {
    title: copy.title, description: copy.description,
    alternates: { canonical }, robots: { index: live && !filtered, follow: true },
    openGraph: { title: copy.title, description: copy.description, url: canonical },
  };
}
