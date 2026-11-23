import { readFileSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const modules = new Map();
function load(path) {
  if (extname(path) === '.json') return JSON.parse(readFileSync(path, 'utf8'));
  if (!extname(path)) path += '.ts';
  if (modules.has(path)) return modules.get(path).exports;
  const compiled = { exports: {} }; modules.set(path, compiled);
  const { outputText } = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } });
  new Function('require', 'module', 'exports', outputText)(specifier => load(specifier.startsWith('@/') ? resolve(root, specifier.slice(2)) : resolve(dirname(path), specifier)), compiled, compiled.exports);
  return compiled.exports;
}
const { shopBrandHref, shopPathFilters, legacyShopHref, vehicleBrowseHref, stockBrowseHref } = load(resolve(root, 'lib/shop/routes.ts'));
test('brand paths round-trip manufacturer, model and variant without losing filters', () => {
  const target = shopBrandHref('novitec', { make: 'rolls_royce', model: 'cullinan', body: 'series_ii', category: 'Performance & Exhaust', sort: 'price-up' });
  const url = new URL(target, 'https://example.com');
  assert.equal(url.pathname, '/shop/novitec/rolls-royce/cullinan/series-ii');
  assert.deepEqual(shopPathFilters(url.pathname), { brand: 'novitec', make: 'rolls_royce', model: 'cullinan', body: 'series_ii' });
  assert.equal(url.searchParams.get('category'), 'Performance & Exhaust');
  assert.equal(url.searchParams.get('sort'), 'price-up');
  assert.equal(url.searchParams.has('brand'), false);
});
test('legacy model links retain their exact NOVITEC version', () => {
  assert.equal(legacyShopHref({ brand: 'novitec', make: 'ferrari', model: '812_gts' }), '/shop/novitec/ferrari/812/gts');
  assert.equal(legacyShopHref({ brand: 'novitec', make: 'ferrari', model: '12cilindri_spider' }), '/shop/novitec/ferrari/12cilindri/spider');
});
test('TECHART trim filters survive the clean vehicle URL', () => {
  const target = shopBrandHref('techart', { make: 'porsche', model: '911', body: 'targa', fit: '992_2_carrera_targa_gts' });
  assert.equal(target, '/shop/techart/porsche/911/targa?fit=992_2_carrera_targa_gts');
});
test('stock, vehicle and search legacy links use their production destinations', () => {
  assert.equal(legacyShopHref({ view: 'vehicles', make: 'ferrari', model: '12cilindri', body: 'spider' }), '/shop/vehicles/ferrari/12cilindri/spider');
  assert.equal(legacyShopHref({ stock: 'in-stock' }), '/shop/in-stock');
  assert.equal(stockBrowseHref({ view: 'stock', stock_group: 'used', show: '48' }), '/shop/in-stock?stock_group=used&show=48');
  assert.equal(legacyShopHref({ q: 'carbon & exhaust' }), '/shop/search?q=carbon+%26+exhaust');
  assert.equal(vehicleBrowseHref('alfa_romeo', '4c'), '/shop/vehicles/alfa-romeo/4c');
  assert.deepEqual(shopPathFilters('/shop/search'), {});
  assert.deepEqual(shopPathFilters('/shop/in-stock'), { view: 'stock' });
});

test('CAPRISTO generation and version survive category and sort links', () => {
  const url = new URL(shopBrandHref('capristo', { make: 'porsche', model: '911', generation: '992_1', fit: '992_1_gt3', category: 'Exhaust', sort: 'price-up' }), 'https://example.com');
  assert.equal(url.pathname, '/shop/capristo/porsche/911');
  assert.equal(url.searchParams.get('generation'), '992_1');
  assert.equal(url.searchParams.get('fit'), '992_1_gt3');
  assert.equal(url.searchParams.get('category'), 'Exhaust');
  assert.equal(url.searchParams.get('sort'), 'price-up');
});

test('Valvetronic legacy model aliases resolve to canonical models and retain selections', () => {
  assert.equal(shopBrandHref('valvetronic', { make: 'bmw', model: 'm240', generation: 'g42', fit: 'g42_m240i' }),
    '/shop/valvetronic/bmw/m240i?fit=g42_m240i&generation=g42');
  assert.equal(shopBrandHref('valvetronic', { make: 'mercedes', model: 'g63' }), '/shop/valvetronic/mercedes/g-class');
});

test('Valvetronic vehicle links preserve make scopes and untagged range searches', () => {
  const { valvetronicVehicles, valvetronicVehicleHref } = load(resolve(root, 'lib/valvetronic-vehicles.ts'));
  for (const vehicle of valvetronicVehicles) {
    const url = new URL(valvetronicVehicleHref(vehicle), 'https://example.com');
    assert.equal(shopPathFilters(url.pathname).brand, 'valvetronic');
    if (vehicle.make) {
      assert.equal(shopPathFilters(url.pathname).make, vehicle.make);
      assert.equal(url.search, '');
    } else {
      assert.equal(url.pathname, '/shop/valvetronic');
      assert.equal(url.searchParams.get('q'), vehicle.search);
    }
  }
});

const { legacyCollectionHref } = load(resolve(root, 'lib/shop/legacy-collections.ts'));
test('retired Shopify collection aliases keep vehicle and body context', () => {
  assert.equal(legacyCollectionHref('f8-spider-copy-1'), '/shop/vehicles/ferrari/f8/spider');
  assert.equal(legacyCollectionHref('812-gts-copy'), '/shop/vehicles/ferrari/812/gts');
  assert.equal(legacyCollectionHref('ferrari-812-copy-1'), '/shop/vehicles/ferrari/812');
  assert.equal(legacyCollectionHref('750s-coupe-copy'), '/shop/vehicles/mclaren/750s');
  assert.equal(legacyCollectionHref('urus-performante'), '/shop/vehicles/lamborghini/urus/performante');
  assert.equal(legacyCollectionHref('car-rolls-royce-1'), '/shop/vehicles/rolls-royce');
});
test('retired brand and category collections lead to relevant current ranges', () => {
  assert.equal(legacyCollectionHref('techart-porsche-911'), '/shop/techart/porsche/911');
  assert.equal(legacyCollectionHref('valvetronic-mercedes-amg'), '/shop/valvetronic/mercedes');
  assert.equal(legacyCollectionHref('valvetronic-aston-martin'), '/shop/valvetronic/aston-martin');
  assert.equal(legacyCollectionHref('rev-arts-scale-cars-copy'), '/shop/collectibles?category=Model+Cars');
  assert.equal(legacyCollectionHref('category-exhaust'), '/shop/search?q=Exhaust');
  assert.equal(legacyCollectionHref('ferrari-f8-copy', { brand: 'novitec' }), '/shop/novitec/ferrari/f8');
});
test('collections without a current equivalent do not redirect to unrelated shop content', () => {
  for (const handle of ['brand-abt', 'brand-liberty-walk', 'does-not-exist', '__proto__', 'constructor']) assert.equal(legacyCollectionHref(handle), null);
  assert.equal(legacyCollectionHref('unknown', { brand: '//evil.test' }), null);
});
