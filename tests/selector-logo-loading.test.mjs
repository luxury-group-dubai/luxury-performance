import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const compiled = ts.transpileModule(readFileSync(new URL('../lib/selector-logo-bootstrap.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const compiledModule = { exports: {} };
new Function('exports', compiled)(compiledModule.exports);
const script = compiledModule.exports.selectorLogoBootstrap;

function setup(specs) {
  const events = {};
  let observerCallback;
  let disconnected = false;
  class Image {
    constructor(logo, loaded) { this.logo = logo; this.complete = loaded; this.naturalWidth = loaded ? 100 : 0; }
    closest() { return this.logo; }
  }
  const logos = specs.map(states => {
    const logo = { dataset: {}, end: true, querySelector() { return this.end ? {} : null; }, querySelectorAll() { return this.images; } };
    logo.images = states.map(loaded => new Image(logo, loaded));
    return logo;
  });
  const context = {
    window: {}, HTMLImageElement: Image,
    document: { documentElement: {}, querySelectorAll: () => logos, addEventListener: (name, handler) => { events[name] = handler; } },
    MutationObserver: class { constructor(callback) { observerCallback = callback; } observe() {} disconnect() { disconnected = true; } },
  };
  function load(logo, index = 0) {
    const image = logos[logo].images[index];
    image.complete = true; image.naturalWidth = 100;
    events.load({ target: image });
  }
  return { logos, load, start: () => vm.runInNewContext(script, context), finish: () => events.DOMContentLoaded(), disconnected: () => disconnected, parsed: logo => observerCallback([{ addedNodes: [{ nodeType: 1, closest: () => logo, querySelectorAll: () => [] }] }]) };
}

test('one logo reveals before another finishes, without React hydration', () => {
  const page = setup([[false], [false]]); page.start();
  page.load(0);
  assert.equal(page.logos[0].dataset.logoLoaded, 'true');
  assert.equal(page.logos[1].dataset.logoLoaded, undefined);
  page.load(1);
  assert.equal(page.logos[1].dataset.logoLoaded, 'true');
});
test('compound logos wait only for their own pieces', () => {
  const page = setup([[false, false], [false]]); page.start();
  page.load(0, 0); page.load(1);
  assert.equal(page.logos[0].dataset.logoLoaded, undefined);
  assert.equal(page.logos[1].dataset.logoLoaded, 'true');
  page.load(0, 1);
  assert.equal(page.logos[0].dataset.logoLoaded, 'true');
});
test('streamed markup must include the whole logo before revealing', () => {
  const page = setup([[true]]); page.logos[0].end = false; page.start();
  assert.equal(page.logos[0].dataset.logoLoaded, undefined);
  page.logos[0].end = true; page.parsed(page.logos[0]);
  assert.equal(page.logos[0].dataset.logoLoaded, 'true');
});
test('cached logos appear immediately and broken images retain text', () => {
  const page = setup([[true], [false]]);
  page.logos[1].images[0].complete = true;
  page.start();
  assert.equal(page.logos[0].dataset.logoLoaded, 'true');
  assert.equal(page.logos[1].dataset.logoLoaded, undefined);
  page.finish(); assert.equal(page.disconnected(), true);
});
