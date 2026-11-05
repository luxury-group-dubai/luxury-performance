export type ValvetronicVehicleBrand = { name: string; mark: string; logo: string; make?: string; search?: string; monochrome?: boolean; lightLogo?: string; lightMonochrome?: boolean };

// Available vehicle ranges checked against LXP Forged's Valvetronic collection.
// Title searches also cover the three ranges whose products lack make tags.
export const valvetronicVehicles: readonly ValvetronicVehicleBrand[] = [
  { name: 'Ferrari', mark: 'ferrari', logo: '/brand/navigation/wordmarks/ferrari.svg', make: 'ferrari', monochrome: true },
  { name: 'Lamborghini', mark: 'lamborghini', logo: '/brand/navigation/wordmarks/lamborghini.svg', make: 'lamborghini', monochrome: true },
  { name: 'Porsche', mark: 'porsche', logo: '/brand/navigation/wordmarks/porsche.svg', make: 'porsche', monochrome: true },
  { name: 'BMW', mark: 'bmw', logo: '/brand/navigation/wordmarks/bmw.svg', make: 'bmw' },
  { name: 'Mercedes-AMG', mark: 'mercedes-amg', logo: '/brand/valvetronic-vehicles/mercedes-amg-clean.svg', make: 'mercedes', lightMonochrome: true },
  { name: 'McLaren', mark: 'mclaren', logo: '/brand/navigation/wordmarks/mclaren.svg', make: 'mclaren', lightLogo: '/brand/navigation/wordmarks/mclaren-dark.svg' },
  { name: 'Audi', mark: 'audi', logo: '/brand/navigation/wordmarks/audi.svg', make: 'audi', monochrome: true },
  { name: 'Maserati', mark: 'maserati', logo: '/brand/valvetronic-vehicles/maserati-clean.svg', make: 'maserati', lightMonochrome: true },
  { name: 'Aston Martin', mark: 'aston-martin', logo: '/brand/valvetronic-vehicles/aston-martin-clean.svg', make: 'aston_martin', lightLogo: '/brand/valvetronic-vehicles/aston-martin-dark.svg' },
  { name: 'Lotus', mark: 'lotus', logo: '/brand/valvetronic-vehicles/lotus-clean.svg', search: 'Lotus' },
  { name: 'Nissan', mark: 'nissan', logo: '/brand/valvetronic-vehicles/nissan-clean.svg', make: 'nissan', lightMonochrome: true },
  { name: 'Chevrolet Corvette', mark: 'chevrolet-corvette', logo: '/brand/valvetronic-vehicles/chevrolet-corvette-clean.png', make: 'chevrolet' },
  { name: 'Toyota', mark: 'toyota', logo: '/brand/valvetronic-vehicles/toyota-clean.svg', make: 'toyota' },
  { name: 'Ford', mark: 'ford', logo: '/brand/valvetronic-vehicles/ford-clean.svg', make: 'ford' },
  { name: 'Dodge', mark: 'dodge', logo: '/brand/valvetronic-vehicles/dodge-clean.svg', make: 'dodge', lightLogo: '/brand/valvetronic-vehicles/dodge-dark.svg' },
  { name: 'Range Rover', mark: 'range-rover', logo: '/brand/valvetronic-vehicles/range-rover-clean.svg', search: 'Range Rover', lightMonochrome: true },
  { name: 'Lexus', mark: 'lexus', logo: '/brand/valvetronic-vehicles/lexus-clean.svg', make: 'lexus', lightMonochrome: true },
  { name: 'Honda', mark: 'honda', logo: '/brand/valvetronic-vehicles/honda-clean.svg', make: 'honda', lightMonochrome: true },
  { name: 'Subaru', mark: 'subaru', logo: '/brand/valvetronic-vehicles/subaru-clean.svg', search: 'Subaru', lightLogo: '/brand/valvetronic-vehicles/subaru-dark.svg' },
  { name: 'Volkswagen', mark: 'volkswagen', logo: '/brand/valvetronic-vehicles/volkswagen-clean.svg', make: 'volkswagen', lightMonochrome: true },
];

/** The three untagged vehicle ranges keep their existing title-search links. */
export function valvetronicVehicleHref(vehicle: ValvetronicVehicleBrand) {
  const params = new URLSearchParams({ brand: 'valvetronic', ...(vehicle.make ? { make: vehicle.make } : { q: vehicle.search! }) });
  return `/shop?${params}`;
}
