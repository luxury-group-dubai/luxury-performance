# Separate 992.1 GT3 RS and S/T selections

Audited 8 November 2026 against the local manufacturer price list `lxp-shopify/Techart Pricelists/Pricelist_911_992_2026_Q4_INT.pdf` and the existing body-fitment audit in `docs/techart-911-body-fitment-2026-q4.json`.

## Vehicle names and source tags

GT3 RS and S/T are separate 992.1 Coupé choices, with independent images and canonical keys `992_1_gt3_rs` and `992_1_st`. The source catalogue combines them in the “911 GT3RS | S/T” applicability column. Both choices consider the existing `fit_992_1_gt3_rs_st` product tag as well as their own model-specific tag. A part tagged only for one canonical model is not included for the other.

The old `992_1_gt3_rs_st` URL remains addressable as a catalogue group, but it is not offered as a vehicle card or normal model-filter choice. Its confirmed parts are the union of the two audited model decisions; unresolved equipment remains under review. S/T is restricted to 992.1 Coupé, and a missing body parameter defaults these special-model selections to Coupé so it cannot bypass their fitment decisions.

## Confirmed shared applications

All 16 currently tagged products have a positive 992.1 mark in the manufacturer's combined GT3 RS / S/T column. The source pages include towing loop (2), hood emblem (4), roof spoiler/rear window/rear lettering (7), mirror trims (9), exhaust controls/tailpipes (10–11), roof liner (15), floor mats (17), and interior kits (19). The exact current handle registry is in `lib/shop/techart-rs-st-fitment.json`.

Two equipment conditions require per-model treatment:

| Product | Source | GT3 RS | S/T | Reason |
| --- | --- | --- | --- | --- |
| Carbon Interior Kit IV, 092.421.080.009G | Page 19 | Review | Allowed | The source excludes the aluminum PDK selector lever from Exclusive Manufaktur. The GT3 RS equipment selection is unknown; the manual-transmission S/T does not have a PDK selector. This is not an exclusion of all PDK cars. |
| Carbon Interior Kit VIII, 092.421.131.009G | Page 19 | Review | Review | The source excludes bucket seats. The actual seat configuration has not been selected. |

The other 14 registered handles are approved for both models. This yields 14 confirmed GT3 RS listings and 15 confirmed S/T listings from the current 16-item source group, with two and one respective configuration reviews. The mirror-trim SKU 092.121.330.009G is RHD (the LHD counterpart is 092.121.320.009G). Drive-side floor-mat choice and original-versus-TECHART exhaust requirements still apply to the product specification; neither model choice removes those requirements.

## Future listings and verification

The shared source tag alone cannot approve a new part. Unregistered handles default to `review`, and a canonical model-specific tag cannot leak into the other model's candidate list. Existing body restrictions continue to exclude Cabriolet and Targa.

`tests/shop-seo.test.mjs` covers separate names/images, shared aliases, canonical-tag isolation, equipment reviews, no-body URLs, count/catalogue agreement, retained legacy URLs, and exclusion of S/T from 991 and 992.2 lineups.
