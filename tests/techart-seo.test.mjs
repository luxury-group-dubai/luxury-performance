import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/shop/techart-seo.ts', import.meta.url), 'utf8');
const compiled = { exports: {} };
new Function('exports', ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(compiled.exports);
const { techartShopMetadata } = compiled.exports;

test('TECHART model search destinations have distinct metadata and self canonicals', () => {
  const titles = new Set();
  for (const model of ['911', 'cayenne']) {
    const metadata = techartShopMetadata({ brand: 'techart', make: 'porsche', model }, {}, true);
    assert.equal(metadata.robots.index, true);
    assert.equal(metadata.alternates.canonical, `/shop/techart/porsche/${model}`);
    assert.match(metadata.title, /Dubai/);
    titles.add(metadata.title);
  }
  assert.equal(titles.size, 2);
});

test('TECHART body and trim selections consolidate to the model destination', () => {
  const scope = { brand: 'techart', make: 'porsche', model: '911', body: 'coupe' };
  const metadata = techartShopMetadata(scope, { fit: '992_2_carrera' }, true);
  assert.equal(metadata.robots.index, false);
  assert.equal(metadata.robots.follow, true);
  assert.equal(metadata.alternates.canonical, '/shop/techart/porsche/911');
});

test('filtered, duplicate make-only and non-live TECHART pages stay out of the index', () => {
  const scope = { brand: 'techart', make: 'porsche', model: 'cayenne' };
  for (const query of [{ category: 'Wheels' }, { generation: 'e3_2' }, { choose: '1' }, { page: '2' }, { sort: 'price-up' }]) {
    assert.equal(techartShopMetadata(scope, query, true).robots.index, false);
  }
  const makeOnly = techartShopMetadata({ brand: 'techart', make: 'porsche' }, {}, true);
  assert.equal(makeOnly.alternates.canonical, '/shop/techart');
  assert.equal(makeOnly.robots.index, false);
  assert.equal(techartShopMetadata(scope, {}, false).robots.index, false);
  assert.equal(techartShopMetadata(scope, { utm_source: 'newsletter' }, true).robots.index, true);
});
