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
const { novitecModelProducts, novitecModelScope, novitecModelFamily } = load(resolve(root, 'lib/shop/novitec-models.ts'));
const { prepareNovitecProgramme, prepareNovitecShop, novitecArticleNumbers } = load(resolve(root, 'lib/shop/novitec-programme.ts'));
const { normalizeNovitecFilters, novitecFilterVariants } = load(resolve(root, 'lib/shop/novitec-variants.ts'));

const programmePart = (article, productType = 'Exhaust') => ({
  id: article, title: 'NOVITEC part ' + article, handle: 'part-' + article.replaceAll(' ', '-'),
  vendor: 'NOVITEC', productType, tags: ['car_ferrari', 'model_12cilindri'],
  priceRange: { minVariantPrice: { amount: article.endsWith('10') ? '200' : '100' } },
});

test('NOVITEC model order follows publisher sequence rather than article number', () => {
  const parts = ['F1 012 10', 'F1 012 88', 'F1 012 11', 'F1 012 90', 'F1 012 80'].map(article => programmePart(article));
  assert.deepEqual(prepareNovitecProgramme(parts, '12cilindri_coupe').map(p => p.id),
    ['F1 012 11', 'F1 012 10', 'F1 012 80', 'F1 012 90', 'F1 012 88']);
  assert.deepEqual(prepareNovitecProgramme(parts, '12cilindri_spider').map(p => p.id),
    ['F1 012 10', 'F1 012 11', 'F1 012 80', 'F1 012 90', 'F1 012 88']);
});

test('NOVITEC abbreviated article variants match their published product group', () => {
  assert.deepEqual(novitecArticleNumbers('F4 012 00 / 01 / 70 / 96 /97'),
    ['F401200', 'F401201', 'F401270', 'F401296', 'F401297']);
  const parts = [programmePart('F4-012-62', 'Wheels'), programmePart('F4 012 70', 'Wheels')];
  assert.deepEqual(prepareNovitecProgramme(parts, '12cilindri_coupe').map(p => p.id), ['F4 012 70', 'F4-012-62']);
});

test('F8 reflectors sit with aerodynamic bodywork rather than a standalone special-parts section', () => {
  const reflector = { ...programmePart('F9 444 06', 'Accessories'), title: 'NOVITEC - Reflector for Ferrari F8 Tributo / F8 Spider - F9 444 06', tags: ['car_ferrari', 'model_f8'] };
  for (const version of ['f8_tributo', 'f8_spider']) {
    const prepared = prepareNovitecProgramme([reflector], version);
    assert.equal(prepared[0].programmeCategory, 'Aerodynamics');
    assert.equal(filterProducts(prepared, { category: 'Aerodynamics' }).length, 1);
    assert.equal(filterProducts(prepared, { category: 'Special Parts' }).length, 0);
  }
});

test('NOVITEC groups retain every item, preserve source products and allow price sorting', () => {
  const parts = [programmePart('F6 012 21', 'Aerodynamics'), programmePart('F5 012 31', 'Suspension'),
    programmePart('F4 012 70', 'Wheels'), programmePart('F1 012 10'), programmePart('F1 012 11'), programmePart('unlisted part')];
  const prepared = prepareNovitecProgramme(parts, '12cilindri_coupe');
  assert.equal(prepared.length, parts.length);
  assert.equal(parts[0].programmeCategory, undefined);
  assert.deepEqual([...new Set(prepared.map(p => p.programmeCategory))], ['Performance & Exhaust', 'Wheels', 'Suspension', 'Aerodynamics']);
  const selected = filterProducts(prepared, { category: 'Performance & Exhaust', sort: 'price-up' });
  assert.equal(selected.length, 3);
  assert.equal(selected.at(-1).id, 'F1 012 10');
  assert.equal(filterProducts(prepared, { category: 'Exhaust' }).length, 3);
  assert.equal(filterProducts(parts, { category: 'Exhaust' }).length, 3);
});

test('NOVITEC shop groups mixed models without changing other supplier tabs or counts', () => {
  const coupe = ['F1 012 10', 'F1 012 11'].map(article => programmePart(article));
  const f8 = ['F1 444 41', 'F1 444 40'].map(article => ({ ...programmePart(article), tags: ['car_ferrari', 'model_f8'] }));
  const wheel = programmePart('F4 012 70', 'Wheels');
  const other = { ...programmePart('other exhaust'), vendor: 'CAPRISTO' };
  const products = [wheel, f8[0], coupe[0], other, f8[1], coupe[1]];
  const prepared = prepareNovitecShop(products, { brand: 'novitec' });
  assert.deepEqual(filterProducts(prepared, { brand: 'novitec' }).map(p => p.id),
    ['F1 012 11', 'F1 012 10', 'F1 444 40', 'F1 444 41', 'F4 012 70']);
  assert.equal(prepared.length, products.length);
  assert.equal(prepared.find(p => p.vendor === 'CAPRISTO'), other);
  assert.equal(prepareNovitecShop(products, { brand: 'capristo' }), products);
  assert.deepEqual(filterProducts(prepared, { brand: 'novitec', category: 'Performance & Exhaust', model: 'f8' }).map(p => p.id), ['F1 444 40', 'F1 444 41']);
  assert.deepEqual(prepareNovitecShop(coupe, { brand: 'novitec', model: '12cilindri', body: 'spider' }).map(p => p.id), ['F1 012 10', 'F1 012 11']);
});

test('legacy 812 links select the family and correct variant, including exclusive fitment', () => {
  const filters = normalizeNovitecFilters({ brand: 'novitec', make: 'ferrari', model: '812_gts', category: 'Aerodynamics' });
  assert.deepEqual(filters, { brand: 'novitec', make: 'ferrari', model: '812', body: 'gts', category: 'Aerodynamics' });
  assert.deepEqual(novitecFilterVariants(filters).map(v => v.name), ['812 Superfast', '812 GTS']);
  const shared = { ...programmePart('F6 812 01', 'Aerodynamics'), title: 'Front spoiler for 812 Superfast and GTS', tags: ['car_ferrari', 'model_812_superfast', 'model_812_gts'] };
  const coupe = { ...shared, title: 'Rear spoiler for 812 Superfast' };
  const spider = { ...shared, title: 'Rear spoiler for 812 GTS' };
  assert.deepEqual(filterProducts([shared, coupe, spider], filters), [shared, spider]);
  assert.deepEqual(filterProducts([shared, coupe, spider], { ...filters, body: 'superfast' }), [shared, coupe]);
  assert.equal(filterProducts([shared, coupe, spider], { ...filters, body: undefined }).length, 3);
  assert.equal(updateFilters(filters, { model: 'f8' }).body, undefined);
});

test('12Cilindri Spider filter uses verified shared fitment without the Coupé spoiler', () => {
  const shared = { ...programmePart('F1 012 10'), handle: 'novitec-ferrari-12cilindri-f1-012-10' };
  const coupe = { ...programmePart('F6 012 25'), handle: 'novitec-rearspoiler-carbon-12cilindri-coupe' };
  const filters = { brand: 'novitec', make: 'ferrari', model: '12cilindri', body: 'spider' };
  assert.deepEqual(filterProducts([shared, coupe], filters), [shared]);
  assert.deepEqual(filterProducts([shared, coupe], { ...filters, body: 'coupe' }), [shared, coupe]);
});

test('Urus and Cullinan families offer catalogue variants with distinct model tags', () => {
  for (const [make, family, variantTags] of [['lamborghini', 'urus', ['urus', 'urus_s', 'urus_performante']], ['rolls_royce', 'cullinan', ['cullinan', 'cullinan_series_ii']]]) {
    const products = variantTags.map(model => ({ ...programmePart(model), tags: ['car_' + make, 'model_' + model] }));
    const filters = { brand: 'novitec', make, model: family };
    assert.equal(filterProducts(products, filters).length, products.length);
    for (const variant of novitecFilterVariants(filters)) {
      assert.deepEqual(filterProducts(products, { ...filters, body: variant.key }).map(p => p.id), [variant.tag]);
    }
  }
  assert.equal(novitecFilterVariants({ brand: 'novitec', make: 'ferrari', model: 'purosangue' }).length, 0);
});

test('12Cilindri Spider includes verified shared parts and excludes conflicting or unknown fitment', () => {
  const part = { title: '12Cilindri part', vendor: 'NOVITEC', tags: ['car_ferrari', 'model_12cilindri'] };
  const exhaust = { ...part, handle: 'novitec-ferrari-12cilindri-f1-012-10' };
  const spring = { ...part, handle: 'novitec-ferrari-12cilindri-f5-012-31' };
  const coupeSpoiler = { ...part, handle: 'novitec-rearspoiler-carbon-12cilindri-coupe' };
  const unknown = { ...part, handle: 'new-unverified-12cilindri-part' };
  const otherBrand = { ...exhaust, vendor: 'CAPRISTO' };
  const catalogue = [exhaust, spring, coupeSpoiler, unknown, otherBrand];
  assert.deepEqual(novitecModelProducts(catalogue, 'ferrari', '12cilindri_spider'), [exhaust, spring]);
  assert.deepEqual(novitecModelProducts(catalogue, 'ferrari', '12cilindri_coupe'), [exhaust, spring, coupeSpoiler, unknown]);
  assert.deepEqual(novitecModelScope('ferrari', '12cilindri_spider'), { brand: 'novitec', make: 'ferrari', model: '12cilindri' });
  assert.equal(novitecModelFamily('ferrari', '12cilindri_spider'), '12cilindri');
});
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
