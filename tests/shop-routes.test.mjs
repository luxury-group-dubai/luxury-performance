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
