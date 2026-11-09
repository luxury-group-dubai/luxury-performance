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
const { bodyMatch, filterBodyProducts, is911Fit, is911LineupFit, techartSelection, vehicleBodyMatch, vehicleName, vehicleNames, vehicleOptions } = load(resolve(root, 'lib/shop/techart-fitment.ts'));
const { filterProducts, fitLabel, fitOptions, techartFitKeys } = load(resolve(root, 'lib/shop/taxonomy.ts'));
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
  assert.equal(targaChoices(early)[0].image.src, '/vehicle-selector/porsche/911-9921-targa-carrera_4.webp');
  assert.deepEqual(targaChoices(latest).map(choice => choice.name), ['Targa 4S', 'Targa 4 GTS']);

  const filters = { brand: 'techart', model: '911', fit: '992_2_carrera_4_gts' };
  assert.deepEqual(filterProducts(parts, { ...filters, body: 'targa' }).map(part => part.handle), ['shared-4gts', 'targa-specific-gts']);
  assert.deepEqual(filterProducts(parts, { ...filters, body: 'coupe' }).map(part => part.handle), ['shared-4gts']);
});

test('broad parts tags cannot create older-model cards under 992.2', () => {
  const parts = ['991_1', '991_2', '992_1', '992_2'].flatMap(generation => Object.keys(vehicleNames).map(trim => ({
    handle: `${generation}-${trim}`, tags: [`fit_${generation}_${trim}`],
  })));
  const options = vehicleOptions(parts);
  const [, , earlier, latest] = options;
  const choices = body => latest.bodies.find(item => item.key === body).choices;
  assert.deepEqual(choices('coupe').map(choice => choice.fit.slice(6)), [
    'carrera', 'carrera_t', 'carrera_s', 'carrera_4s', 'carrera_gts', 'carrera_4_gts',
    'turbo_s', 'gt3_with_wing', 'gt3_gt3_touring',
  ]);
  assert.deepEqual(choices('cabriolet').map(choice => choice.fit.slice(6)), [
    'carrera', 'carrera_t', 'carrera_s', 'carrera_4s', 'carrera_gts', 'carrera_4_gts', 'turbo_s',
  ]);
  assert.equal(latest.bodies.flatMap(body => body.choices).length, 18);
  for (const generation of options) {
    for (const body of generation.bodies) {
      for (const choice of body.choices) {
        assert.match(choice.image.src, /^\/vehicle-selector\/porsche\/911-/);
        assert.ok(choice.image.src.includes(`-${body.key}-`));
        assert.ok(readFileSync(resolve(root, 'public', choice.image.src.slice(1))).length > 0);
      }
    }
  }
  assert.equal(earlier.bodies.find(body => body.key === 'cabriolet').choices.some(choice => choice.fit.endsWith('_carrera_t')), false);
  assert.equal(earlier.bodies.find(body => body.key === 'coupe').choices.some(choice => choice.fit.endsWith('_turbo')), true);
  const olderCoupe = earlier.bodies.find(body => body.key === 'coupe').choices;
  assert.ok(olderCoupe.find(choice => choice.fit === '992_1_dakar').image.src.endsWith('911-9921-coupe-dakar.webp'));
  assert.ok(olderCoupe.find(choice => choice.fit === '992_1_gt3_rs').image.src.endsWith('911-9921-coupe-gt3_rs.webp'));
  assert.ok(olderCoupe.find(choice => choice.fit === '992_1_st').image.src.endsWith('911-9921-coupe-st.webp'));
  assert.equal(options.flatMap(generation => generation.bodies.flatMap(body => body.choices)).some(choice => choice.fit.endsWith('_gt3_rs_st')), false);
  assert.equal(is911LineupFit('992_2_turbo'), false);
  assert.equal(is911Fit('992_2_turbo'), true); // Existing shop URLs remain addressable.
});

test('992.1 GT3 RS and S/T are distinct cars backed by audited shared catalogue parts', () => {
  const commonFit = '992_1_gt3_rs_st', rsFit = '992_1_gt3_rs', stFit = '992_1_st';
  const part = (handle, fit = commonFit) => ({ handle, vendor: 'TECHART', tags: ['make_porsche', 'model_911', `fit_${fit}`] });
  const shared = part('techart-techart-front-hood-emblem-black-for-porsche-911-992-1-000-965-202-blk');
  const rsOnly = part('techart-roof-spoiler-for-porsche-911-992-1-092-100-600-009', rsFit);
  const stOnly = part('techart-techart-floor-mat-sets-for-lhd-for-porsche-911-992-1-092-410-401-ccc', stFit);
  const selectorDependent = part('techart-carbon-interior-kit-iv-graphite-gray-for-porsche-911-992-1-092-421-080-009g');
  const seatDependent = part('techart-carbon-interior-kit-viii-glossy-for-porsche-911-992-1-092-421-131-009g');
  const unknown = part('future-unverified-shared-rs-st-part');
  const parts = [shared, rsOnly, stOnly, selectorDependent, seatDependent, unknown];
  const query = fit => ({ brand: 'techart', make: 'porsche', model: '911', fit, body: 'coupe' });
  const confirmed = fit => filterBodyProducts(filterProducts(parts, query(fit)), techartSelection(query(fit)));

  assert.deepEqual(techartFitKeys(rsFit), [rsFit, commonFit]);
  assert.deepEqual(techartFitKeys(stFit), [stFit, commonFit]);
  assert.deepEqual(confirmed(rsFit).map(part => part.handle), [shared, rsOnly].map(part => part.handle));
  assert.deepEqual(confirmed(stFit).map(part => part.handle), [shared, stOnly, selectorDependent].map(part => part.handle));
  assert.equal(filterProducts(parts, query(rsFit)).includes(stOnly), false);
  assert.equal(filterProducts(parts, query(stFit)).includes(rsOnly), false);
  assert.equal(bodyMatch(selectorDependent, rsFit, 'coupe'), 'review');
  assert.equal(bodyMatch(selectorDependent, stFit, 'coupe'), 'allowed');
  for (const fit of [rsFit, stFit]) {
    assert.equal(bodyMatch(unknown, fit, 'coupe'), 'review');
    assert.equal(bodyMatch(seatDependent, fit, 'coupe'), 'review');
    assert.equal(bodyMatch(shared, fit, 'cabriolet'), 'excluded');
    assert.equal(bodyMatch(shared, fit, 'targa'), 'excluded');
    assert.deepEqual(filterBodyProducts(filterProducts(parts, query(fit)), techartSelection({ ...query(fit), body: undefined })), confirmed(fit));
  }

  const choices = vehicleOptions(parts)[2].bodies.find(body => body.key === 'coupe').choices;
  assert.deepEqual(choices.map(choice => [choice.fit, choice.name, choice.count]), [[rsFit, 'GT3 RS', 2], [stFit, 'S/T', 3]]);
  assert.ok(choices[0].image.src.endsWith('911-9921-coupe-gt3_rs.webp'));
  assert.ok(choices[1].image.src.endsWith('911-9921-coupe-st.webp'));
  assert.equal(vehicleName(rsFit, 'coupe'), '911 992.1 GT3 RS · Coupé');
  assert.equal(vehicleName(stFit, 'coupe'), '911 992.1 S/T · Coupé');
  assert.equal(fitLabel(rsFit), '992.1 GT3 RS');
  assert.equal(fitLabel(stFit), '992.1 S/T');
  assert.equal(fitLabel(commonFit), '992.1 GT3 RS / S/T');

  const options = fitOptions(parts, { brand: 'techart', model: '911' });
  assert.ok(options.includes(rsFit) && options.includes(stFit));
  assert.equal(options.filter(fit => is911LineupFit(fit)).includes(commonFit), false);
  assert.equal(is911Fit(commonFit), true); // Existing shared catalogue links still work.
  assert.equal(is911LineupFit(commonFit), false);
  const legacy = query(commonFit);
  assert.deepEqual(filterBodyProducts(filterProducts(parts, legacy), techartSelection(legacy)).map(part => part.handle), [shared, selectorDependent].map(part => part.handle));
});

test('S/T is offered only as a 992.1 coupe, never synthesized from other generations', () => {
  const parts = ['991_1', '991_2', '992_1', '992_2'].flatMap(generation => ['st', 'gt3_rs_st'].map(trim => ({
    handle: 'future-special-fitment-fixture', vendor: 'TECHART', tags: ['make_porsche', 'model_911', `fit_${generation}_${trim}`],
  })));
  const options = vehicleOptions(parts);
  for (const generation of options) {
    const st = generation.bodies.flatMap(body => body.choices.filter(choice => choice.name === 'S/T').map(choice => ({ choice, body: body.key })));
    assert.equal(st.length, generation.key === '992_1' ? 1 : 0);
    if (st.length) assert.equal(st[0].body, 'coupe');
  }
  for (const generation of ['991_1', '991_2', '992_2']) {
    assert.equal(is911Fit(`${generation}_st`), false);
    assert.equal(is911LineupFit(`${generation}_st`), false);
  }
});

test('price-list body evidence restores older Carrera parts without admitting restricted spoilers', () => {
  const fit = '991_1_carrera';
  const handles = [
    'techart-front-spoiler-i-for-porsche-911-991-1',
    'techart-side-mirror-trims-for-porsche-911-991-1',
    'techart-sport-exhaust-with-chrome-tailpipes-for-porsche-911-991-1',
    'techart-sport-spring-kit-for-porsche-911-991-1',
    'techart-roof-spoiler-for-porsche-911-991-1',
    'techart-rear-spoiler-ii-for-porsche-911-991-1',
  ];
  const parts = handles.map(handle => ({ handle, vendor: 'TECHART', tags: ['make_porsche', 'model_911', `fit_${fit}`] }));
  const [earlier] = vehicleOptions(parts);
  const choice = body => earlier.bodies.find(item => item.key === body).choices.find(item => item.fit === fit);
  assert.equal(choice('coupe').count, 6);
  assert.equal(choice('cabriolet').count, 5);
  for (const body of ['coupe', 'cabriolet']) {
    assert.equal(filterProducts(parts, { brand: 'techart', model: '911', fit, body })
      .filter(product => bodyMatch(product, fit, body) === 'allowed').length, choice(body).count);
  }
  const targaFit = '991_1_carrera_4';
  assert.equal(bodyMatch({ handle: handles[0] }, targaFit, 'targa'), 'allowed');
  assert.equal(bodyMatch({ handle: handles[4] }, targaFit, 'targa'), 'excluded');
  assert.equal(bodyMatch({ handle: handles[5] }, targaFit, 'targa'), 'excluded');
  assert.equal(bodyMatch({ handle: 'new-unverified-part' }, fit, 'coupe'), 'review');
});

test('992 manufacturer body columns and variant-specific restrictions are preserved', () => {
  const spoiler = { handle: 'techart-rear-spoiler-iii-for-porsche-911-992-2-turbo-s' };
  assert.equal(bodyMatch(spoiler, '992_2_turbo_s', 'coupe'), 'allowed');
  assert.equal(bodyMatch(spoiler, '992_2_turbo_s', 'cabriolet'), 'allowed');
  const roofLiner = { handle: 'techart-roof-liner-unit-for-porsche-911-992-1-092-407-300-997' };
  assert.equal(bodyMatch(roofLiner, '992_1_carrera_4s', 'targa'), 'allowed');
  const roofSpoiler = { handle: 'techart-roof-spoiler-for-porsche-911-992-1-092-100-600-009' };
  assert.equal(bodyMatch(roofSpoiler, '992_1_carrera_4s', 'targa'), 'excluded');
  // A model tag alone cannot substitute for a positive generation mark in the PDF.
  const unconfirmedWheels = { handle: 'techart-formula-vi-race-wheel-set-for-porsche-911-992-2-turbo-turbo-s' };
  assert.equal(bodyMatch(unconfirmedWheels, '992_2_turbo_s', 'coupe'), 'review');
});

test('rear-wing GT3 selections include confirmed shared parts and reject Touring-only parts', () => {
  const commonFit = '992_1_gt3_gt3_touring';
  const wingFit = '992_1_gt3_with_wing';
  const part = (handle, fit = commonFit) => ({ handle, vendor: 'TECHART', tags: ['make_porsche', 'model_911', `fit_${fit}`] });
  const parts = [
    part('techart-techart-floor-mat-sets-for-lhd-for-porsche-911-992-1-092-410-401-ccc'),
    part('techart-rear-spoiler-iii-carbon-for-porsche-911-992-1-992-2-gt3-with-rear-wing', wingFit),
    part('techart-rear-spoiler-i-for-porsche-911-992-1-092-100-800-009'),
    part('techart-rear-spoiler-iii-for-porsche-911-992-1-092-100-820-009'),
    part('new-unverified-gt3-part'),
  ];
  const query = { brand: 'techart', model: '911', fit: wingFit, body: 'coupe' };
  const candidates = filterProducts(parts, query);
  assert.equal(candidates.length, 5);
  const matched = filterBodyProducts(candidates, techartSelection(query));
  assert.deepEqual(matched.map(item => item.handle), parts.slice(0, 2).map(item => item.handle));
  const choice = vehicleOptions(parts)[2].bodies.find(body => body.key === 'coupe').choices.find(item => item.fit === wingFit);
  assert.equal(choice.count, matched.length);
  assert.equal(bodyMatch(parts[2], wingFit, 'coupe'), 'excluded');
  assert.equal(bodyMatch(parts[4], wingFit, 'coupe'), 'review');
  assert.deepEqual(filterBodyProducts(candidates, techartSelection({ ...query, body: undefined })), matched);
  const touring = { ...query, fit: commonFit };
  assert.deepEqual(filterBodyProducts(filterProducts(parts, touring), techartSelection(touring)).map(item => item.handle), [parts[0], parts[2], parts[3]].map(item => item.handle));
  assert.equal(bodyMatch(parts[1], commonFit, 'coupe'), 'excluded');
});

test('GT3 selectors use Porsche model names and keep legacy fit keys addressable', () => {
  const parts = ['991_1', '991_2', '992_1', '992_2'].map(generation => ({
    handle: 'gt3-lineup-fixture', vendor: 'TECHART', tags: ['make_porsche', 'model_911', `fit_${generation}_gt3_gt3_touring`],
  }));
  const choices = vehicleOptions(parts).map(generation => generation.bodies.find(body => body.key === 'coupe').choices);
  assert.deepEqual(choices[0].map(choice => choice.name), ['GT3']);
  for (const generation of choices.slice(1)) {
    assert.deepEqual(generation.map(choice => choice.name), ['GT3', 'GT3 Touring']);
    assert.ok(generation[0].image.src.endsWith('911-coupe-gt3_with_wing.webp'));
    assert.ok(generation[1].image.src.endsWith('911-coupe-gt3_gt3_touring.webp'));
  }
  assert.ok(choices[0][0].image.src.endsWith('911-coupe-gt3_with_wing.webp'));
  assert.equal(vehicleName('991_1_gt3_gt3_touring', 'coupe'), '911 991.1 GT3 · Coupé');
  assert.equal(vehicleName('992_2_gt3_with_wing', 'coupe'), '911 992.2 GT3 · Coupé');
  assert.equal(vehicleName('992_2_gt3_gt3_touring', 'coupe'), '911 992.2 GT3 Touring · Coupé');
  assert.equal(fitLabel('991_1_gt3_gt3_touring'), '991.1 GT3');
  assert.equal(fitLabel('992_2_gt3_with_wing'), '992.2 GT3');
  assert.equal(fitLabel('992_2_gt3_gt3_touring'), '992.2 GT3 Touring');
  const filters = { brand: 'techart', make: 'porsche', model: '911' };
  const fits = fitOptions(parts, filters);
  assert.ok(fits.includes('991_2_gt3_with_wing'));
  assert.ok(fits.includes('992_2_gt3_with_wing'));
  assert.equal(fits.includes('991_1_gt3_with_wing'), false);
});

test('991.2 Touring excludes fixed-wing hardware and keeps uncertain rear panels under review', () => {
  const wingFit = '991_2_gt3_with_wing', touringFit = '991_2_gt3_gt3_touring';
  const trim = { handle: 'techart-carbon-rear-spoiler-trims-porsche-911-991-2-gt3' };
  assert.equal(bodyMatch(trim, wingFit, 'coupe'), 'allowed');
  assert.equal(bodyMatch(trim, touringFit, 'coupe'), 'excluded');
  const intake = { handle: 'techart-carbon-air-intake-panel-porsche-911-991-2-gt3' };
  assert.equal(bodyMatch(intake, wingFit, 'coupe'), 'allowed');
  assert.equal(bodyMatch(intake, touringFit, 'coupe'), 'review');
  const wheelSet = { handle: 'techart-formula-iv-race-20-inch-wheel-set-for-porsche-911-991-1' };
  assert.equal(bodyMatch(wheelSet, wingFit, 'coupe'), 'review');
  assert.equal(bodyMatch(wheelSet, touringFit, 'coupe'), 'review');
});
