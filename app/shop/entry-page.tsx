import { getCatalog, getCollection } from '@/lib/shop/storefront';
import { supplierOf } from '@/lib/shop/taxonomy';
import { isUsedPart } from '@/lib/shop/used-parts';
import { ShopEntryPreview } from '../preview/shop/shop-entry';
import { getPreviewStock } from '../preview/shop/stock-data';
import { buildVehicleChoices } from '../preview/shop/vehicle-data';
import { prepareBrandCatalogue } from '../preview/shop/brand-catalogue';
export async function ShopEntryPage({ inStock = false }: { inStock?: boolean }) {
  const products = await getCatalog();
  const models = buildVehicleChoices(prepareBrandCatalogue(products));
  if (!inStock) return <ShopEntryPreview models={models} stockProducts={[]} usedStockProducts={[]} stockFailed={false} />;
  const collection = await getCollection('in-stock').catch(() => null);
  const collectionIds = new Set(collection?.products.map(product => product.id));
  const candidates = products.filter(product => collectionIds.has(product.id) || (isUsedPart(product) && supplierOf(product) === 'oem'));
  const stock = await getPreviewStock(candidates).then(products => ({ products, failed: false })).catch(() => ({ products: [], failed: true }));
  return <ShopEntryPreview models={models} stockProducts={stock.products.filter(product => collectionIds.has(product.id))} usedStockProducts={stock.products.filter(product => isUsedPart(product) && supplierOf(product) === 'oem')} stockFailed={stock.failed || !collection} />;
}
