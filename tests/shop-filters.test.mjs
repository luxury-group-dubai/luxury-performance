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
  new Function('require', 'module', 'exports', outputText)(specifier => load(resolve(dirname(path), specifier)), compiled, compiled.exports);
  return compiled.exports;
}
const { updateFilters, filterUrl, fitOptions, filterProducts, techartFitmentLabel } = load(resolve(root, 'lib/shop/taxonomy.ts'));
const products = [
  { title: 'Shared wheels', vendor: 'TECHART', productType: 'Wheels', tags: ['make_porsche', 'model_911', 'model_cayenne', 'fit_992_1', 'fit_e3_2'], priceRange: { minVariantPrice: { amount: '2000' } } },
  { title: 'Cayenne spoiler', vendor: 'TECHART', productType: 'Spoiler', tags: ['make_porsche', 'model_cayenne', 'fit_e3_2'], priceRange: { minVariantPrice: { amount: '1000' } } },
];

test('changing vehicle clears dependent selections and returns to page one', () => {
  const current = { brand: 'techart', make: 'porsche', model: '911', fit: '992_1', page: '4', category: 'Wheels' };
  const model = updateFilters(current, { model: 'cayenne' });
  assert.equal(model.fit, undefined);
  assert.equal(model.page, undefined);
  assert.equal(model.category, 'Wheels');
  const make = updateFilters(current, { make: 'ferrari' });
  assert.equal(make.model, undefined);
  assert.equal(make.fit, undefined);
  assert.deepEqual(updateFilters(current, { brand: 'novitec' }), { brand: 'novitec' });
  assert.equal(updateFilters(current, { category: 'Exhaust' }).page, undefined);
});

test('shared TECHART parts do not mix Porsche family fitment options', () => {
  assert.deepEqual(fitOptions(products, { brand: 'techart', model: 'cayenne' }), ['e3_2']);
  assert.deepEqual(fitOptions(products, { brand: 'techart', model: '911' }), ['992_1']);
  assert.deepEqual(fitOptions(products, { brand: 'techart' }), ['992_1', 'e3_2']);
});

test('combined filters and prices produce the matching subset', () => {
  const selection = { brand: 'techart', model: 'cayenne', fit: 'e3_2' };
  assert.equal(filterProducts(products, selection).length, 2);
  assert.equal(filterProducts(products, { ...selection, category: 'Aerodynamics' })[0].title, 'Cayenne spoiler');
  assert.equal(filterProducts(products, { ...selection, sort: 'price-up' })[0].title, 'Cayenne spoiler');
  assert.equal(filterProducts(products, { ...selection, q: 'missing part' }).length, 0);
});

test('filter URLs preserve the collection, encode values, and omit cleared filters', () => {
  assert.equal(filterUrl('/collections/techart', { brand: 'techart', q: ' Turbo S ', model: '', page: undefined }), '/collections/techart?brand=techart&q=Turbo+S');
  assert.equal(filterUrl('/shop', {}), '/shop');
});


test('a TECHART generation includes its trim and generation tags but excludes other generations', () => {
  const carrera = { ...products[0], title: '992.1 Carrera', tags: ['model_911', 'fit_992_1_carrera'] };
  const laterCarrera = { ...carrera, title: '992.2 Carrera', tags: ['model_911', 'fit_992_2_carrera'] };
  const filters = { brand: 'techart', model: '911', generation: '992_1' };
  assert.deepEqual(filterProducts([...products, carrera, laterCarrera], filters), [products[0], carrera]);
  assert.equal(filterUrl('/shop', filters), '/shop?brand=techart&model=911&generation=992_1');
});

test('changing TECHART generation clears fitment and body, and clearing a legacy fit retains generation', () => {
  const legacy = { brand: 'techart', model: '911', fit: '992_1_carrera_4s', body: 'targa' };
  assert.equal(techartFitmentLabel(legacy.fit), 'Carrera 4S');
  assert.equal(updateFilters(legacy, { fit: '' }).generation, '992_1');
  const next = updateFilters(legacy, { generation: '992_2' });
  assert.equal(next.fit, undefined);
  assert.equal(next.body, undefined);
  assert.equal(updateFilters(next, { model: 'cayenne' }).generation, undefined);
});
