import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const approvedWheelOffers = require('../lib/shop/used-wheel-offers.json');
function loadShopModule(file, modules, fetch, env) {
  const source = readFileSync(new URL(`../lib/shop/${file}.ts`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 } });
  const exports = {};
  new Function('exports', 'require', 'fetch', 'process', outputText)(
    exports, name => name === 'server-only' ? {} : modules[name], fetch, { env },
  );
  return exports;
}

function inventory(fetch, env = { SHOPIFY_ADMIN_ACCESS_TOKEN: 'test-token' }) {
  const admin = loadShopModule('admin', {}, fetch, env);
  return loadShopModule('inventory', { './used-wheel-offers': { approvedWheelOffers }, './admin': admin });
}

const product = { id: 'gid://shopify/Product/1', tags: ['brand_novitec'] };
const variant = { id: 'gid://shopify/ProductVariant/44908947537973', availableForSale: true, currentlyNotInStock: false, requiresShipping: true };
const stock = { id: variant.id, inventoryItem: { tracked: true }, inventoryQuantity: 2, inventoryPolicy: 'CONTINUE' };
const response = productVariant => ({ ok: true, json: async () => ({ data: { productVariant } }) });

test('uses fresh Shopify inventory and backorder policy for the selected variant', async () => {
  const { getVariantStock } = inventory(async (url, options) => {
    assert.equal(url, 'https://krtymq-v4.myshopify.com/admin/api/2026-07/graphql.json');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.headers['X-Shopify-Access-Token'], 'test-token');
    assert.deepEqual(JSON.parse(options.body).variables, { id: variant.id });
    return response(stock);
  });
  assert.deepEqual(await getVariantStock(product, variant), {
    id: 44908947537973, tracked: true, quantity: 2, policy: 'continue', shipping: true,
  });
});

test('stock-only tags prohibit backorders even if Shopify allows them', async () => {
  const { getVariantStock } = inventory(async () => response(stock));
  for (const tag of ['condition_used', 'condition_unused', 'stock_only', 'stock-only']) {
    assert.equal((await getVariantStock({ ...product, tags: [tag] }, variant)).policy, 'deny');
  }
});

test('uses Shopify DENY policy and handles untracked variants', async () => {
  const { getVariantStock } = inventory(async () => response({
    ...stock, inventoryItem: { tracked: false }, inventoryQuantity: null, inventoryPolicy: 'DENY',
  }));
  assert.deepEqual(await getVariantStock(product, variant), {
    id: 44908947537973, tracked: false, quantity: 0, policy: 'deny', shipping: true,
  });
  await assert.rejects(getVariantStock({ ...product, tags: ['condition_used'] }, variant), /Stock could not be checked/);
});

test('missing credentials, rejected queries or unverifiable stock fail closed', async () => {
  const withoutToken = inventory(() => assert.fail('Missing credentials must prevent the request'), {});
  await assert.rejects(withoutToken.getVariantStock(product, variant), /Stock could not be checked/);

  for (const failed of [
    { ok: false },
    { ok: true, json: async () => ({ errors: [{ message: 'Access denied' }] }) },
    response(null),
    response({ ...stock, inventoryQuantity: null }),
    response({ ...stock, id: 'gid://shopify/ProductVariant/99' }),
  ]) {
    const { getVariantStock } = inventory(async () => failed);
    await assert.rejects(getVariantStock(product, variant), /Stock could not be checked/);
  }
});

test('approved wheel offers allow one live group, never individual components or backorders', async () => {
  const { getVariantStock } = inventory(() => assert.fail('Approved wheel offers use Shopify storefront availability'));
  const [id, offer] = Object.entries(approvedWheelOffers)[0];
  const wheel = { id, tags: ['condition_used'] };
  const option = { ...variant, id: offer.variantId };
  assert.equal((await getVariantStock(wheel, option)).quantity, 1);
  assert.equal((await getVariantStock(wheel, option)).policy, 'deny');
  assert.equal((await getVariantStock(wheel, { ...option, availableForSale: false })).quantity, 0);
  assert.equal((await getVariantStock(wheel, { ...option, currentlyNotInStock: true })).quantity, 0);
  assert.equal(await getVariantStock(wheel, { ...option, id: 'gid://shopify/ProductVariant/999' }), undefined);
});

test('Shopify app credentials share a token exchange across simultaneous reads', async () => {
  let exchanges = 0;
  const { getVariantStock } = inventory(async (url, options) => {
    if (url.endsWith('/admin/oauth/access_token')) {
      exchanges++;
      assert.equal(options.cache, 'no-store');
      assert.deepEqual(Object.fromEntries(options.body), {
        grant_type: 'client_credentials', client_id: 'test-id', client_secret: 'test-secret',
      });
      return { ok: true, json: async () => ({ access_token: 'exchanged-token', expires_in: 86399 }) };
    }
    assert.equal(options.headers['X-Shopify-Access-Token'], 'exchanged-token');
    return response(stock);
  }, { SHOPIFY_CLIENT_ID: 'test-id', SHOPIFY_CLIENT_SECRET: 'test-secret' });

  const reads = await Promise.all([getVariantStock(product, variant), getVariantStock(product, variant)]);
  assert.deepEqual(reads.map(read => read.quantity), [2, 2]);
  await getVariantStock(product, variant);
  assert.equal(exchanges, 1);
});

test('Shopify app credentials obtain a new token after expiry and can retry a failed exchange', async () => {
  let exchanges = 0;
  const { getVariantStock } = inventory(async (url, options) => {
    if (url.endsWith('/admin/oauth/access_token')) {
      exchanges++;
      if (exchanges === 1) return { ok: false };
      return { ok: true, json: async () => ({ access_token: `token-${exchanges}`, expires_in: 1 }) };
    }
    assert.equal(options.headers['X-Shopify-Access-Token'], `token-${exchanges}`);
    return response(stock);
  }, { SHOPIFY_CLIENT_ID: 'test-id', SHOPIFY_CLIENT_SECRET: 'test-secret' });

  await assert.rejects(getVariantStock(product, variant), /Stock could not be checked/);
  assert.equal((await getVariantStock(product, variant)).quantity, 2);
  assert.equal((await getVariantStock(product, variant)).quantity, 2);
  assert.equal(exchanges, 3);
});
