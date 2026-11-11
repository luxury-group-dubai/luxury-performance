import type { MetadataRoute } from 'next';
import { inStockShopPath } from '@/lib/shop/taxonomy';
import { partners } from '@/lib/partners';
import { getCatalog, getCollections } from '@/lib/shop/storefront';
import { novitecStories } from '@/lib/novitec-stories';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
  const routes = ['/', '/about', '/contact'];

  if (process.env.SHOP_SEO_LIVE === 'true') {
    const [products, collections] = await Promise.all([getCatalog(), getCollections()]);
    routes.push('/collections/used-parts', '/partners', ...partners.map(p => `/partners/${p.slug}`), ...['ferrari', 'lamborghini', 'mclaren', 'rolls-royce'].map(make => `/partners/novitec/${make}`), ...['f8', '812', 'sf90'].map(model => `/partners/novitec/ferrari/${model}`), ...novitecStories.map(story => `/partners/novitec/stories/${story.slug}`), '/shop', ...products.map(p => `/products/${p.handle}`), ...collections.map(c => c.handle === 'in-stock' ? inStockShopPath : `/collections/${c.handle}`));
  }

  return routes.map(path => ({ url: new URL(path, origin).toString() }));
}
