import type { LuperMessage } from './luper';
import { groundedLuperProfile, type LuperShopping, type LuperProfile, type LuperCard } from './luper-shopping';
import { luperVehicleCoverage, type LuperVehicleCatalog } from './luper-vehicles';

export type LuperResponseContext = { candidates: LuperCard[]; page?: LuperCard; messages: LuperMessage[]; profile: LuperProfile; catalogAvailable?: boolean; vehicleCatalog?: LuperVehicleCatalog };
const shortText = { type: 'string', maxLength: 160 };
export const luperResponseFormat = {
  type: 'json_schema', name: 'luper_shopping_reply', strict: true,
  schema: {
    type: 'object', additionalProperties: false,
    properties: {
      reply: { type: 'string', maxLength: 2000 },
      recommendationIds: { type: 'array', maxItems: 3, items: { type: 'string', maxLength: 200 } },
      profile: { type: 'object', additionalProperties: false, properties: {
        make: shortText, model: shortText, year: { type: 'string', maxLength: 9 }, interest: shortText, budget: shortText,
      }, required: ['make', 'model', 'year', 'interest', 'budget'] },
      enquirySummary: { type: 'string', maxLength: 360 },
      contactTeam: { type: 'boolean' },
    }, required: ['reply', 'recommendationIds', 'profile', 'enquirySummary', 'contactTeam'],
  },
};

/** Decode only the first JSON string as it arrives; never display JSON or internal fields. */
export function luperReplyPrefix(json: string): string {
  const start = /^\s*\{\s*"reply"\s*:\s*"/.exec(json);
  if (!start) return '';
  let result = '';
  for (let i = start[0].length; i < json.length; i++) {
    const char = json[i];
    if (char === '"') break;
    if (char !== '\\') { result += char; continue; }
    if (i + 1 >= json.length) break;
    const escape = json[++i];
    if (escape === 'u') {
      const hex = json.slice(i + 1, i + 5);
      if (hex.length < 4) break;
      if (!/^[a-f0-9]{4}$/i.test(hex)) throw new Error('Invalid Unicode escape');
      result += String.fromCharCode(parseInt(hex, 16)); i += 4;
    } else {
      const escapes: Record<string, string> = { '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' };
      if (!(escape in escapes)) throw new Error('Invalid string escape');
      result += escapes[escape];
    }
  }
  // Hold an incomplete surrogate pair until its second half arrives.
  return /[\uD800-\uDBFF]$/.test(result) ? result.slice(0, -1) : result;
}

export function finishLuperResponse(json: string, context: LuperResponseContext): { reply: string; shopping: LuperShopping } {
  const data = JSON.parse(json);
  if (!data || typeof data.reply !== 'string' || !data.reply.trim() || data.reply.length > 2000
    || !Array.isArray(data.recommendationIds) || data.recommendationIds.length > 3 || !data.profile || typeof data.profile !== 'object'
    || typeof data.enquirySummary !== 'string' || data.enquirySummary.length > 360
    || typeof data.contactTeam !== 'boolean') throw new Error('Invalid shopping response');
  const selected = [...new Set<string>(data.recommendationIds.filter((id: unknown) => typeof id === 'string'))];
  const known = new Map(context.candidates.map(card => [card.id, card]));
  const profile = groundedLuperProfile(data.profile, context.messages, context.profile);
  const unlisted = context.catalogAvailable && context.vehicleCatalog && luperVehicleCoverage(profile, context.vehicleCatalog) === 'not_listed';
  return { reply: data.reply, shopping: {
    profile,
    enquirySummary: data.enquirySummary.trim(),
    contactTeam: data.contactTeam,
    recommendations: unlisted ? [] : selected.map(id => known.get(id)).filter((card): card is LuperCard => !!card).slice(0, 3),
    ...(context.page ? { page: context.page } : {}),
  } };
}
