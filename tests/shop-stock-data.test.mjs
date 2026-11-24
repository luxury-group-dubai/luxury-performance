import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';

const approvedWheelOffers = JSON.parse(readFileSync(new URL('../lib/shop/used-wheel-offers.json', import.meta.url), 'utf8'));
const source = readFileSync(new URL('../app/preview/shop/stock-data.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 } });

function getStock(shopifyAdmin) {
  const api = {};
  new Function('exports', 'require', outputText)(api, name => ({
    'server-only': {},
    '@/lib/shop/admin': { shopifyAdmin },
    '@/lib/shop/used-wheel-offers': { approvedWheelOffers },
  })[name]);
  return api.getPreviewStock;
}

const [bundle, unavailable, otherBundle, untracked, unverified] = Object.entries(approvedWheelOffers).filter(([, offer]) => offer.wheelCount > 1);
const single = Object.entries(approvedWheelOffers).find(([, offer]) => offer.wheelCount === 1);
const ordinary = ['gid://shopify/Product/1', { variantId: 'gid://shopify/ProductVariant/901' }];
const candidate = ([id], availableForSale = true) => ({
  id, availableForSale, priceRange: { minVariantPrice: { amount: '1.00', currencyCode: 'AED' } },
});
function variant([id, offer], price, changes = {}) {
  return {
    id: offer.variantId, product: { id }, price, requiresComponents: offer.wheelCount > 1,
    inventoryQuantity: 1, sellableOnlineQuantity: 1, inventoryItem: { tracked: true }, ...changes,
  };
}
const stockPage = (nodes, endCursor = null) => ({ productVariants: { nodes, pageInfo: { hasNextPage: !!endCursor, endCursor } } });
const variantId = id => id.split('/').at(-1);
const results = products => products.map(product => [
  product.id, product.stockedVariantId, product.priceRange.minVariantPrice.amount,
]);

test('restores an exact sellable wheel bundle omitted by the inventory index without exposing its components', async () => {
  const getPreviewStock = getStock(async (query, variables, cache) => {
    assert.deepEqual(cache, { next: { revalidate: 30 } });
    if (query.includes('query ApprovedWheelBundleStock')) {
      assert.deepEqual(variables.ids, [bundle[1].variantId, single[1].variantId]);
      return { nodes: [variant(bundle, '9500.00'), variant(single, '1.00')] };
    }
    assert.match(query, /inventory_quantity:>0/);
    if (!variables.after) {
      return stockPage([
        variant(bundle, '10.00', { id: 'gid://shopify/ProductVariant/900', requiresComponents: false }),
        variant(single, '3000.00'),
        variant(ordinary, '900.00'),
      ], 'page-two');
    }
    assert.equal(variables.after, 'page-two');
    return stockPage([variant(ordinary, '800.00', { id: 'gid://shopify/ProductVariant/902' })]);
  });
  const stock = await getPreviewStock([bundle, single, ordinary].map(offer => candidate(offer)));
  assert.deepEqual(results(stock), [
    [bundle[0], variantId(bundle[1].variantId), '9500'],
    [single[0], variantId(single[1].variantId), '3000'],
    [ordinary[0], '902', '800'],
  ]);
});

test('hides an unsellable, untracked, unpublished, or unverifiable bundle even if another variant is in stock', async () => {
  const getPreviewStock = getStock(async (query, variables) => {
    if (query.includes('query ApprovedWheelBundleStock')) {
      assert.ok(!variables.ids.includes(otherBundle[1].variantId));
      return { nodes: [
        variant(bundle, '9500.00', { sellableOnlineQuantity: 0 }),
        variant(unavailable, '9900.00', { inventoryQuantity: 0 }),
        variant(untracked, '9700.00', { inventoryItem: { tracked: false } }),
        variant(unverified, '400.00', { product: { id: unavailable[0] } }),
        variant(otherBundle, '400.00'), null,
      ] };
    }
    return stockPage([
      variant(bundle, '9500.00'),
      variant(unavailable, '450.00', { id: 'gid://shopify/ProductVariant/900', requiresComponents: false }),
      variant(ordinary, '800.00', { inventoryItem: { tracked: false } }),
    ]);
  });
  const stock = await getPreviewStock([
    candidate(bundle), candidate(unavailable), candidate(untracked), candidate(unverified),
    candidate(otherBundle, false), candidate(ordinary),
  ]);
  assert.deepEqual(stock, []);
});

test('a failed bundle lookup does not expose a substitute configuration or remove unrelated in-stock parts', async () => {
  const getPreviewStock = getStock(async query => {
    if (query.includes('query ApprovedWheelBundleStock')) throw new Error('Bundle inventory temporarily unavailable');
    return stockPage([variant(bundle, '9500.00'), variant(ordinary, '800.00')]);
  });
  assert.deepEqual(results(await getPreviewStock([candidate(bundle), candidate(ordinary)])), [
    [ordinary[0], '901', '800'],
  ]);
});
