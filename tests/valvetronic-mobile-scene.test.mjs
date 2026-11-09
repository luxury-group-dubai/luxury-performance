import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function compile(file, dependencies, globals = {}) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const exports = {};
  new Function('exports', 'require', ...Object.keys(globals), outputText)(
    exports, name => {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected dependency: ${name}`);
    }, ...Object.values(globals),
  );
  return exports;
}
const { valvetronicIntroPose } = compile('../components/partners/valvetronic-intro-motion.ts', {});

for (const mode of ['phone', 'tablet', 'coarse-pointer', 'reduced-motion', 'desktop']) {
  test(`${mode} selects the appropriate exhaust rendering without eagerly importing Three.js`, () => {
    const updates = [], cleanup = [];
    let observers = 0;
    const matches = query =>
      query.includes('prefers-reduced-motion') && query.includes('pointer: coarse') ? mode !== 'desktop'
        : query.includes('prefers-reduced-motion') ? mode === 'reduced-motion'
        : query.includes('pointer: coarse') ? ['phone', 'tablet', 'coarse-pointer'].includes(mode)
          : query.includes('700px') ? mode === 'phone' : false;
    const component = compile('../components/partners/valvetronic-intro-exhaust.tsx', {
      react: {
        useRef: () => ({ current: null }),
        useSyncExternalStore: (_, snapshot) => snapshot(),
        useState: initial => [initial, value => updates.push(value)],
        useEffect: effect => { const dispose = effect(); if (dispose) cleanup.push(dispose); },
      },
      'react/jsx-runtime': require('react/jsx-runtime'),
      'next/image': { default: () => null },
      './valvetronic-intro-motion': { valvetronicIntroPose },
      './valvetronic-intro-exhaust.module.css': { default: {} },
    }, {
      matchMedia: query => ({ matches: matches(query), addEventListener() {}, removeEventListener() {} }),
      IntersectionObserver: class {
        constructor() { observers++; }
        disconnect() {}
      },
      document: { hidden: false, addEventListener() {}, removeEventListener() {} },
      cancelAnimationFrame() {},
    });
    const figure = component.ValvetronicIntroExhaust();
    if (mode === 'desktop') {
      assert.equal(observers, 1);
      assert.deepEqual(updates, []);
    } else {
      assert.equal(observers, 0);
      assert.deepEqual(updates, []);
      assert.equal(figure.props['data-scene-status'], 'static');
      assert.equal(figure.props['data-intro-revealed'], true);
    }
    const poster = figure.props.children[1];
    const picture = poster.type(poster.props);
    assert.match(picture.props.children[0].props.srcSet, /settled-mobile\.webp$/);
    assert.equal(picture.props.children[0].props.media, '(max-width: 700px)');
    for (const dispose of cleanup) dispose();
  });
}
