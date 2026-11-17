import { shopBrandHref } from '@/lib/shop/routes';
import { brandMenu } from '@/lib/shop-navigation';
import { filterProducts, supplierOf, suppliers, tagsFor } from '@/lib/shop/taxonomy';
import { novitecModelFamily, novitecModelName } from '@/lib/shop/novitec-models';
import { novitecVariantFamilies } from '@/lib/shop/novitec-variants';
import type { CatalogProduct } from '@/lib/shop/types';
import type { VehicleBrand, VehicleChoice, VehicleChoices } from './vehicle-navigation';
import { brandMakes, brandVehicleName } from './brand-catalogue';

export function buildVehicleChoices(products: CatalogProduct[]): VehicleChoices {
  // Collectibles describe the model they depict, not a compatible vehicle.
  const parts = products.filter(product => supplierOf(product) !== 'collectibles');
  return Object.fromEntries(brandMakes(parts).map(({ key: make }) => {
    const inventory = parts.filter(product => tagsFor(product, 'make').includes(make));
    const keys = [...new Set(inventory.flatMap(product => tagsFor(product, 'model')).map(model => novitecModelFamily(make, model) ?? model))];
    function brandsFor(model: string, body?: string, tag = model): VehicleBrand[] {
      return suppliers.filter(supplier => supplier.slug !== 'collectibles').flatMap(supplier => {
        const brandModel = supplier.slug === 'novitec' || model === '812' ? model : tag;
        const filters = { brand: supplier.slug, make, model: brandModel, ...(body ? { body } : {}) };
        if (!filterProducts(inventory, filters).length) return [];
        const artwork = brandMenu.find(brand => brand.artwork === supplier.slug);
        return [{ ...artwork, slug: supplier.slug, name: supplier.name, href: shopBrandHref(supplier.slug, filters), ...(supplier.slug === 'urban' ? { artwork: 'urban' } : {}) }];
      });
    }
    const models: VehicleChoice[] = keys.map(slug => {
      const family = novitecVariantFamilies[make]?.[slug];
      const variants = family?.map(variant => ({ slug, body: variant.key, name: variant.name, brands: brandsFor(slug, variant.key, variant.tag) })).filter(variant => variant.brands.length);
      return { slug, name: family ? novitecModelName(slug) : brandVehicleName(slug).replace(/\bGt(\d+)rs\b/gi, 'GT$1 RS').replace(/\bGt(\d+)\b/gi, 'GT$1').replace(/\bGts\b/gi, 'GTS'), brands: variants?.length ? [] : brandsFor(slug), ...(variants?.length ? { variants } : {}) };
    }).filter(model => model.variants?.length || model.brands.length).sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
    return [make, models];
  }));
}
