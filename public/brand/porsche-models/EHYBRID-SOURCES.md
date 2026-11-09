# e-hybrid lettering source

Updated 8 November 2026 using the e-hybrid wordmark in the Porsche Philippines poster supplied by the user. This replaces the prior black-on-white trace and its manually angled stroke ends.

- Source attachment: `Insta_Saver_@porsche_philippines_post_DdfYK_JJB_N_image_1.jpg`.
- Original image: 1600 × 2000 pixels.
- Source SHA-256: `a242ae95af5ccd393df0fb9710c88223d428fa32caca6d309708cade643ffaf7`.
- Extracted only the e-hybrid lettering region at (955,510), width 515, height 90. The surrounding Cayenne and Porsche logos and car photograph are excluded.
- Vectorized this crop with Potrace at grayscale threshold 128, alphaMax 1 and optTolerance 0.1. The source supplies the angled caps, curves, letter proportions and stroke weights; no substitute font, manual cap shear or aspect-ratio distortion is used.
- Transparent background, uniform #111111 fill. Four exterior components (e, dash, hybrid and i dot) and three counters (e, b and d).
- Local SVG: `e-hybrid.svg`, viewBox `12 10 492 71`, width 492, height 71. Three source pixels of clearance around the ink.
- Intrinsic dimensions in `components/shop/vehicle-picker.tsx` match the SVG. Existing responsive display widths are retained.
- Full outline visually compared against the cropped poster and inspected enlarged. Binary raster overlap with the crop at threshold 128 is approximately 96.40%; the source lettering is only about 65 pixels high, so enlarged edges retain photographic ambiguity.

This is a vector trace from the supplied poster, not a Porsche-distributed SVG master. The earlier chrome badge and flat-wordmark traces are superseded.
