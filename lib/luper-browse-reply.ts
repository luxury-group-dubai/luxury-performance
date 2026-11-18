import type { LuperCatalogContext } from './luper-catalog';
import type { LuperMessage } from './luper';
import { emptyLuperProfile, type LuperProfile, type LuperShopping } from './luper-shopping';
import { normalizeSearch } from './shop/search';
import { shopPathFilters } from './shop/routes';

/** A bare, verified range lookup needs neither a model guess nor a paid AI request. */
export function luperBrowseReply(messages: LuperMessage[], catalog: LuperCatalogContext, previous: LuperProfile = emptyLuperProfile()): { reply: string; shopping: LuperShopping } | undefined {
  if (!catalog.catalogAvailable) return {
    reply: 'I can’t check the online catalogue right now. Please try again in a moment, or tap the WhatsApp button below so our team can help.',
    shopping: { profile: emptyLuperProfile(), recommendations: [], contactTeam: true, enquirySummary: '' },
  };
  const latest = normalizeSearch(messages.at(-1)?.content || '');
  const cards = catalog.directBrowse || [];
  if (new Set(cards.map(card => shopPathFilters(card.href).make)).size > 1) return {
    reply: 'That model name appears under more than one manufacturer. Which make do you mean? You can also choose a range below.',
    shopping: { profile: emptyLuperProfile(), recommendations: cards, contactTeam: false, enquirySummary: '' },
  };
  for (const card of cards) {
    const { make, model, body } = shopPathFilters(card.href);
    if (!make || !model) continue;
    const version = normalizeSearch(`${model} ${body || ''}`);
    const title = card.title.replace(' · ', ' ');
    const sameCar = normalizeSearch(previous.model) === version && (!previous.make || normalizeSearch(previous.make) === normalizeSearch(make));
    const profile = { ...(sameCar ? previous : emptyLuperProfile()), model: version,
      make: ` ${latest} `.includes(` ${normalizeSearch(make)} `) ? normalizeSearch(make) : sameCar ? previous.make : '' };
    return { reply: `You can browse the ${title} range below. What kind of upgrade do you have in mind?`,
      shopping: { profile, recommendations: cards, contactTeam: false,
        enquirySummary: `I’d like to explore the ${title} range.` } };
  }
}
