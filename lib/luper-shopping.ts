import type { LuperMessage } from './luper';
import { nlargoPath } from './nlargo-allocation';

export type LuperProfile = { make: string; model: string; year: string; interest: string; budget: string };
export type LuperCard = {
  id: string; kind: 'product' | 'shop' | 'brand' | 'programme'; title: string; href: string;
  image?: string; subtitle?: string; price?: string;
};
export type LuperShopping = { profile: LuperProfile; recommendations: LuperCard[]; page?: LuperCard; enquirySummary?: string; contactTeam?: boolean };
export const emptyLuperProfile = (): LuperProfile => ({ make: '', model: '', year: '', interest: '', budget: '' });
const keys = ['make', 'model', 'year', 'interest', 'budget'] as const;
const clean = (value: unknown, limit: number) => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit) : '';

export function parseLuperProfile(value: unknown): LuperProfile {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return Object.fromEntries(keys.map(key => [key, clean(source[key], key === 'year' ? 9 : 160)])) as LuperProfile;
}

/** Remember only details quoted from the visitor or their previous session profile. */
export function groundedLuperProfile(value: unknown, messages: LuperMessage[], previous: LuperProfile): LuperProfile {
  const next = parseLuperProfile(value);
  const sources = [...messages.filter(m => m.role === 'user').map(m => m.content), ...Object.values(previous)]
    .map(text => clean(text, 10000).toLocaleLowerCase());
  for (const key of keys) {
    if (next[key] && !sources.some(source => source.includes(next[key].toLocaleLowerCase()))) next[key] = previous[key];
  }
  return next;
}

export function safeLuperPath(value: unknown): string {
  if (typeof value !== 'string' || value.length > 500 || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return '';
  const url = new URL(value, 'https://luper.invalid');
  if (url.origin === 'https://luper.invalid' && url.pathname === nlargoPath) return nlargoPath + (url.hash === '#private-enquiry' ? url.hash : '');
  if (url.origin !== 'https://luper.invalid' || !/^\/(?:products|partners|shop)(?:\/|$)/.test(url.pathname)) return '';
  const query = new URLSearchParams();
  for (const key of ['brand', 'make', 'model', 'category', 'q']) {
    const part = url.searchParams.get(key);
    if (part) query.set(key, part.slice(0, 80));
  }
  return url.pathname + (query.size ? `?${query}` : '');
}

export function safeLuperImage(value: unknown): string | undefined {
  if (typeof value !== 'string') return;
  if (/^\/images\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes('..')) return value;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && url.hostname === 'cdn.shopify.com' && url.pathname.startsWith('/s/files/')) return url.href;
  } catch { /* Ignore images outside the catalog's image hosts. */ }
}

export function parseLuperCard(value: unknown): LuperCard | undefined {
  if (!value || typeof value !== 'object') return;
  const card = value as Record<string, unknown>;
  const href = safeLuperPath(card.href);
  const title = clean(card.title, 180), id = clean(card.id, 200);
  if (!href || !title || !id || !['product', 'shop', 'brand', 'programme'].includes(String(card.kind))) return;
  return { id, kind: card.kind as LuperCard['kind'], title, href, image: safeLuperImage(card.image),
    subtitle: clean(card.subtitle, 160), price: clean(card.price, 60) };
}

export function parseLuperShopping(value: unknown): LuperShopping | undefined {
  if (!value || typeof value !== 'object') return;
  const data = value as Record<string, unknown>;
  if (!data.profile || !Array.isArray(data.recommendations)) return;
  return { profile: parseLuperProfile(data.profile),
    ...(typeof data.enquirySummary === 'string' ? { enquirySummary: clean(data.enquirySummary, 360) } : {}),
    contactTeam: data.contactTeam === true,
    recommendations: data.recommendations.slice(0, 3).map(parseLuperCard).filter((card): card is LuperCard => !!card),
    page: parseLuperCard(data.page) };
}

export function shoppingWhatsAppHref(base: string, profile: LuperProfile, selected: LuperCard[], origin: string, enquirySummary = '') {
  const car = [profile.year, profile.make, profile.model].filter(Boolean).join(' ');
  const links = selected.slice(0, 3).filter(card => safeLuperPath(card.href)).map(card => `${card.title}\n${new URL(card.href, origin).href}`);
  // Older/interrupted chats have a simple profile-based fallback, never a transcript dump.
  const fallback = [profile.interest ? `I’d like help with ${profile.interest.replace(/[.!?]+$/, '')}${car ? ` for my ${car}` : ''}.`
    : `I’d like to explore options for my ${car || 'car'}.`,
    profile.budget && `My budget is ${profile.budget.replace(/[.!?]+$/, '')}.`].filter(Boolean).join(' ');
  const text = ['Hi Luxury Performance! I was chatting with Luper.',
    clean(enquirySummary, 360) || fallback,
    links.length && `I’m interested in these options.\n\n${links.join('\n\n')}`,
    'Could you let me know what’s available and help with fitment and pricing?'].filter(Boolean).join('\n\n');
  const url = new URL(base);
  url.searchParams.set('text', text);
  return url.toString();
}
