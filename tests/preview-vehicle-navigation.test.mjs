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
const { buildVehicleChoices } = load(resolve(root, 'app/preview/shop/vehicle-data.ts'));
const { prepareBrandCatalogue } = load(resolve(root, 'app/preview/shop/brand-catalogue.ts'));
const { vehicleChoiceHref } = load(resolve(root, 'app/preview/shop/vehicle-navigation.ts'));
const part = (vendor, make, model, title = `${vendor} exhaust`) => ({ id: `${vendor}-${make}-${model}`, title, vendor, tags: [`make_${make}`, `model_${model}`] });

test('vehicle entry includes manufacturers beyond the old navigation list', () => {
  const choices = buildVehicleChoices([
    part('Capristo', 'alfa_romeo', '4c'), part('Capristo', 'bentley', 'bentayga'),
    part('Capristo', 'maserati', 'mc20'), part('Valvetronic Designs', 'toyota', 'supra'),
    part('Valvetronic Designs', 'subaru', 'wrx'),
  ]);
  assert.deepEqual(Object.keys(choices).sort(), ['alfa_romeo', 'bentley', 'maserati', 'subaru', 'toyota']);
  assert.equal(choices.subaru[0].name, 'WRX');
});
test('single-brand models open products and multiple brands open brand selection', () => {
  const choices = buildVehicleChoices([part('Capristo', 'toyota', 'supra'), part('Valvetronic Designs', 'toyota', 'supra'), part('Valvetronic Designs', 'subaru', 'wrx')]);
  assert.equal(vehicleChoiceHref('toyota', choices.toyota[0]), '/shop/vehicles/toyota/supra');
  const target = new URL(vehicleChoiceHref('subaru', choices.subaru[0]), 'https://example.com');
  assert.equal(target.pathname, '/shop/valvetronic/subaru/wrx');
});
test('collectible-only vehicles do not become parts manufacturers', () => {
  const choices = buildVehicleChoices([part('Collectibles', 'bugatti', 'chiron'), part('Capristo', 'maserati', 'mc20')]);
  assert.equal(choices.bugatti, undefined);
  assert.equal(choices.maserati.length, 1);
});
test('Corvette remains under Chevrolet after shared catalogue preparation', () => {
  const product = part('Valvetronic Designs', 'corvette', 'c8', 'Chevrolet Corvette C8 exhaust');
  product.tags.push('make_chevrolet');
  const choices = buildVehicleChoices(prepareBrandCatalogue([product]));
  assert.deepEqual(Object.keys(choices), ['chevrolet']);
  assert.equal(choices.chevrolet[0].name, 'Corvette C8');
});
