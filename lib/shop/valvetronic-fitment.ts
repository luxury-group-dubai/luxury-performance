import data from './valvetronic-fitments.json';
import type { CatalogProduct, VehicleFitment } from './types';
import { valvetronicModelKey } from './valvetronic-models';

type Vehicle = { make: string; model: string; generation?: string; versions: string[] };
const fitments: Record<string, { source: string; vehicles: Vehicle[] }> = data;
const key = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

export function valvetronicVehicles(product: CatalogProduct) {
  return fitments[product.handle]?.vehicles;
}

export function valvetronicProductFitments(product: CatalogProduct, make: string, model: string): VehicleFitment[] {
  return (valvetronicVehicles(product) ?? [])
    .filter(vehicle => vehicle.make === make && vehicle.model === valvetronicModelKey(model))
    .flatMap(vehicle => vehicle.versions.map(version => ({
      key: [vehicle.generation, key(version)].filter(Boolean).join('_'),
      generation: vehicle.generation,
      generationLabel: vehicle.generation?.replace(/_/g, '.').toUpperCase(),
      version,
    })));
}

export function valvetronicFitmentOptions(products: CatalogProduct[], make: string, model: string) {
  const options = new Map<string, VehicleFitment & { count: number }>();
  for (const product of products) {
    for (const fitment of valvetronicProductFitments(product, make, model)) {
      const option = options.get(fitment.key);
      options.set(fitment.key, { ...fitment, count: (option?.count ?? 0) + 1 });
    }
  }
  return [...options.values()].sort((a, b) => a.key.localeCompare(b.key, 'en', { numeric: true }));
}
