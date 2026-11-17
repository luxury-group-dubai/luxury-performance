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
const { searchShopDestinations } = load(resolve(root, 'app/preview/shop/search.ts'));
const { previewSearchHref } = load(resolve(root, 'app/preview/shop/search-navigation.ts'));
const brand = (name, slug, model, body) => ({ name, slug, href: `/shop/${slug}/ferrari/${model}/${body.replaceAll('_', '-')}` });
const coupe = { slug: '12cilindri', body: 'coupe', name: '12Cilindri Coupé', brands: [brand('NOVITEC', 'novitec', '12cilindri', 'coupe'), brand('Capristo', 'capristo', '12cilindri', 'coupe')] };
const spider = { slug: '12cilindri', body: 'spider', name: '12Cilindri Spider', brands: [brand('NOVITEC', 'novitec', '12cilindri', 'spider')] };
const nlargo = { slug: '12cilindri', body: 'n_largo', name: '12Cilindri N-LARGO', brands: [brand('NOVITEC', 'novitec', '12cilindri', 'n_largo')] };
const models = { ferrari: [{ slug: '12cilindri', name: '12Cilindri', brands: [], variants: [coupe, spider, nlargo] }] };

test('brand and manufacturer searches open the new selectors', () => {
  assert.equal(searchShopDestinations(models, 'novitec').brands[0].href, '/shop/novitec');
  assert.equal(searchShopDestinations(models, 'ferrari').vehicles[0].href, '/shop/vehicles/ferrari');
  assert.equal(searchShopDestinations(models, 'FI exhaust').brands[0].note, 'Private enquiry');
});
test('body variants stay distinct and unaccented coupe matches Coupé', () => {
  const result = searchShopDestinations(models, '12cilindri');
  assert.equal(result.vehicles.length, 3);
  assert.equal(searchShopDestinations(models, '12cilindri coupe').vehicles[0].href, '/shop/vehicles/ferrari/12cilindri/coupe');
  assert.equal(searchShopDestinations(models, '12cilindri spider').vehicles[0].href, spider.brands[0].href);
  assert.equal(searchShopDestinations(models, 'n largo').vehicles[0].href, nlargo.brands[0].href);
});
test('brand plus model searches route directly to the compatible brand only', () => {
  assert.equal(searchShopDestinations(models, 'novitec 12cilindri coupe').collections[0].href, coupe.brands[0].href);
  assert.equal(searchShopDestinations(models, 'capristo 12cilindri coupe').collections[0].href, coupe.brands[1].href);
  assert.equal(searchShopDestinations(models, 'capristo 12cilindri spider').collections.length, 0);
});
test('empty, punctuation-only and unmatched queries do not suggest arbitrary cars', () => {
  for (const query of ['', 'f', '---', 'zzzzzz']) {
    assert.deepEqual(searchShopDestinations(models, query), { brands: [], vehicles: [], collections: [] });
  }
});
test('model-only searches include each compatible brand collection with logo metadata', () => {
  const purosangue = { slug: 'purosangue', name: 'Purosangue', brands: [brand('NOVITEC', 'novitec', 'purosangue', 'suv'), brand('Capristo', 'capristo', 'purosangue', 'suv')] };
  const result = searchShopDestinations({ ferrari: [purosangue] }, 'purosangue');
  assert.equal(result.vehicles[0].make, 'ferrari');
  assert.equal(result.vehicles[0].logoName, 'Ferrari');
  assert.equal(result.collections.length, 2);
  const novitec = result.collections.find(item => item.artwork === 'novitec');
  assert.equal(novitec.name, 'NOVITEC · Ferrari Purosangue');
  assert.equal(novitec.href, purosangue.brands[0].href);
  assert.equal(novitec.logoName, 'NOVITEC');
  assert.equal(searchShopDestinations(models, 'novitec').brands[0].artwork, 'novitec');
});
test('all-results links use the production search route and preserve special characters in queries', () => {
  const url = new URL(previewSearchHref('  carbon & exhaust + Ferrari  '), 'https://example.com');
  assert.equal(url.pathname, '/shop/search');
  assert.equal(url.searchParams.get('q'), 'carbon & exhaust + Ferrari');
  assert.equal(new URL(previewSearchHref('x'.repeat(150)), 'https://example.com').searchParams.get('q').length, 100);
});
