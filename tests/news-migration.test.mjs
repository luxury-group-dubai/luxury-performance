import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cache = new Map();
function load(path) {
  if (!path.endsWith('.ts')) path += '.ts';
  if (cache.has(path)) return cache.get(path);
  const compiled = { exports: {} };
  const { outputText } = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } });
  new Function('require', 'module', 'exports', outputText)(specifier => load(resolve(dirname(path), specifier)), compiled, compiled.exports);
  cache.set(path, compiled.exports);
  return compiled.exports;
}
const { newsArticles, legacyNovitecNewsSlug } = load(resolve(root, 'lib/news.ts'));
const { novitecStories } = load(resolve(root, 'lib/novitec-stories.ts'));

test('every legacy story maps to a unique shared article without losing content', () => {
  assert.equal(newsArticles.length, novitecStories.length);
  assert.equal(new Set(newsArticles.map(article => article.slug)).size, newsArticles.length);
  for (const story of novitecStories) {
    const slug = legacyNovitecNewsSlug(story.slug);
    const article = newsArticles.find(item => item.slug === slug);
    assert.ok(article, story.slug);
    assert.equal(article.detail, story.detail);
    assert.deepEqual(article.sections, story.sections);
    assert.equal(article.link, story.link);
    assert.match(slug, /^novitec-(ferrari|lamborghini)-/);
    for (const image of [article.image, article.cardImage, ...article.gallery]) assert.ok(existsSync(resolve(root, 'public', image.slice(1))), image);
  }
});
test('unknown legacy slugs cannot redirect to unrelated articles', () => {
  assert.equal(legacyNovitecNewsSlug('not-a-real-story'), undefined);
});
