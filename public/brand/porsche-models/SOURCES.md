# Porsche model lettering sources

Retrieved 7 November 2026 for the TECHART vehicle-card preview, with additional user-supplied references added 8 November. Sources include Porsche SVG assets and vector traces documented below; keep original proportions.

## Model signatures

These filenames are from Porsche Design System 4.10.1's `p-model-signature` asset map, as used on the official Porsche 911 GT3 page:
https://www.porsche.com/usa/models/911/911-gt3-models/911-gt3/

| Local file | Official source |
| --- | --- |
| `cayenne.svg` | https://cdn.ui.porsche.com/porsche-design-system/model-signatures/cayenne.2556201.svg |
| `911.svg` | https://cdn.ui.porsche.com/porsche-design-system/model-signatures/911.b68f913.svg |
| `gt3.svg` | https://cdn.ui.porsche.com/porsche-design-system/model-signatures/gt3.bd3186c.svg |
| `gt3-rs.svg` | https://cdn.ui.porsche.com/porsche-design-system/model-signatures/gt3-rs.03ac3ee.svg |
| `turbo-s.svg` | https://cdn.ui.porsche.com/porsche-design-system/model-signatures/turbo-s.73f1e10.svg |

## Model-designation glyphs

`4.svg`, `gt.svg`, `gts.svg`, `s.svg`, `t.svg`, and `turbo.svg` come from the inline SVG assets of Porsche's “Understand the differences” → “Model designations” panel:
https://models.porsche.com/en-US/model-start/911

Verified public script containing the original encoded glyphs:
https://www.porsche.com/pcom-model-pages-isr/_astro/ModelOverview.RtVPcf32.js?dpl=dpl_8vDhKXqM899n9zWpWsQ5rHgv7b4m

The current official model-signature asset map does not include Carrera, Targa, e-hybrid, Dakar, S/T or GT3 Touring signatures. Additional emblem sources and vector reproductions are documented in SCRIPT-SOURCES.md, EHYBRID-SOURCES.md and DAKAR-SOURCES.md. Touring uses the original Timepieces artwork documented below. Dakar uses the user-supplied 911 Dakar graphic. S/T uses a vector trace of the official wheel-emblem artwork documented below.

## Touring script

`touring.svg` is traced from the exact flat black silhouette in the official Porsche Design Timepieces configurator artwork supplied by the user:
https://timepiecesconfigurator.porsche-design.com/configurator/resources/images/M0007/VST/911%20GT3%20Touring.png

Original PNG: 3084 × 1734 pixels. Only the `touring` lettering was isolated; the surrounding plaque frame and separate GT3 wordmark were excluded. Potrace threshold 128, optTolerance 0.15. Final SVG viewBox: 1140 × 188. Inspected at 1100 pixels wide and vehicle-card sizes. The original Porsche GT3 SVG is retained alongside it; no substitute Touring font is used.

## S/T outline emblem

`st.svg` reproduces the outlined S/T lettering visible on Porsche Design Timepieces’ official 911 S/T wheel/rotor artwork:
https://timepiecesconfigurator.porsche-design.com/configurator/resources/images/M4003/VST/20230206_911_ST_Brilliantsilber.png

Retrieved 8 November 2026. Original image: 400 × 400 pixels; the straight, front-facing emblem occupies approximately 64 × 25 pixels in its central cap. The lettering was isolated from crop `166,185,68,30`, enlarged 2× for thresholding, and converted to smooth Bézier contours with Potrace (`threshold=82` on the original grayscale foreground, `alphaMax=1.3`, `optTolerance=0.8`). Final viewBox: `0 0 129 49`; transparent background and uniform #111111 fill. The three outlined glyphs and their transparent counters are retained. This is a trace of the wheel graphic, not a Porsche-distributed SVG master or substitute typeface.

The separately named `M4003/VST/911 ST.png` was inspected and rejected: it depicts the circular 60 Years 911 anniversary graphic, not the S/T lettering.
