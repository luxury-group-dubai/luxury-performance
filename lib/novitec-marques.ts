export type NovitecMarqueContent = {
  title: string;
  description: string;
  heading: string;
  introduction: string;
  rangeHeading: string;
  range: string;
  fitment: string;
  advice: string;
};

export const novitecMarqueContent: Record<string, NovitecMarqueContent> = {
  ferrari: {
    title: 'NOVITEC Ferrari Dubai — Carbon, Exhausts & Wheels',
    description: 'Explore NOVITEC Ferrari body kits, carbon fibre parts, exhausts, forged wheels and suspension. Choose your model with fitment support from our Dubai team.',
    heading: 'NOVITEC Ferrari in Dubai.',
    introduction: 'Explore NOVITEC upgrades for your Ferrari, from carbon fibre bodywork and exhaust systems to forged wheels and suspension. Choose your model below to find the available parts, with fitment and specification support from Luxury Performance in Dubai.',
    rangeHeading: 'A specification for your Ferrari.',
    range: 'Start with the change you want to make: a carbon front lip, a different exhaust note, forged wheels or a more complete aerodynamic package. The NOVITEC range varies by Ferrari model, and individual components can be explored alongside wider programmes such as N-LARGO and ESTESO where offered.',
    fitment: 'Confirm the model, year and body style before ordering. A Spider and a Coupé can require different components, and an 812 GTS should not be treated as interchangeable with an 812 Superfast. Use the model pages to narrow the range, then check the product specification against your car.',
    advice: 'Our Dubai team can help check part numbers, finishes and compatibility, discuss installation options, and confirm availability and delivery estimates before you commit to a specification. Tell us which Ferrari you drive and whether you are planning one upgrade or a complete build.',
  },
  lamborghini: {
    title: 'NOVITEC Lamborghini Dubai — Body Kits, Exhausts & Wheels',
    description: 'Discover NOVITEC Lamborghini carbon fibre body kits, exhausts, forged wheels and suspension. Select your model with fitment support in Dubai.',
    heading: 'NOVITEC Lamborghini in Dubai.',
    introduction: 'Find NOVITEC carbon fibre bodywork, exhaust systems, forged wheels and suspension options for your Lamborghini. Select your model to explore the available upgrades, with help choosing a compatible specification from our Dubai team.',
    rangeHeading: 'Built around your Lamborghini.',
    range: 'Explore individual carbon details or plan a wider specification across aerodynamics, wheels, exhaust and suspension. NOVITEC programmes differ between Lamborghini models: the Revuelto has its own refinement range, while selected Urus versions have ESTESO widebody options.',
    fitment: 'The exact version matters. Urus, Urus S, Urus Performante and Urus SE should not be assumed to share every part. Choose the correct model and version in the catalogue, then confirm the model year, original equipment and fitting requirements on the product page.',
    advice: 'Luxury Performance in Dubai can help confirm the relevant part numbers, finishes, availability and delivery estimates, and discuss installation options. Share your Lamborghini model and the changes you have in mind so our team can help bring the components together.',
  },
  mclaren: {
    title: 'NOVITEC McLaren Dubai — Carbon, Exhausts & Wheels',
    description: 'Explore NOVITEC McLaren carbon fibre parts, exhausts, forged wheels and suspension. Select your model with fitment support from Luxury Performance in Dubai.',
    heading: 'NOVITEC McLaren in Dubai.',
    introduction: 'Explore NOVITEC upgrades for your McLaren, from carbon fibre details and exhaust systems to forged wheels and suspension. Select your model below to see the available parts, with specification and fitment support from Luxury Performance in Dubai.',
    rangeHeading: 'A specification for your McLaren.',
    range: 'Choose a focused upgrade or bring several components together in one specification. Start with your McLaren model to explore the listed aerodynamic parts, exhaust options, wheels and suspension components. The available range differs between models, so use the individual product details to guide your selection.',
    fitment: 'Confirm your model, model year and body style before ordering. Parts for different McLaren models should not be assumed interchangeable, and Coupé and Spider versions may have different requirements. Check each part number and any original equipment requirements against your car.',
    advice: 'Our Dubai team can help check compatibility, finishes and part numbers, confirm availability and delivery estimates, and discuss installation options. Share your McLaren model and the changes you want to make so we can help you choose a suitable combination.',
  },
  'rolls-royce': {
    title: 'NOVITEC Rolls-Royce Dubai — Carbon, Wheels & Upgrades',
    description: 'Discover NOVITEC Rolls-Royce upgrades in Dubai. Explore parts by model and confirm carbon fibre, wheel and suspension fitment with Luxury Performance.',
    heading: 'NOVITEC Rolls-Royce in Dubai.',
    introduction: 'Find NOVITEC upgrades for your Rolls-Royce with help choosing a compatible specification from our Dubai team. Select your model below to explore the available carbon fibre bodywork, wheel and suspension options.',
    rangeHeading: 'Refine your Rolls-Royce.',
    range: 'Begin with your model and choose the details that suit your car, from individual carbon components to a coordinated wheel and bodywork specification. Explore the listed range for your Rolls-Royce rather than assuming that every upgrade is available across all models.',
    fitment: 'Confirm the exact model, generation, model year and original specification before ordering. Cullinan and Cullinan Series II should not be treated as interchangeable, and Spectre requires its own model-specific parts. Check dimensions, part numbers and fitting requirements on each product page.',
    advice: 'Luxury Performance in Dubai can help review your proposed specification, check finishes and compatibility, and confirm availability and delivery estimates. Tell us which Rolls-Royce you drive and the changes you have in mind, and our team can discuss the parts and installation options with you.',
  },
};
