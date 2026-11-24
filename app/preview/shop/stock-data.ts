import 'server-only';
import { shopifyAdmin } from '@/lib/shop/admin';
import { approvedWheelOffers } from '@/lib/shop/used-wheel-offers';
import type { CatalogProduct } from '@/lib/shop/types';

export type StockProduct = CatalogProduct & { stockedVariantId: string };

const STOCK_QUERY = `query PreviewStock($after: String) {
  productVariants(first: 100, after: $after, query: "inventory_quantity:>0") {
    nodes { id inventoryQuantity inventoryItem { tracked } product { id } price requiresComponents }
    pageInfo { hasNextPage endCursor }
  }
}`;
// The inventory_quantity index does not include native bundle parents, even
// when Shopify reports sellable inventory derived from their components.
const WHEEL_BUNDLE_STOCK_QUERY = `query ApprovedWheelBundleStock($ids: [ID!]!) {
  nodes(ids: $ids) {
    ... on ProductVariant {
      id inventoryQuantity sellableOnlineQuantity inventoryItem { tracked }
      product { id } price requiresComponents
    }
  }
}`;
type StockVariant = {
  id: string;
  inventoryQuantity: number | null;
  inventoryItem: { tracked: boolean };
  product: { id: string };
  price: string;
  requiresComponents: boolean;
};
type StockPage = { productVariants: {
  nodes: StockVariant[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
} };
type BundleStock = { nodes: ((StockVariant & { sellableOnlineQuantity: number }) | null)[] };
const STOCK_CACHE = { next: { revalidate: 30 } };

async function getIndexedStock() {
  const stockedVariants = new Map<string, { id: string; price: number }>();
  let after: string | null = null;
  do {
    const { productVariants }: StockPage = await shopifyAdmin(STOCK_QUERY, { after }, STOCK_CACHE);
    for (const variant of productVariants.nodes) {
      if (!variant.inventoryItem.tracked || (variant.inventoryQuantity ?? 0) < 1) continue;
      const offer = approvedWheelOffers[variant.product.id];
      if (offer && (offer.variantId !== variant.id || variant.requiresComponents)) continue;
      const price = Number(variant.price);
      const current = stockedVariants.get(variant.product.id);
      if (!current || price < current.price) stockedVariants.set(variant.product.id, { id: variant.id, price });
    }
    after = productVariants.pageInfo.hasNextPage ? productVariants.pageInfo.endCursor : null;
  } while (after);
  return stockedVariants;
}

async function getApprovedWheelBundleStock(products: CatalogProduct[]) {
  const approved = new Map(products.flatMap(product => {
    const offer = approvedWheelOffers[product.id];
    return product.availableForSale && offer ? [[offer.variantId, product.id] as const] : [];
  }));
  if (!approved.size) return [];
  const { nodes }: BundleStock = await shopifyAdmin(WHEEL_BUNDLE_STOCK_QUERY, { ids: [...approved.keys()] }, STOCK_CACHE);
  return nodes.filter(variant => variant?.requiresComponents
    && approved.get(variant.id) === variant.product.id
    && variant.inventoryItem.tracked
    && (variant.inventoryQuantity ?? 0) > 0
    && variant.sellableOnlineQuantity > 0);
}

export async function getPreviewStock(products: CatalogProduct[]): Promise<StockProduct[]> {
  const [stockedVariants, bundles] = await Promise.all([
    getIndexedStock(),
    // An unavailable bundle read must not turn a bundle component into a listing
    // or hide unrelated parts whose usual indexed stock check still succeeds.
    getApprovedWheelBundleStock(products).catch(() => []),
  ]);
  for (const bundle of bundles) {
    if (!bundle) continue;
    stockedVariants.set(bundle.product.id, { id: bundle.id, price: Number(bundle.price) });
  }
  // Intersect with the published catalogue, including its approved set/lot offers.
  return products.flatMap(product => {
    const variant = stockedVariants.get(product.id);
    if (!product.availableForSale || !variant) return [];
    return [{
      ...product,
      stockedVariantId: variant.id.slice(variant.id.lastIndexOf('/') + 1),
      priceRange: { minVariantPrice: { ...product.priceRange.minVariantPrice, amount: String(variant.price) } },
    }];
  });
}
