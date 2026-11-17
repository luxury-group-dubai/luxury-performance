export const previewSearchPath = '/shop/search';
export function previewSearchHref(query: string) {
  return `${previewSearchPath}?${new URLSearchParams({ q: query.trim().slice(0, 100) })}`;
}
