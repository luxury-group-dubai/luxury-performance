import type { ShopRouteFilters } from './routes';
import { normalizeNovitecFilters, novitecVariantFamilies } from './novitec-variants';
import { novitecModelName } from './novitec-models';

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


type ModelProfile = { make: string; marque: string; range: string; fitment: string; fitmentHeading: string; parts?: string };
const profiles: Record<string, ModelProfile> = {
  purosangue: { make:'ferrari', marque:'Ferrari', range:purosangueShopCopy.range, fitment:purosangueShopCopy.fitment, fitmentHeading:'Standard body or ESTESO?' },
  '12cilindri': { make:'ferrari', marque:'Ferrari', range:'Explore the NOVITEC programme for the 12Cilindri Coupé and Spider. Choose your body style to compare the listed exhaust, wheel, suspension and aerodynamic components. The separate N-LARGO project has its own conversion enquiry; a component in this catalogue does not represent a complete N-LARGO allocation.', fitment:'Select Coupé or Spider before ordering. Body panels, rear spoilers and roof-related components can differ between the two cars; shared listings still need to specify compatibility with your version.', fitmentHeading:'Coupé or Spider?' },
  f8: { make:'ferrari', marque:'Ferrari', range:'Build your F8 specification from the NOVITEC exhaust, wheel, suspension and carbon bodywork catalogue. Start with Tributo or Spider, then compare the finishes and supplied components on each listing. Individual aerodynamic details and wheel sets can be ordered without treating them as a complete conversion.', fitment:'Match F8 Tributo and F8 Spider components to the correct body style. Rear bodywork and roof-area parts should not be assumed interchangeable. Check the exhaust configuration and any supporting modules in the product notes.', fitmentHeading:'Tributo and Spider fitment.' },
  '812': { make:'ferrari', marque:'Ferrari', range:'Explore NOVITEC upgrades for the 812 Superfast and 812 GTS, from exhaust configurations to forged wheels, suspension and carbon details. Select your version before comparing the catalogue. Review each product for its finish and included components when planning a combined specification.', fitment:'The 812 Superfast and open-roof 812 GTS have different bodywork requirements. Confirm the version for rear aerodynamic parts and roof-related components, and check the stated wheel, spacer and suspension requirements together.', fitmentHeading:'Superfast or GTS?' },
  sf90: { make:'ferrari', marque:'Ferrari', range:'Choose SF90 Stradale or Spider to explore the NOVITEC exhaust, wheel, suspension and aerodynamic programme. Compare individual carbon details and complete listed assemblies, checking the supplied components and finish options on the product page.', fitment:'Select the correct SF90 body style. Stradale and Spider rear panels and roof-area components can have different requirements. Check the exact application of exhaust components and control modules rather than assuming all SF90 listings are shared.', fitmentHeading:'Stradale and Spider specifications.' },
  revuelto: { make:'lamborghini', marque:'Lamborghini', range:'Explore the NOVITEC Revuelto catalogue across exhausts, forged wheels, suspension and carbon aerodynamic components. Compare the finishes and configurations listed for each part to plan an individual detail or a coordinated specification for your Lamborghini.', fitment:'Use the Revuelto application and part number on each listing. Its exhaust configurations and supporting modules need to be checked as a system. Confirm the listed wheel specification and any associated suspension or bodywork requirements before ordering.', fitmentHeading:'Match the Revuelto application.' },
  urus: { make:'lamborghini', marque:'Lamborghini', range:'Choose the original Urus, Urus S or Urus Performante to explore the matching NOVITEC catalogue. Compare exhaust options, forged wheels, suspension and bodywork within that selection. Standard-body and widebody-related components need to be planned around the same specification.', fitment:'Original Urus, Urus S and Urus Performante selections are separate. Check bumper and bodywork applications and any widebody-specific wheel or spacer requirements. This selector does not establish compatibility with Urus SE; ask our team about that model separately.', fitmentHeading:'Choose the correct Urus version.' },
  cullinan: { make:'rolls_royce', marque:'Rolls-Royce', range:'Explore the NOVITEC programme for the Rolls-Royce Cullinan, with separate selections for Series I and Series II. Compare the listed wheel designs, suspension components, exhaust options and bodywork details against the finish and supplied-parts information on each product.', fitment:'Select Series I or Series II before choosing parts. A bodywork or exhaust listing for one series should not be treated as approval for the other. Confirm the wheel dimensions and associated fitting requirements for your vehicle.', fitmentHeading:'Series I and Series II.' },
  spectre: { make:'rolls_royce', marque:'Rolls-Royce', parts:'forged wheels, suspension and carbon bodywork', range:'Explore NOVITEC forged wheels, suspension and aerodynamic components for the Rolls-Royce Spectre. This electric-car catalogue focuses on stance and exterior details. Compare the wheel designs, finishes and bodywork components listed for the Spectre.', fitment:'Check Spectre-specific applications when selecting wheels, suspension and bodywork. Components from other Rolls-Royce models should not be assumed compatible. Review the stated wheel dimensions and any fitting requirements together.', fitmentHeading:'Spectre-specific components.' },
  '750s': { make:'mclaren', marque:'McLaren', range:'Compare NOVITEC exhausts, forged wheels, suspension and carbon aerodynamic components for the McLaren 750S. Review the exact product application and finish options when choosing individual details or planning several upgrades together.', fitment:'Confirm the Coupé or Spider application in each listing even where the shop groups parts under 750S. Shared styling or a reference to another McLaren model is not enough to establish compatibility. Check the part number, exhaust configuration and bodywork requirements.', fitmentHeading:'Check the 750S body style.' },
  senna: { make:'mclaren', marque:'McLaren', parts:'exhaust components and forged wheels', range:'Explore the listed NOVITEC exhaust components and forged wheels for the McLaren Senna. Compare the available configurations, wheel designs and finishes on their product pages. The catalogue reflects the parts currently listed, rather than a complete bodywork or suspension programme.', fitment:'Use the Senna-specific application and part number on each listing. Confirm the supplied exhaust components and wheel specification, including any fitting requirements, before combining them with existing upgrades.', fitmentHeading:'Confirm the Senna specification.' },
};
const versionNotes: Record<string, string> = {
  '12cilindri/coupe':'This selection is for the 12Cilindri Coupé. Check Coupé-specific rear spoilers and bodywork; Spider compatibility must be stated separately.',
  '12cilindri/spider':'This selection is for the 12Cilindri Spider. Check Spider-specific bodywork and roof-area clearances; a Coupé-only rear spoiler is not a Spider fitment.',
  'f8/tributo':'This selection is for the fixed-roof F8 Tributo. Choose Tributo-specific rear and roof-area components, and check each listing before combining parts with a Spider-derived specification.',
  'f8/spider':'This selection is for the F8 Spider. Match rear bodywork and roof-area components to the open-roof version; Tributo-only parts need separate compatibility confirmation.',
  '812/superfast':'This selection is for the 812 Superfast. Confirm Superfast-specific aerodynamic and rear bodywork applications rather than assuming an 812 GTS listing is interchangeable.',
  '812/gts':'This selection is for the open-roof 812 GTS. Check GTS-specific rear bodywork and roof-area parts; compatibility with the Superfast does not establish GTS fitment.',
  'sf90/stradale':'This selection is for the SF90 Stradale. Match rear panels and aerodynamic components to its body style, and review the stated exhaust and module configuration.',
  'sf90/spider':'This selection is for the SF90 Spider. Review Spider-specific rear and roof-area applications and confirm the exhaust configuration and required modules on each listing.',
  'urus/original':'This selection is for the original Urus. Check original-model bumper and bodywork applications, and confirm any widebody-specific wheel or spacer requirements.',
  'urus/s':'This selection is for the Urus S. Confirm S-specific bumper and bodywork applications; original Urus, Performante and SE fitment must not be inferred from the model family alone.',
  'urus/performante':'This selection is for the Urus Performante. Check Performante-specific bodywork and wheel or spacer requirements; a listing for Urus S or the original Urus does not establish compatibility.',
  'cullinan/series_i':'This selection is for the Cullinan Series I. Check Series I bodywork and exhaust applications and the listed wheel dimensions; Series II compatibility must be stated separately.',
  'cullinan/series_ii':'This selection is for the Cullinan Series II. Match bodywork and exhaust parts to the updated series, and check the listed wheel and fitting requirements rather than assuming Series I compatibility.',
};

export function novitecModelShopCopy(input: ShopRouteFilters) {
  const scope = normalizeNovitecFilters(input);
  const profile = profiles[scope.model || ''];
  if (scope.brand !== 'novitec' || !profile || profile.make !== scope.make) return;
  const variants = novitecVariantFamilies[profile.make]?.[scope.model!];
  const version = scope.body ? variants?.find(item => item.key === scope.body) : undefined;
  if (scope.body && !version) return;
  const name = version ? scope.model === 'urus' && scope.body === 'original' ? 'Urus Original' : scope.model === 'cullinan' && scope.body === 'series_i' ? 'Cullinan Series I' : version.name : novitecModelName(scope.model!);
  const vehicle = `${profile.marque} ${name}`;
  const parts = profile.parts || 'exhausts, carbon bodywork, forged wheels and suspension';
  return {
    make:profile.make, model:scope.model!, body:scope.body, marque:profile.marque, name,
    title:`NOVITEC ${vehicle} Parts Dubai`,
    description:`Shop NOVITEC ${vehicle} parts in Dubai. Explore ${parts}, with help checking fitment, finishes and availability.`,
    introduction:`NOVITEC ${parts} for your ${vehicle}. Supplied from Dubai, with help choosing the right parts.`,
    heading:`Choose your ${name} specification.`,
    range:version ? `Browse the NOVITEC ${vehicle} catalogue above. ${profile.range}` : profile.range,
    fitmentHeading:profile.fitmentHeading,
    fitment:versionNotes[`${scope.model}/${scope.body}`] || profile.fitment,
    ordering:purosangueShopCopy.ordering,
  };
}

export function novitecModelShopMetadata(scope: ShopRouteFilters, query: Record<string, unknown>, live: boolean) {
  const copy = novitecModelShopCopy(scope);
  if (!copy) return;
  const canonical = `/shop/novitec/${copy.make.replaceAll('_','-')}/${copy.model}${copy.body ? `/${copy.body.replaceAll('_','-')}` : ''}`;
  const filtered = ['q', 'category', 'sort', 'choose', 'fit', 'generation', 'view', 'stock_group', 'show', 'page'].some(key => Array.isArray(query[key]) ? query[key].some(Boolean) : Boolean(query[key]));
  return {
    title:copy.title, description:copy.description,
    alternates:{canonical}, robots:{index:live && !filtered,follow:true},
    openGraph:{title:copy.title,description:copy.description,url:canonical},
  };
}
