import 'server-only';
import { shopifyAdmin } from './admin';
import type { Product, Variant } from './types';
import { approvedWheelOffers } from './used-wheel-offers';
export type StockVariant = { id: number; tracked: boolean; quantity: number; policy: 'continue' | 'deny'; shipping: boolean };
const STOCK_QUERY = `query ReadVariantStock($id: ID!) {
  productVariant(id: $id) {
    id
    inventoryPolicy
    inventoryQuantity
    inventoryItem { tracked }
  }
}`;
type VariantStockData = {
  id: string;
  inventoryPolicy: 'CONTINUE' | 'DENY';
  inventoryQuantity: number | null;
  inventoryItem: { tracked: boolean };
};

export async function getVariantStock(product: Pick<Product, 'id' | 'tags'>, variant: Pick<Variant, 'id' | 'availableForSale' | 'currentlyNotInStock' | 'requiresShipping'>): Promise<StockVariant | undefined> {
  const wheelOffer = approvedWheelOffers[product.id];
  if (wheelOffer) {
    if (variant.id !== wheelOffer.variantId) return undefined;
    // Each approved one-off offer has at most one complete set/lot/pair/single.
    // The caller reads fresh Shopify availability; checkout enforces component stock.
    return { id: Number(variant.id.split('/').pop()), tracked: true, quantity: variant.availableForSale && !variant.currentlyNotInStock ? 1 : 0, policy: 'deny', shipping: variant.requiresShipping };
  }
  try {
    const { productVariant: stock } = await shopifyAdmin<{ productVariant: VariantStockData | null }>(
      STOCK_QUERY, { id: variant.id }, { cache: 'no-store' },
    );
    if (!stock || stock.id !== variant.id || typeof stock.inventoryItem?.tracked !== 'boolean') {
      throw new Error('Missing Shopify variant stock.');
    }
    const tracked = stock.inventoryItem.tracked;
    if ((stock.inventoryPolicy !== 'CONTINUE' && stock.inventoryPolicy !== 'DENY')
      || (tracked && !Number.isInteger(stock.inventoryQuantity))) {
      throw new Error('Invalid Shopify variant stock.');
    }

    const stockOnly = product.tags.some(tag => ['condition_used', 'condition_unused', 'stock_only', 'stock-only'].includes(tag));
    if (stockOnly && !tracked) throw new Error('Missing tracking for a stock-only variant.');

    return {
      id: Number(variant.id.split('/').pop()),
      tracked,
      quantity: stock.inventoryQuantity ?? 0,
      policy: stockOnly || stock.inventoryPolicy === 'DENY' ? 'deny' : 'continue',
      shipping: variant.requiresShipping,
    };
  } catch {
    throw new Error('Stock could not be checked. Please try again.');
  }
}
