import { vehicleBrowseHref } from '@/lib/shop/routes';
import type { ShopMenuItem } from '@/lib/shop-navigation';

export type VehicleBrand = ShopMenuItem & { slug: string };
export type VehicleChoice = { slug: string; name: string; body?: string; brands: VehicleBrand[]; variants?: VehicleChoice[] };
export type VehicleChoices = Record<string, VehicleChoice[]>;

export function vehicleStepHref(make: string, model?: string, body?: string) {
  return vehicleBrowseHref(make, model, body);
}

// Resolve on the link itself, so Back returns to the selector without a redirect loop.
export function vehicleChoiceHref(make: string, choice: VehicleChoice) {
  return !choice.variants?.length && choice.brands.length === 1
    ? choice.brands[0].href
    : vehicleStepHref(make, choice.slug, choice.body);
}
