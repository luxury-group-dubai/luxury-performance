import type { Filters } from './taxonomy';

export function techartGenerationKey(model?: string, fit?: string) {
  return fit?.match(model === 'cayenne' ? /^(e3_[12])(?:_|$)/ : /^(99[12]_[12])(?:_|$)/)?.[1];
}

export function techartTrimSlug(fit: string) {
  const generation = techartGenerationKey(fit.startsWith('e3_') ? 'cayenne' : '911', fit);
  const trim = fit.slice((generation?.length ?? 0) + 1);
  if (trim === 'gt3_with_wing' || fit === '991_1_gt3_gt3_touring') return 'gt3';
  if (trim === 'gt3_gt3_touring') return 'gt3-touring';
  if (trim === 'carrera_targa_gts') return 'carrera-4-gts';
  return trim.replaceAll('_', '-');
}

export function normalizeTechartRoute(filters: Filters): Filters {
  if (filters.brand !== 'techart') return filters;
  let fit = filters.fit;
  let body = filters.body;
  if (fit?.endsWith('_carrera_targa_gts')) {
    fit = fit.replace(/_carrera_targa_gts$/, '_carrera_4_gts');
    body = 'targa';
  }
  const generation = techartGenerationKey(filters.model, fit) || filters.generation;
  // A generation-only legacy fit key is a selection step, not a trim.
  if (fit === generation) fit = undefined;
  return { ...filters, ...(filters.model ? { make: 'porsche' } : {}), generation, body, fit };
}

export function techartPath(filters: Filters, choosing = false) {
  const values = normalizeTechartRoute(filters);
  let path = '/shop/techart';
  if (values.model) path += `/porsche/${values.model}`;

  if (values.model && values.generation) {
    path += `/${values.generation.replaceAll('_', '-')}`;
    if (values.body) {
      path += `/${values.body}`;
      if (values.fit && !choosing) path += `/${techartTrimSlug(values.fit)}`;
    }
  }
  return path;
}

export function parseTechartPath(model: string, tail: string[]): Pick<Filters, 'generation' | 'body' | 'fit'> | undefined {
  if (!tail.length) return {};
  // Read old body?fit= links so the server can redirect them to the new path.
  if (tail.length === 1 && ['coupe', 'cabriolet', 'targa', 'suv'].includes(tail[0])) return { body: tail[0] };
  if (tail.length > 3 || !/^(?:99[12]-[12]|e3-[12])$/.test(tail[0])) return undefined;
  const generation = tail[0].replaceAll('-', '_');
  if ((model === 'cayenne') !== generation.startsWith('e3_')) return undefined;
  const body = tail[1];
  if (body && !(model === 'cayenne' ? ['suv', 'coupe'] : ['coupe', 'cabriolet', 'targa']).includes(body)) return undefined;
  const trim = tail[2];
  const trimKey = trim === 'gt3' ? generation === '991_1' ? 'gt3_gt3_touring' : 'gt3_with_wing'
    : trim === 'gt3-touring' ? 'gt3_gt3_touring' : trim?.replaceAll('-', '_');
  return { generation, body, fit: trimKey ? `${generation}_${trimKey}` : undefined };
}

// Resolve legacy fitment URLs before rendering/streaming starts so their
// migration is a real HTTP 308, including requests made by browsers.
export function techartRedirect(pathname: string, search: URLSearchParams) {
  const query = Object.fromEntries(search) as Filters & { choose?: string };
  const segments = pathname.split('/').filter(Boolean);
  let filters: Filters;
  if (pathname === '/partners/techart') {
    if (!query.model && !query.fit && !query.generation) return;
    filters = { ...query, brand: 'techart', make: 'porsche', model: query.model || '911' };
  } else if (pathname === '/shop' && query.brand === 'techart' && !query.q) {
    filters = query;
  } else if (segments[0] === 'shop' && segments[1] === 'techart') {
    if (segments.length > 7 || segments[2] && segments[2] !== 'porsche') return;
    const model = segments[3];
    const selection = model ? parseTechartPath(model, segments.slice(4)) : {};
    if (!selection) return;
    filters = { ...query, brand: 'techart', make: 'porsche', model,
      ...Object.fromEntries(Object.entries(selection).filter(([, value]) => value !== undefined)) };
  } else return;
  if (filters.model && !['911', 'cayenne'].includes(filters.model)) return;
  const normalized = normalizeTechartRoute(filters);
  if (normalized.generation && techartGenerationKey(normalized.model, normalized.generation) !== normalized.generation) return;
  if (normalized.body && !(normalized.model === 'cayenne' ? ['suv', 'coupe'] : ['coupe', 'cabriolet', 'targa']).includes(normalized.body)) return;
  const targetPath = techartPath(normalized, query.choose === '1');
  const migratedKeys = ['brand', 'make', 'model', 'generation', 'fit', 'body', 'choose'];
  if (targetPath === pathname && !migratedKeys.some(key => search.has(key))) return;
  const extras = new URLSearchParams(search);
  for (const key of migratedKeys) extras.delete(key);
  return targetPath + (extras.size ? `?${extras}` : '');
}
