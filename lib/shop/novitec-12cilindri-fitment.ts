import type { CatalogProduct } from './types';

// Matched existing catalogue SKUs against NOVITEC's Spider parts lists, 2026-11-16:
// https://www.novitecgroup.com/en/brands/ferrari/12-cilindri/12cilindri-spider/
// Keep the rear spoiler out until its Coupé-only store description is resolved.
// Use an explicit list so newly imported generic 12Cilindri parts aren't auto-approved.
const spiderProducts = new Set([
  'novitec-frontspoiler-visible-carbon-12cilindri',
  'novitec-air-intake-engine-bonnet-carbon-12cilindri',
  'novitec-insert-engine-bonnet-carbon-12cilindri',
  'novitec-air-intake-front-fenders-carbon-12cilindri',
  'novitec-front-attachment-original-look-carbon-12cilindri',
  'novitec-mirror-covers-carbon-12cilindri',
  'novitec-side-panels-set-original-look-carbon-12cilindri',
  'novitec-diffuser-original-look-carbon-12cilindri',
  'novitec-cover-engine-compartment-original-look-carbon-12cilindri',
  'novitec-airfilter-housing-original-look-carbon-12cilindri',
  'novitec-ferrari-12cilindri-f1-012-10',
  'novitec-ferrari-12cilindri-f1-012-11',
  'novitec-ferrari-12cilindri-f1-012-70',
  'novitec-ferrari-12cilindri-f1-012-17',
  'novitec-ferrari-12cilindri-f1-012-16',
  'novitec-ferrari-12cilindri-f1-012-15',
  'novitec-ferrari-12cilindri-f1-012-88',
  'novitec-ferrari-12cilindri-f1-012-80',
  'novitec-ferrari-12cilindri-f1-012-90',
  'novitec-ferrari-12cilindri-f5-012-31',
  'novitec-ferrari-12cilindri-f5-012-10',
  'novitec-ferrari-12cilindri-f5-012-15',
  'novitec-ferrari-12cilindri-f4-012-70',
  'novitec-ferrari-12cilindri-f4-012-62',
  'novitec-ferrari-12cilindri-f4-012-22',
  'front-spoiler-without-front-camera-ferrari-12cilindri-f6-012-31-novitec',
]);

export function is12CilindriSpiderProduct(product: Pick<CatalogProduct, 'handle'>) {
  return spiderProducts.has(product.handle);
}
