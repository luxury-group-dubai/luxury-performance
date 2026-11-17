import 'server-only';
import { shopifyAdmin } from '@/lib/shop/admin';
import { approvedWheelOffers } from '@/lib/shop/used-wheel-offers';
import type { CatalogProduct } from '@/lib/shop/types';

const STOCK_QUERY = `query PreviewStock($after: String) {
  productVariants(first: 100, after: $after, query: "inventory_quantity:>0") {
    nodes { id inventoryQuantity inventoryItem { tracked } product { id } price }
    pageInfo { hasNextPage endCursor }
  }
}`;
type StockPage = { productVariants: {
  nodes: { id: string; inventoryQuantity: number | null; inventoryItem: { tracked: boolean }; product: { id: string }; price: string }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
} };

export async function getPreviewStock(products: CatalogProduct[]) {
  const prices = new Map<string, number>();
  let after: string | null = null;
  do {
    const { productVariants }: StockPage = await shopifyAdmin(STOCK_QUERY, { after }, { next: { revalidate: 30 } });
    for (const variant of productVariants.nodes) {
      if (!variant.inventoryItem.tracked || (variant.inventoryQuantity ?? 0) < 1) continue;
      const offer = approvedWheelOffers[variant.product.id];
      if (offer && offer.variantId !== variant.id) continue;
      const price = Number(variant.price);
      prices.set(variant.product.id, Math.min(prices.get(variant.product.id) ?? Infinity, price));
    }
    after = productVariants.pageInfo.hasNextPage ? productVariants.pageInfo.endCursor : null;
  } while (after);
  // Intersect with the published catalogue, including its approved set/lot offers.
  return products.filter(product => product.availableForSale && prices.has(product.id)).map(product => ({
    ...product,
    priceRange: { minVariantPrice: { ...product.priceRange.minVariantPrice, amount: String(prices.get(product.id)) } },
  }));
}
