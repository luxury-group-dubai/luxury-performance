import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { PassThrough } from 'node:stream';
import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../app/partners/[slug]/page.tsx', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
});
const partner = { slug: 'valvetronic', supplier: 'valvetronic', name: 'Valvetronic Designs', intro: 'Partner introduction', detail: 'Fitment support', image: '/hero.webp', imageAlt: 'Exhaust' };
const emptyComponent = () => null;
function page(catalogue) {
  const modules = {
    react: React,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/navigation': { notFound() { throw new Error('Not found'); } },
    'next/image': { __esModule: true, default: emptyComponent, getImageProps: () => ({ props: {} }) },
    'next/link': { __esModule: true, default: ({ href, children }) => React.createElement('a', { href }, children) },
    '@/lib/partners': { partners: [partner] },
    '@/lib/brand-hero-images': { partnerHeroImages: {}, hasPartnerHeroOverlay: () => false },
    '@/lib/shop/storefront': { getCatalog: () => catalogue },
    '@/lib/shop/taxonomy': { filterUrl: () => '/shop?brand=valvetronic', categoryOf: () => 'Exhausts', suppliers: [] },
    '@/lib/techart-range': { techartRange: [] },
    '@/components/ui': {
      ArrowLink: ({ href, children }) => React.createElement('a', { href }, children),
      Eyebrow: emptyComponent,
    },
    '../partners.module.css': { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) },
  };
  const exports = {};
  new Function('exports', 'require', outputText)(exports, name => {
    if (modules[name]) return modules[name];
    return new Proxy({}, { get: () => emptyComponent });
  });
  return exports.default;
}

test('partner hero streams while catalogue and filter parameters are still pending', async (t) => {
  let resolveCatalogue, resolveQuery;
  const catalogue = new Promise(resolve => { resolveCatalogue = resolve; });
  const query = new Promise(resolve => { resolveQuery = resolve; });
  const Page = page(catalogue);
  const output = new PassThrough();
  let html = '';
  const firstChunk = new Promise(resolve => {
    output.on('data', chunk => { html += chunk.toString(); resolve(); });
  });
  const complete = new Promise(resolve => output.on('end', resolve));
  let stream;
  try {
    stream = renderToPipeableStream(React.createElement(Page, {
      params: Promise.resolve({ slug: 'valvetronic' }), searchParams: query,
    }), { onShellReady() { stream.pipe(output); } });
    await Promise.race([
      firstChunk,
      new Promise((_, reject) => {
        const timeout = setTimeout(() => reject(new Error('Hero waited for Shopify')), 1000);
        t.after(() => clearTimeout(timeout));
      }),
    ]);
    assert.match(html, /id="partner-title"/);
    assert.match(html, /src="\/hero.webp"/);
    assert.match(html, /Shop Valvetronic Designs/);
    assert.doesNotMatch(html, /Partner introduction/);

    resolveCatalogue([]);
    resolveQuery({});
    await complete;
    assert.match(html, /Partner introduction/);
    assert.match(html, /No parts are currently listed online/);
  } finally {
    resolveCatalogue([]);
    resolveQuery({});
    stream?.abort();
  }
});
