import type { Filters } from './shop/taxonomy';

export const techartRange = [
  {
    id: 'aerodynamics', label: 'Aerodynamics', title: 'Aerodynamics & styling',
    description: 'Front splitters, rear spoilers and exterior details. Give your Porsche a different presence.',
    image: 'aerodynamics', alt: 'TECHART rear spoiler and aerodynamic details on a blue Porsche 911',
    filters: { category: 'Aerodynamics' },
  },
  {
    id: 'wheels', label: 'Wheels', title: 'Wheels',
    description: 'Explore TECHART wheel designs and the components that complete the fit.',
    image: 'wheels', alt: 'Detail of a red TECHART alloy wheel',
    filters: { category: 'Wheels' },
  },
  {
    id: 'carbon', label: 'Carbon', title: 'Carbon fibre',
    description: 'Carbon exterior and interior details, from mirror trims to complete interior kits.',
    image: 'carbon', alt: 'The exposed weave of TECHART carbon fibre bodywork',
    filters: { q: 'carbon' },
  },
  {
    id: 'interior', label: 'Interior', title: 'Interior refinement',
    description: 'Trim, upholstery details and finishing pieces for a more personal cabin.',
    image: 'interior', alt: 'TECHART leather interior with contrasting colours and perforated upholstery',
    filters: { category: 'Interior' },
  },
  {
    id: 'performance', label: 'Performance', title: 'Power & performance',
    description: 'TECHTRONIC upgrades, power kits and performance components for your Porsche.',
    image: 'powerkits', alt: 'TECHART Powerkit engine cover and carbon fibre details',
    filters: { category: 'Performance' },
  },
  {
    id: 'exhaust', label: 'Exhaust', title: 'Exhaust systems',
    description: 'Sport exhausts, tailpipes and valve controls. Find the sound that suits your Porsche.',
    image: 'exhaust', alt: 'Close-up of TECHART sport exhaust tailpipes',
    filters: { category: 'Exhaust' },
  },
  {
    id: 'suspension', label: 'Suspension', title: 'Chassis & suspension',
    description: 'Sport springs, lowering modules and Noselift systems. Refine the stance and the drive.',
    image: 'suspension', alt: 'Yellow Porsche 911 demonstrating the ground clearance of TECHART Noselift',
    filters: { category: 'Suspension' },
  },
] satisfies {
  id: string; label: string; title: string; description: string;
  image: string; alt: string; filters: Filters;
}[];

export type TechartRangeOption = typeof techartRange[number] & { count: number; href: string };
