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
};
