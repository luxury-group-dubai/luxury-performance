import type { ShopRouteFilters } from './routes';

const models = {
  '911': {
    title: 'TECHART Porsche 911 Dubai — Body Kits, Wheels & Exhausts',
    description: 'Shop TECHART Porsche 911 parts in Dubai. Select your generation, body style and trim for carbon fibre, body kits, wheels, exhausts and suspension.',
    heading: 'Porsche 911 parts.',
    introduction: 'Choose your 911 generation, body style and trim to explore TECHART bodywork, carbon fibre parts, wheels, exhausts and suspension. Luxury Performance in Dubai can help confirm the specification before you order.',
    rangeHeading: 'Build around your 911.',
    range: 'Start with an individual carbon detail or plan upgrades across aerodynamics, wheels, exhaust and suspension. The available TECHART range depends on your 911 generation and trim. Select the exact car above to see the listed parts and their prices.',
    fitment: 'Match the generation, body style and trim to your car. Carrera, Turbo, GT3, GT3 RS and S/T parts should not be assumed interchangeable, even within the same generation. Check the product notes and any factory equipment requirements. Parts in the fitment confirmation group need a further compatibility check before ordering.',
  },
  cayenne: {
    title: 'TECHART Porsche Cayenne Dubai — Body Kits & Wheels',
    description: 'Explore TECHART Porsche Cayenne parts in Dubai. Choose your generation, SUV or Coupé and trim for bodywork, wheels, exhausts and suspension upgrades.',
    heading: 'Porsche Cayenne parts.',
    introduction: 'Find TECHART upgrades for your Porsche Cayenne with specification support from our Dubai team. Choose the generation, SUV or Coupé body style and trim to explore the parts listed for your car.',
    rangeHeading: 'A specification for your Cayenne.',
    range: 'Explore TECHART bodywork, wheel, exhaust and suspension options for your selected Cayenne. You can start with one component or discuss a wider specification with our team. Availability varies by generation, body style and trim; use the vehicle selector to narrow the range.',
    fitment: 'Confirm the model year, generation and SUV or Coupé body style before choosing parts. A facelift, hybrid powertrain or different factory equipment can change fitting requirements. Check each product listing and ask our team to review compatibility where a part is marked for fitment confirmation.',
  },
};

const brand = {
  title: 'TECHART Porsche Parts Dubai — Body Kits, Wheels & Upgrades',
  description: 'Shop TECHART Porsche parts in Dubai. Choose your 911 or Cayenne for body kits, carbon fibre, wheels, exhausts, suspension and interior upgrades.',
  heading: 'Porsche parts.',
  introduction: 'Start with your Porsche 911 or Cayenne, then select its generation, body style and trim. Explore TECHART upgrades with help checking fitment, finishes and availability from Luxury Performance in Dubai.',
  rangeHeading: 'Choose the parts around your Porsche.',
  range: 'Browse TECHART aerodynamic components, carbon fibre details, wheels, exhausts, suspension, performance and interior parts. The catalogue is organised around your car so you can explore the relevant range before opening individual product specifications.',
  fitment: 'Choose your exact model, generation, body style and trim before ordering. Shared model names do not guarantee that parts fit every version. Check part numbers and factory equipment requirements against your exact car.',
};

export function techartShopCopy(model?: string) {
  return model === '911' || model === 'cayenne' ? models[model] : brand;
}

// The broad model pages are search destinations. Temporary trim, category and
// sorting selections remain usable, with their canonical pointing to that model.
export function techartShopMetadata(scope: ShopRouteFilters, query: Record<string, unknown>, live: boolean) {
  const copy = techartShopCopy(scope.model);
  const canonical = `/shop/techart${scope.model ? `/porsche/${scope.model}` : ''}`;
  const selectionKeys = ['q', 'category', 'sort', 'choose', 'fit', 'generation', 'view', 'stock_group', 'show', 'page'];
  const selection = !!scope.body || (!!scope.make && !scope.model) || selectionKeys.some(key => Boolean(query[key]));
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical },
    robots: { index: live && !selection, follow: true },
    openGraph: { title: copy.title, description: copy.description, url: canonical },
  };
}
