import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/exhaust-render-budget.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
const api = {};
new Function('exports', outputText)(api);

test('large and high-DPR displays stay within the 1.6 megapixel render budget', () => {
  for (const [width, height, dpr] of [[1440, 900, 1], [1920, 1080, 2], [3840, 2160, 3], [7680, 4320, 2]]) {
    const ratio = api.exhaustPixelRatio(width, height, dpr);
    assert.ok(ratio <= dpr && ratio <= 1.5);
    assert.ok(width * height * ratio ** 2 <= 1_600_001);
  }
  assert.equal(api.exhaustPixelRatio(800, 400, 1), 1);
  assert.equal(api.exhaustPixelRatio(800, 400, NaN), 1);
});

test('software renderers use the poster while hardware and private adapter names remain supported', () => {
  for (const adapter of ['ANGLE (Google, Vulkan SwiftShader Device)', 'llvmpipe (LLVM)', 'softpipe', 'Software Rasterizer', 'lavapipe']) assert.equal(api.isSoftwareRenderer(adapter), true);
  for (const adapter of ['ANGLE (Apple, ANGLE Metal Renderer: Apple M3)', 'NVIDIA GeForce RTX', 'AMD Radeon', 'WebKit WebGL', null]) assert.equal(api.isSoftwareRenderer(adapter), false);
});
