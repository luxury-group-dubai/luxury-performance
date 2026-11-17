import sharp from 'sharp';

const logos = [
  ['gintani.png', 400],
  ['fi-exhaust-lettering.png', 300],
  ['liberty-walk-symbol.png', 80],
  ['liberty-walk-lettering.png', 330],
  ['collectibles-wordmark-script-white.png', 320],
];
for (const [name, width] of logos) {
  await sharp(`public/brand/${name}`).resize({ width, withoutEnlargement: true }).webp({ quality: 85 }).toFile(`public/brand/selectors/${name.replace('.png', '.webp')}`);
}
// Bake the same luminance-to-alpha conversion used by the existing SVG filter.
const { data, info } = await sharp('public/brand/voltrix.jpg').resize({ width: 400 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  data[i + 3] = Math.round(255 - (.2126 * data[i] + .7152 * data[i + 1] + .0722 * data[i + 2]));
  data[i] = data[i + 1] = data[i + 2] = 255;
}
await sharp(data, { raw: info }).webp({ quality: 85 }).toFile('public/brand/selectors/voltrix.webp');
