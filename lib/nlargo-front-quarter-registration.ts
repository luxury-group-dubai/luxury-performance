// Fixed inverse registration of the light exposure to the red exposure. Each
// control is [destination x, destination y, source offset x, source offset y]
// in the 3200 × 2133 release image, after the existing vertical correction.
// Wheel/sill controls are averages of matched photographic landmarks. Zero
// controls keep the roof, nose and studio background from following the rear.
const controls = [
  [942.796, 1116.121, -11.235, 3.134],
  [930.064, 1152.560, -12.380, 4.036],
  [963.349, 1165.018, -10.645, 3.515],
  [1317.161, 1305.343, -.879, 2.277],
  [1519.986, 1221.242, .799, .454],
  [1506.703, 1270.882, 1.199, 1.784],
  [1490.226, 1317.348, 1.270, 1.926],
  [1699, 1224.5, 1, .5], [1930, 1234.5, 0, .5],
  [2262, 1204.5, 3, .5],
  [900, 920, 0, 0], [1200, 900, 0, 0], [1600, 900, 0, 0],
  [1800, 1000, 0, 0], [2300, 1400, 0, 0],
  [650, 1100, 0, 0], [900, 1500, 0, 0], [1600, 1600, 0, 0],
  [0, 0, 0, 0], [3200, 0, 0, 0], [0, 2133, 0, 0], [3200, 2133, 0, 0],
];

export const registrationSize = 128;
export const registrationRange = 32;

// Generate a small displacement map once. The photograph remains untouched;
// the GPU performs one additional filtered lookup, with no animated warping.
export function frontQuarterRegistration() {
  const pixels = new Uint8Array(registrationSize * registrationSize * 4);
  for (let y = 0; y < registrationSize; y++) {
    for (let x = 0; x < registrationSize; x++) {
      const px = (x + .5) / registrationSize * 3200;
      const py = (y + .5) / registrationSize * 2133;
      let weight = 0, dx = 0, dy = 0;
      for (const [cx, cy, ox, oy] of controls) {
        const distanceSquared = (px - cx) ** 2 + (py - cy) ** 2;
        const influence = 1 / Math.max(1, distanceSquared ** 2);
        weight += influence; dx += ox * influence; dy += oy * influence;
      }
      const index = (y * registrationSize + x) * 4;
      pixels[index] = Math.round(128 + dx / weight / registrationRange * 127);
      pixels[index + 1] = Math.round(128 + dy / weight / registrationRange * 127);
      pixels[index + 3] = 255;
    }
  }
  return pixels;
}
