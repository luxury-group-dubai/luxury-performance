import type { CatalogProduct } from './types';

export type CayenneBody = 'suv' | 'coupe';
type BodyEvidence = CayenneBody | 'both';
type GenerationEvidence = readonly [e31: BodyEvidence | null, e32: BodyEvidence | null];

// The TECHART Q4 2026 price lists (CAY_E3, MAGNUM_E3.2 and MAGNUM_SPORT_E3.2)
// are archived in lxp-shopify/Techart Pricelists. Their marked trim columns cover
// Hatchback (SUV) and Coupé unless a row or footnote specifies a body restriction.
// Each handle below was matched to its listed base part numbers. Apply current
// catalogue generation and trim tags before consulting this body evidence.
const evidenceByHandle: Record<string, GenerationEvidence> = {
  // CAY_E3 pp. 2–3. The rear apron requires the applicable bumper conversion.
  'techart-front-spoiler-i-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-carbon-front-grille-for-porsche-cayenne-e3-2': [null, 'both'],
  'techart-sportdesign-front-apron-retrofit-for-porsche-cayenne-e3-2': [null, 'both'],
  'techart-air-intake-frames-for-porsche-cayenne-e3-1-turbo-gt': ['coupe', null],
  'techart-aero-engine-hood-for-porsche-cayenne-e3-1': ['both', null],
  'techart-aero-engine-hood-for-porsche-cayenne-e3-2': [null, 'both'],
  'techart-carbon-side-mirror-trims-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-door-panels-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-aero-wings-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-rear-apron-with-diffuser-for-porsche-cayenne-e3-1': ['both', null],
  'techart-rear-diffuser-add-on-with-aero-wings-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-sportdesign-rear-diffuser-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-four-fast-fins-rear-diffuser-add-on-for-porsche-cayenne-e3-2': [null, 'both'],

  // CAY_E3 pp. 4–5 and MAGNUM/MAGNUM Sport pp. 3–4 contain the spoiler footnotes.
  'techart-carbon-diffuser-add-on-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-four-fast-fins-upgrade-set-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-turbo-roof-spoiler-for-porsche-cayenne-e3-1-e3-2': ['suv', 'suv'],
  'techart-roof-spoiler-for-fixed-oe-spoiler-for-porsche-cayenne-e3-1-e3-2': ['suv', 'suv'],
  'techart-roof-spoiler-end-plates-for-coupe-for-porsche-cayenne-e3-1-e3-2': ['coupe', 'coupe'],
  'techart-rear-spoiler-panel-for-hatchback-for-porsche-cayenne-e3-1-e3-2': ['suv', 'suv'],
  'techart-rear-aero-curtains-for-coupe-for-porsche-cayenne-e3-1-e3-2': ['coupe', 'coupe'],
  'techart-rear-spoiler-for-coupe-for-porsche-cayenne-e3-1-e3-2': ['coupe', 'coupe'],
  'techart-rear-lettering-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],

  // CAY_E3 pp. 5–7 and MAGNUM/MAGNUM Sport pp. 4–5.
  'techart-power-kit-techtronic-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-power-kit-ta-09y-t2-for-turbo-for-porsche-cayenne-e3-1': ['both', null],
  'techart-power-kit-upgrade-ta-09y-t1-to-t2-for-turbo-for-porsche-cayenne-e3-1': ['both', null],
  'techart-sport-air-filter-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-exhaust-flap-control-with-remote-for-porsche-cayenne-e3-1': ['both', 'both'],
  'techart-valve-controlled-sport-rear-muffler-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-centre-muffler-replacement-pipe-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-post-cat-pipe-for-porsche-cayenne-e3-2': [null, 'both'],
  'techart-titanium-tailpipe-kit-with-carbon-trim-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-spring-kit-for-porsche-cayenne-e3-1': ['both', null],

  // CAY_E3 pp. 8–10. Daytona II/III include Coupé-specific rear spacer conditions.
  'techart-formula-vi-22-inch-forged-wheel-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-daytona-ii-22-inch-wheel-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-daytona-iii-23-inch-forged-wheel-for-porsche-cayenne-e3-2': [null, 'both'],
  'techart-floor-mat-set-4-pieces-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-trunk-mat-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],
  'techart-illuminated-door-entry-guards-for-porsche-cayenne-e3-1-e3-2': ['both', 'both'],

  // MAGNUM/MAGNUM Sport pp. 2–7. The catalogue retains their conversion requirements.
  'techart-aero-hood-with-air-duct-for-porsche-cayenne-e3-2': [null, 'both'],
  'techart-carbon-roof-spoiler-coupe-for-porsche-cayenne-e3-2': [null, 'coupe'],
  'techart-daytona-iii-surge-carbon-inlays-for-porsche-cayenne-e3-2': [null, 'both'],
  'techart-tire-pressure-ecu-kit-for-porsche-cayenne-e3-2': [null, 'both'],
  'techart-magnum-fender-set-for-porsche-cayenne-e3-2': [null, 'both'],
  'techart-magnum-aero-kit-for-porsche-cayenne-e3-2': [null, 'both'],
  'techart-magnum-sport-aero-kit-for-porsche-cayenne-e3-2': [null, 'both'],
  'techart-magnum-center-exit-rear-muffler-for-porsche-cayenne-e3-2': [null, 'both'],
  'techart-magnum-led-door-projectors-for-porsche-cayenne-e3-2': [null, 'both'],
  'techart-prestige-interior-package-for-porsche-cayenne-e3-2': [null, 'both'],

  // Shared Porsche listings use the Cayenne marks in CAY_E3 and MAGNUM/MAGNUM Sport.
  'techart-tpms-sensor-kit-porsche-911-991-2': ['both', 'both'],
  'techart-techart-front-hood-emblem-black-for-porsche-911-992-1-000-965-202-blk': ['both', 'both'],
  'techart-led-door-projectors-for-porsche-911-992-2': ['both', 'both'],
};

export function cayenneBodyMatch(product: Pick<CatalogProduct, 'handle'>, fit: string, body: CayenneBody): 'allowed' | 'excluded' | 'review' {
  const generation = /^(e3_[12])(?:_|$)/.exec(fit)?.[1];
  if (!generation) return 'review';
  if (fit === `${generation}_turbo_gt` && body === 'suv') return 'excluded';

  // The E3.2 base Cayenne tag for this listing has no matching marked base SKU.
  if (fit === 'e3_2_cayenne' && product.handle === 'techart-valve-controlled-sport-rear-muffler-for-porsche-cayenne-e3-1-e3-2') return 'review';

  const evidence = evidenceByHandle[product.handle]?.[generation === 'e3_1' ? 0 : 1];
  if (!evidence) return 'review';
  return evidence === 'both' || evidence === body ? 'allowed' : 'excluded';
}
