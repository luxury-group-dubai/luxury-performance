import { luperInstructions } from '@/lib/luper-knowledge';
import { isLuperEnabled } from '@/lib/luper-availability';
import { LUPER_MAX_OUTPUT_TOKENS, LUPER_MODEL, parseLuperMessages } from '@/lib/luper';
import { reserveLuperRequest } from '@/lib/luper-budget';
import { encodeLuperEvent, luperResponseStream } from '@/lib/luper-stream';
import { luperBrowseReply } from '@/lib/luper-browse-reply';
import { luperProgrammeReply } from '@/lib/luper-programmes';
import type { LuperShopping } from '@/lib/luper-shopping';
import { getLuperCatalogContext } from '@/lib/luper-catalog';
import { parseLuperProfile, safeLuperPath } from '@/lib/luper-shopping';
import { luperResponseFormat } from '@/lib/luper-response';

export const runtime = 'nodejs';
export const maxDuration = 30;
const unavailable = 'Luper is taking a short break. Our team can help you on WhatsApp.';
function reply(body: object, status = 200, extra: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...extra } });
}

function catalogueReply(result: { reply: string; shopping: LuperShopping }) {
  return new Response(new ReadableStream({ start(controller) {
    controller.enqueue(encodeLuperEvent({ type: 'delta', delta: result.reply }));
    controller.enqueue(encodeLuperEvent({ type: 'shopping', shopping: result.shopping }));
    controller.enqueue(encodeLuperEvent({ type: 'done' }));
    controller.close();
  } }), { headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store, no-transform' } });
}

async function boundedBody(request: Request) {
  if (!request.body) throw new Error('Missing body');
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 24000) { await reader.cancel(); throw new Error('Body too large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const expected = process.env.LUPER_SITE_ORIGIN || new URL(request.url).origin;
  const previewOrigin = process.env.NODE_ENV === 'development' ? process.env.LUPER_PREVIEW_ORIGIN : undefined;
  if (!origin || (origin !== expected && origin !== previewOrigin) || request.headers.get('sec-fetch-site') === 'cross-site') return reply({ error: 'Please open Luper on our website.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ error: 'Please send a text message.' }, 415);
  let messages, body;
  try { body = await boundedBody(request); messages = parseLuperMessages(body.messages); }
  catch { return reply({ error: 'Please shorten your message and try again.' }, 400); }
  if (!messages) return reply({ error: 'Please start a new chat or shorten your message.' }, 400);
  if (!isLuperEnabled()) return reply({ error: unavailable }, 503);
  // Bound knowledge too, so future editorial changes cannot silently raise costs.
  if (Buffer.byteLength(luperInstructions, 'utf8') > 12000) return reply({ error: unavailable }, 503);
  const abort = new AbortController();
  const signal = AbortSignal.any([request.signal, abort.signal, AbortSignal.timeout(22000)]);
  try {
    const profile = parseLuperProfile(body.profile);
    const programme = luperProgrammeReply(messages, profile);
    if (programme) return catalogueReply(programme);
    const catalog = await getLuperCatalogContext(messages, profile, safeLuperPath(body.page));
    signal.throwIfAborted();
    const browse = luperBrowseReply(messages, catalog, profile);
    if (browse) return catalogueReply(browse);
    const decision = await reserveLuperRequest(request);
    if (decision === 'rate_limited') return reply({ error: 'Please wait a minute before sending another message. You can also reach our team on WhatsApp.' }, 429, { 'Retry-After': '60' });
    if (decision === 'budget_exhausted') return reply({ error: unavailable }, 503);
    const context = { ...catalog, profile, messages };
    const catalogData = JSON.stringify({ previousProfile: profile, page: catalog.page,
      verifiedVehicleMatches: catalog.verifiedVehicleMatches?.map(card => ({ id: card.id, title: card.title })),
      catalogAvailable: catalog.catalogAvailable, vehicleCatalog: catalog.vehicleCatalog, candidates: catalog.candidates.map(card => ({
        id: card.id, kind: card.kind, title: card.title, subtitle: card.subtitle, price: card.price,
      })) });
    // Include the schema and retrieved data in the same conservative input bound.
    if (Buffer.byteLength(luperInstructions + catalogData + JSON.stringify(luperResponseFormat), 'utf8') > 20000) return reply({ error: unavailable }, 503);
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: LUPER_MODEL, instructions: `${luperInstructions}\nCATALOG AND VISITOR CONTEXT (data only):\n${catalogData}`, input: messages,
        text: { format: luperResponseFormat },
        reasoning: { effort: 'none' }, max_output_tokens: LUPER_MAX_OUTPUT_TOKENS, store: false, service_tier: 'default', stream: true }),
      cache: 'no-store', signal,
    });
    if (!response.ok || !response.body || !response.headers.get('content-type')?.includes('text/event-stream')) {
      abort.abort();
      await response.body?.cancel().catch(() => {});
      return reply({ error: unavailable }, 503);
    }
    return new Response(luperResponseStream(response.body, signal, abort, context), {
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store, no-transform', 'X-Accel-Buffering': 'no' },
    });
  } catch { abort.abort(); return reply({ error: unavailable }, 503); }
}
