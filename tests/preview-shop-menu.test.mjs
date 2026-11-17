import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const modules = new Map();
function load(path) {
  if (path.endsWith('shop-menu-cards')) return { MenuLogo: ({ item }) => React.createElement('span', null, item.name) };
  if (path.endsWith('shop/manufacturer-logo')) return { ManufacturerLogo: ({ name }) => React.createElement('span', null, name) };
  if (path.endsWith('.css')) return {};
  if (extname(path) === '.json') return JSON.parse(readFileSync(path, 'utf8'));
  if (!extname(path)) path += existsSync(path + '.ts') ? '.ts' : '.tsx';
  if (modules.has(path)) return modules.get(path).exports;
  const compiled = { exports: {} }; modules.set(path, compiled);
  const { outputText } = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true } });
  new Function('require', 'module', 'exports', outputText)(specifier => {
    if (specifier === 'next/link') return ({ href, children, prefetch, ...props }) => React.createElement('a', { ...props, href }, children);
    if (specifier.startsWith('@/')) return load(resolve(root, specifier.slice(2)));
    if (specifier.startsWith('.')) return load(resolve(dirname(path), specifier));
    return require(specifier);
  }, compiled, compiled.exports);
  return compiled.exports;
}
const { PreviewShopMenu } = load(resolve(root, 'components/preview-shop-menu.tsx'));
const { previewShopBrands, previewPopularVehicles, previewStockLinks } = load(resolve(root, 'app/preview/shop/navigation.ts'));
const props = { selected: 'brands', select() {}, close() {} };
const render = overrides => renderToStaticMarkup(React.createElement(PreviewShopMenu, { ...props, ...overrides }));

test('shop brands link to shopping or explicitly labelled enquiries', () => {
  for (const brand of ['novitec', 'capristo', 'valvetronic', 'gintani', 'techart']) {
    assert(previewShopBrands.find(item => item.artwork === brand).href.startsWith('/shop/'));
  }
  for (const brand of ['fi-exhaust', 'liberty-walk', 'voltrix']) {
    const item = previewShopBrands.find(item => item.artwork === brand);
    assert(item.href.startsWith('/contact?programme=')); assert.equal(item.note, 'Private enquiry');
  }
  assert(!previewShopBrands.some(item => item.href.startsWith('/partners/')));
});
test('manufacturer shortcuts preserve the selected make and provide the complete directory', () => {
  for (const item of previewPopularVehicles) {
    const url = new URL(item.href, 'https://example.com');
    assert.equal(url.pathname, `/shop/vehicles/${item.make.replaceAll('_', '-')}`);
  }
  assert(render({ selected: 'vehicles' }).includes('href="/shop/vehicles"'));
});
test('stock links open the correct stock groups', () => {
  assert.deepEqual(previewStockLinks.map(item => new URL(item.href, 'https://example.com').searchParams.get('stock_group')), [null, 'used', 'urban']);
  const html = render({ selected: 'stock' });
  assert(html.includes('Used OEM parts')); assert(html.includes('URBAN kits'));
});
test('full navigation shows brands immediately with the same three tabs on all screen sizes', () => {
  const html = render({ fullNavigation: true });
  assert(!html.includes('<details'));
  assert(html.includes('href="/shop"'));
  assert(html.includes('role="tablist"'));
  assert(html.includes('aria-label="Shop NOVITEC"'));
  assert(!html.includes('SHOP OVERVIEW'));
});
test('desktop arrow keys traverse all three tabs and wrap correctly', () => {
  const changes = [], focused = [];
  const original = global.document;
  global.document = { getElementById: id => ({ focus: () => focused.push(id) }) };
  try {
    function flatten(node) { return Array.isArray(node) ? node.flatMap(flatten) : React.isValidElement(node) ? [node, ...flatten(node.props.children)] : []; }
    const buttons = flatten(PreviewShopMenu({ ...props, select: tab => changes.push(tab) })).filter(node => node.props.role === 'tab');
    assert.equal(buttons.length, 3);
    for (const [index, key] of [[1, 'ArrowRight'], [2, 'ArrowRight'], [0, 'ArrowLeft'], [0, 'End'], [2, 'Home']]) buttons[index].props.onKeyDown({ key, preventDefault() {} });
    assert.deepEqual(changes, ['stock', 'brands', 'stock', 'stock', 'brands']);
    assert.equal(focused.length, 5);
  } finally { global.document = original; }
});
