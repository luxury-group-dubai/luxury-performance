import { readFileSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';

// Load the real TypeScript modules, including fitment JSON, without a browser or API.
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
const { catalogSeo } = load(resolve(root, 'lib/shop/catalog-seo.ts'));
const { cayenneOptions } = load(resolve(root, 'lib/shop/techart-cayenne.ts'));
const { techartSelection, vehicleBodyMatch, vehicleOptions } = load(resolve(root, 'lib/shop/techart-fitment.ts'));
const { filterProducts } = load(resolve(root, 'lib/shop/taxonomy.ts'));
const products = Array.from({ length: 78 }, (_, i) => ({
  id: String(i), handle: `part-${i}`, title: `Part ${i}`, vendor: i < 54 ? 'Novitec' : 'TECHART', productType: 'Exhaust',
  tags: i < 54 ? ['brand_novitec', 'make_ferrari', 'model_purosangue'] : ['brand_techart', 'make_porsche', 'model_911'],
  availableForSale: i < 25, featuredImage: null, priceRange: { minVariantPrice: { amount: '100', currencyCode: 'AED' } },
}));
const seo = (query = {}, live = true) => catalogSeo('/shop', query, products, live);

test('each real catalogue page is indexable with its own canonical', () => {
  for (const page of [1, 2, 3, 4]) {
    const result = seo({ page: String(page) });
    assert.equal(result.robots.index, true);
    assert.equal(result.alternates.canonical, page === 1 ? '/shop' : `/shop?page=${page}`);
  }
});

test('invalid page aliases canonicalize to the displayed page and are not indexed', () => {
  for (const [input, output] of [['999', 4], ['0', 1], ['-2', 1], ['1.5', 1], ['NaN', 1], ['Infinity', 4]]) {
    const result = seo({ page: input });
    assert.equal(result.page, output, input);
    assert.equal(result.alternates.canonical, output === 1 ? '/shop' : `/shop?page=${output}`, input);
    assert.equal(result.robots.index, false, input);
  }
});

test('filtered pages keep their context and use their filtered page count', () => {
  const result = seo({ brand: 'novitec', make: 'ferrari', page: '999' });
  assert.equal(result.page, 3);
  assert.equal(result.alternates.canonical, '/shop?brand=novitec&make=ferrari&page=3');
  assert.deepEqual(result.robots, { index: false, follow: true });
});

test('search and sort views are noindex but remain followable', () => {
  for (const query of [{ q: 'missing' }, { sort: 'price-up' }, { category: 'Exhaust' }]) {
    assert.deepEqual(seo(query).robots, { index: false, follow: true });
  }
  assert.equal(seo({ q: '' }).robots.index, true);
  assert.equal(seo({ q: 'carbon & exhaust' }).alternates.canonical, '/shop?q=carbon+%26+exhaust');
});

test('tracking parameters are excluded without blocking real catalogue pages', () => {
  const result = seo({ page: '2', utm_source: 'instagram', gclid: 'tracking' });
  assert.equal(result.alternates.canonical, '/shop?page=2');
  assert.equal(result.robots.index, true);
});

test('collection canonicals retain their path and actual in-stock page count', () => {
  const stock = products.filter(product => product.availableForSale);
  const result = catalogSeo('/collections/in-stock', { page: '4' }, stock, true);
  assert.equal(result.page, 2);
  assert.equal(result.alternates.canonical, '/collections/in-stock?page=2');
  assert.equal(result.robots.index, false);
});

test('first query value matches the catalogue selection and preview stays noindex', () => {
  assert.equal(seo({ page: ['2', '4'] }).alternates.canonical, '/shop?page=2');
  assert.equal(seo({ page: '2' }, false).robots.index, false);
  assert.equal(catalogSeo('/collections/empty', {}, [], true).alternates.canonical, '/collections/empty');
});

test('Cayenne selector counts and catalogue pages share trim and body fitment', () => {
  const gtsFit = 'e3_2_gts';
  const common = { vendor: 'TECHART', productType: 'Spoiler', tags: ['make_porsche', 'model_cayenne', `fit_${gtsFit}`] };
  const shared = { ...common, handle: 'techart-front-spoiler-i-for-porsche-cayenne-e3-1-e3-2' };
  const coupeOnly = { ...common, handle: 'techart-rear-spoiler-for-coupe-for-porsche-cayenne-e3-1-e3-2' };
  const unverified = { ...common, handle: 'new-cayenne-part' };
  const wrongGeneration = { ...shared, tags: ['make_porsche', 'model_cayenne', 'fit_e3_2_turbo_s_e_hybrid'] };
  const gtsParts = [...Array(24).fill(shared), coupeOnly, unverified, wrongGeneration];
  const [, e32] = cayenneOptions(gtsParts);
  const [suv, coupe] = e32.bodies;
  assert.deepEqual(suv.choices.map(choice => [choice.fit, choice.count]), [[gtsFit, 24]]);
  assert.deepEqual(coupe.choices.map(choice => [choice.fit, choice.count]), [[gtsFit, 25]]);

  const query = { brand: 'techart', make: 'porsche', model: 'cayenne', fit: gtsFit, body: 'suv', page: '2' };
  assert.equal(vehicleBodyMatch(unverified, techartSelection(query)), 'review');
  assert.equal(catalogSeo('/shop', query, gtsParts, true).page, 1);
  assert.equal(catalogSeo('/shop', { ...query, body: 'coupe' }, gtsParts, true).page, 2);
});

test('Targa cards use the correct names, generation and GTS fitment aliases', () => {
  const fixture = (handle, fit) => ({ handle, vendor: 'TECHART', tags: ['model_911', `fit_${fit}`] });
  const parts = [
    fixture('earlier-targa', '992_1_carrera_4'),
    fixture('generic-carrera-tag', '992_2_carrera_4'),
    fixture('targa-4s', '992_2_carrera_4s'),
    fixture('shared-4gts', '992_2_carrera_4_gts'),
    fixture('targa-specific-gts', '992_2_carrera_targa_gts'),
  ];
  const [, , early, latest] = vehicleOptions(parts);
  const targaChoices = generation => generation.bodies.find(body => body.key === 'targa').choices;
  assert.deepEqual(targaChoices(early).map(choice => choice.name), ['Targa 4']);
  assert.deepEqual(targaChoices(latest).map(choice => choice.name), ['Targa 4S', 'Targa 4 GTS']);

  const filters = { brand: 'techart', model: '911', fit: '992_2_carrera_4_gts' };
  assert.deepEqual(filterProducts(parts, { ...filters, body: 'targa' }).map(part => part.handle), ['shared-4gts', 'targa-specific-gts']);
  assert.deepEqual(filterProducts(parts, { ...filters, body: 'coupe' }).map(part => part.handle), ['shared-4gts']);
});
