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
  assert.equal(target, '/shop/techart/porsche/911/992-2/targa/carrera-4-gts');
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

const { parseTechartPath } = load(resolve(root, 'lib/shop/techart-routes.ts'));
const { techartStep, techartBodies } = load(resolve(root, 'lib/shop/techart-steps.ts'));
test('TECHART links express each selection step without fit query parameters', () => {
  const base = { make: 'porsche', model: '911' };
  assert.equal(shopBrandHref('techart', base), '/shop/techart/porsche/911');
  assert.equal(shopBrandHref('techart', { ...base, generation: '992_2' }), '/shop/techart/porsche/911/992-2');
  assert.equal(shopBrandHref('techart', { ...base, generation: '992_2', body: 'coupe' }), '/shop/techart/porsche/911/992-2/coupe');
  const full = shopBrandHref('techart', { ...base, fit: '992_2_carrera_t', body: 'coupe', category: 'Exhaust', sort: 'price-up' });
  assert.equal(full, '/shop/techart/porsche/911/992-2/coupe/carrera-t?category=Exhaust&sort=price-up');
  assert.deepEqual(shopPathFilters(full.split('?')[0]), { brand: 'techart', make: 'porsche', model: '911', generation: '992_2', body: 'coupe', fit: '992_2_carrera_t' });
});
test('TECHART GT3, Touring, RS, S/T, Targa and Cayenne hybrid fit keys round-trip', () => {
  for (const [model, fit, body] of [
    ['911','991_1_gt3_gt3_touring','coupe'], ['911','991_2_gt3_with_wing','coupe'],
    ['911','992_1_gt3_gt3_touring','coupe'], ['911','992_1_gt3_rs','coupe'], ['911','992_1_st','coupe'],
    ['911','992_2_carrera_4_gts','targa'], ['cayenne','e3_2_s_e_hybrid','suv'], ['cayenne','e3_1_turbo_gt','coupe'],
  ]) {
    const url = shopBrandHref('techart', { make:'porsche', model, fit, body });
    const parsed = shopPathFilters(url);
    assert.equal(parsed.fit, fit, url); assert.equal(parsed.body, body, url);
  }
  assert.equal(parseTechartPath('911', ['e3-2','coupe','s']), undefined);
  assert.equal(parseTechartPath('cayenne', ['992-2','suv','s']), undefined);
  assert.equal(parseTechartPath('911', ['992-2','suv']), undefined);
});

test('TECHART step validation rejects unavailable choices and skips single options', () => {
  const choice = { fit:'992_2_gt3_with_wing', name:'GT3', count:24, image:{src:'/car.webp',width:800,height:270} };
  const options = [{key:'992_2',name:'992.2',bodies:[{key:'coupe',name:'Coupé',choices:[choice]}]}];
  const base = {brand:'techart',make:'porsche',model:'911'};
  assert.equal(techartStep(options,base).next.generation,'992_2');
  assert.equal(techartStep(options,{...base,generation:'992_2'}).next.body,'coupe');
  assert.equal(techartStep(options,{...base,generation:'992_2',body:'coupe'}).next.fit,choice.fit);
  assert.equal(techartStep(options,{...base,body:'coupe',fit:choice.fit}).choice.fit,choice.fit);
  assert.equal(techartStep(options,{...base,generation:'991_1'}).invalid,true);
  assert.equal(techartStep(options,{...base,generation:'992_2',body:'targa'}).invalid,true);
  assert.equal(techartStep(options,{...base,body:'coupe',fit:'992_2_carrera_t'}).invalid,true);
});
test('Cayenne Turbo GT remains a distinct trim under the Coupé body', () => {
  const bodies = techartBodies({ key:'e3_2',name:'E3.2', bodies:[
    {key:'coupe',name:'Coupé',choices:[{fit:'e3_2_cayenne',name:'Cayenne',count:20}]},
    {key:'coupe',name:'Turbo GT',choices:[{fit:'e3_2_turbo_gt',name:'Turbo GT',count:21}]},
  ]});
  assert.equal(bodies.length,1); assert.equal(bodies[0].name,'Coupé');
  assert.deepEqual(bodies[0].choices.map(item=>item.fit),['e3_2_cayenne','e3_2_turbo_gt']);
});
