/** Bound the landing-page scene independently of display size and device DPR. */
export function exhaustPixelRatio(width: number, height: number, devicePixelRatio: number) {
  const nativeRatio = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  return Math.min(nativeRatio, 1.5, Math.sqrt(1_600_000 / Math.max(1, width * height)));
}

/** Software WebGL is too expensive for the procedural metal/shadow scene. */
export function isSoftwareRenderer(renderer: unknown) {
  return typeof renderer === 'string' && /swiftshader|llvmpipe|softpipe|software|lavapipe/i.test(renderer);
}
