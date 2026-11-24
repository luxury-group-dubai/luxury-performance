import type { ShopRouteFilters } from './routes';

const models = {
  '911': {
    title: 'TECHART Porsche 911 Dubai — Body Kits, Wheels & Exhausts',
    description: 'Shop TECHART Porsche 911 parts in Dubai. Select your generation, variant and body style for carbon fibre, body kits, wheels, exhausts and suspension.',
  },
  cayenne: {
    title: 'TECHART Porsche Cayenne Dubai — Body Kits & Wheels',
    description: 'Explore TECHART Porsche Cayenne parts in Dubai. Choose your generation, variant and SUV or Coupé body style for bodywork, wheels, exhausts and suspension upgrades.',
  },
};

const brand = {
  title: 'TECHART Porsche Parts Dubai — Body Kits, Wheels & Upgrades',
  description: 'Shop TECHART Porsche parts in Dubai. Choose your 911 or Cayenne for body kits, carbon fibre, wheels, exhausts, suspension and interior upgrades.',
};

// The broad model pages are search destinations. Temporary trim, category and
// sorting selections remain usable, with their canonical pointing to that model.
export function techartShopMetadata(scope: ShopRouteFilters, query: Record<string, unknown>, live: boolean) {
  const copy = scope.model === '911' || scope.model === 'cayenne' ? models[scope.model] : brand;
  const canonical = `/shop/techart${scope.model ? `/porsche/${scope.model}` : ''}`;
  const selectionKeys = ['q', 'category', 'sort', 'choose', 'fit', 'generation', 'view', 'stock_group', 'show', 'page'];
  const selection = !!scope.generation || !!scope.fit || !!scope.body || (!!scope.make && !scope.model) || selectionKeys.some(key => Boolean(query[key]));
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical },
    robots: { index: live && !selection, follow: true },
    openGraph: { title: copy.title, description: copy.description, url: canonical },
  };
}
