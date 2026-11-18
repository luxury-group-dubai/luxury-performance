import type { MetadataRoute } from 'next';
import { inStockShopPath } from '@/lib/shop/taxonomy';
import { partners } from '@/lib/partners';
import { getCatalog } from '@/lib/shop/storefront';
import { buildVehicleChoices } from '@/app/preview/shop/vehicle-data';
import { prepareBrandCatalogue } from '@/app/preview/shop/brand-catalogue';
import { suppliers } from '@/lib/shop/taxonomy';
import { novitecStories } from '@/lib/novitec-stories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
  const routes = ['/', '/about', '/contact', '/novitec-12cilindri-n-largo'];

  if (process.env.SHOP_SEO_LIVE === 'true') {
    const products = await getCatalog();
    const choices = buildVehicleChoices(prepareBrandCatalogue(products));
    const shopRoutes = new Set<string>(['/shop/vehicles', inStockShopPath, ...suppliers.map(item => `/shop/${item.slug}`)]);
    for (const [make, models] of Object.entries(choices)) {
      shopRoutes.add(`/shop/vehicles/${make.replaceAll('_', '-')}`);
      for (const model of models) for (const choice of model.variants ?? [model]) for (const brand of choice.brands) {
        const path = brand.href.split('?')[0];
        const segments = path.split('/');
        for (let length = 3; length <= segments.length; length++) shopRoutes.add(segments.slice(0, length).join('/'));
      }
    }
    routes.push(...shopRoutes);
    routes.push('/partners', ...partners.map(p => `/partners/${p.slug}`), ...['ferrari', 'lamborghini', 'mclaren', 'rolls-royce'].map(make => `/partners/novitec/${make}`), ...['f8', '812', 'sf90', '12cilindri'].map(model => `/partners/novitec/ferrari/${model}`), ...novitecStories.map(story => `/partners/novitec/stories/${story.slug}`), '/shop', ...products.map(p => `/products/${p.handle}`));
  }

  return [...new Set(routes)].map(path => ({ url: new URL(path, origin).toString() }));
}
