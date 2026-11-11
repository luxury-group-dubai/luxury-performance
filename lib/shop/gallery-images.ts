/** Build responsive candidates for Shopify-hosted photos, preserving the asset version. */
export function galleryImageSources(src: string, widths: readonly number[], fallbackWidth: number, quality?: number) {
  if (!src.startsWith('https://cdn.shopify.com/s/files/')) return { src };

  const url = new URL(src);
  if (quality !== undefined) url.searchParams.set('quality', String(quality));
  const srcSet = widths.map(width => {
    url.searchParams.set('width', String(width));
    return `${url.href} ${width}w`;
  }).join(', ');
  url.searchParams.set('width', String(fallbackWidth));
  return { src: url.href, srcSet };
}
