import { readdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

// Bake the ripple once: loading cards need no canvas, WebGL or animated filters.
const groups = {
  novitec: [
    ...(await readdir('public/images/novitec-models/official-covers')).filter(name => name.endsWith('.jpg')).map(name => `/images/novitec-models/official-covers/${name}`),
    ...['coupe', 'spider', 'nlargo'].map(name => `/images/novitec-models/12cilindri-${name}-side.jpg`),
  ],
  porsche: (await readdir('public/vehicle-selector/porsche')).filter(name => name.endsWith('.webp')).map(name => `/vehicle-selector/porsche/${name}`),
};
for (const [group, sources] of Object.entries(groups)) {
  const placeholders = {};
  for (const src of sources) {
    const { data, info } = await sharp(`public${src}`).resize({ width: 192 }).flatten({ background: '#fff' }).greyscale().raw().toBuffer({ resolveWithObject: true });
    const { width, height } = info;
    const output = Buffer.alloc(width * height * 4);
    const sample = (x, y) => data[Math.max(0, Math.min(height - 1, Math.round(y))) * width + Math.max(0, Math.min(width - 1, Math.round(x)))];
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const sx = x + 1.6 * Math.sin(y * 1.25 + x * .35);
      const sy = y + 1.5 * Math.sin(x * .95 + y * .3);
      const shade = sample(sx, sy);
      const edge = Math.abs(sample(sx - 1, sy) - sample(sx + 1, sy)) + Math.abs(sample(sx, sy - 1) - sample(sx, sy + 1));
      // Black ink with alpha gives the same pale outline without a white matte.
      output[(y * width + x) * 4 + 3] = Math.round(Math.min(125, (255 - shade) * .13 + edge * .62));
    }
    const image = await sharp(output, { raw: { width, height, channels: 4 } }).webp({ quality: 35, alphaQuality: 20 }).toBuffer();
    placeholders[src] = `data:image/webp;base64,${image.toString('base64')}`;
  }
  await writeFile(`lib/generated/${group}-selector-placeholders.json`, JSON.stringify(placeholders));
  console.log(`${group}: ${sources.length} placeholders, ${Math.round(JSON.stringify(placeholders).length / 1024)} KB`);
}
