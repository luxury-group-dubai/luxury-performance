# Carrera and targa script artwork

Updated 7 November 2026. Both wordmarks now come from original flat Porsche Design Timepieces configurator artwork. The previous badge-photo and archive traces are superseded.

## Carrera

- Official source: https://timepiecesconfigurator.porsche-design.com/configurator/resources/images/M0001/VST/992_Schriftzug_911_Carrera.png
- Original PNG: 2507 × 271 pixels, transparent background, flat black artwork.
- Only the disjoint Carrera lettering was isolated from the separate 911 prefix. Original letter contours, counters and proportions are preserved; no photographed shape was reconstructed.
- Local file: `carrera.svg`, viewBox `0 0 1851 227`.

## targa

- Official source: https://timepiecesconfigurator.porsche-design.com/configurator/resources/images/M0001/VST/992_Schriftzug_911_targa_4_GTS%20Kopie.png
- Original PNG: 3290 × 313 pixels, flat black artwork on white.
- Only targa was isolated; the 911 prefix and 4 GTS suffix were excluded. A one-pixel bitmap bridge to 911 was separated, then the original boundary pixels were restored. No letterform reconstruction or perspective adjustment was used.
- Local file: `targa.svg`, viewBox `0 0 1276 292`.

## Vector preparation and verification

The exact bitmap silhouettes were converted to smooth Bézier outlines with Potrace (threshold 128, optTolerance 0.15). Both were inspected at 1200 pixels wide against the original graphics, then in the vehicle cards. Each SVG has a transparent background and uniform #111111 fill. These are faithful traces of Porsche's original flat artwork, not Porsche-distributed SVG master files or substitute fonts.
