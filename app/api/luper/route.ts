import { luperInstructions } from '@/lib/luper-knowledge';
import { LUPER_MAX_OUTPUT_TOKENS, LUPER_MODEL, parseLuperMessages } from '@/lib/luper';
import { reserveLuperRequest } from '@/lib/luper-budget';

export const runtime = 'nodejs';
export const maxDuration = 30;
const unavailable = 'Luper is taking a short break. Our team can help you on WhatsApp.';
function reply(body: object, status = 200, extra: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store', ...extra } });
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
  if (!origin || origin !== expected || request.headers.get('sec-fetch-site') === 'cross-site') return reply({ error: 'Please open Luper on our website.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return reply({ error: 'Please send a text message.' }, 415);
  let messages;
  try { messages = parseLuperMessages((await boundedBody(request)).messages); }
  catch { return reply({ error: 'Please shorten your message and try again.' }, 400); }
  if (!messages) return reply({ error: 'Please start a new chat or shorten your message.' }, 400);
  if (process.env.LUPER_ENABLED !== 'true' || !process.env.OPENAI_API_KEY) return reply({ error: unavailable }, 503);
  // Bound knowledge too, so future editorial changes cannot silently raise costs.
  if (Buffer.byteLength(luperInstructions, 'utf8') > 12000) return reply({ error: unavailable }, 503);
  try {
    const decision = await reserveLuperRequest(request);
    if (decision === 'rate_limited') return reply({ error: 'Please wait a minute before sending another message. You can also reach our team on WhatsApp.' }, 429, { 'Retry-After': '60' });
    if (decision === 'budget_exhausted') return reply({ error: unavailable }, 503);
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: LUPER_MODEL, instructions: luperInstructions, input: messages,
        reasoning: { effort: 'none' }, max_output_tokens: LUPER_MAX_OUTPUT_TOKENS, store: false, service_tier: 'default' }),
      cache: 'no-store', signal: AbortSignal.timeout(22000),
    });
    if (!response.ok) return reply({ error: unavailable }, 503);
    const data = await response.json();
    const text = (data.output ?? []).filter((item: { type?: string }) => item.type === 'message')
      .flatMap((item: { content?: { type: string; text?: string }[] }) => item.content ?? [])
      .filter((item: { type: string }) => item.type === 'output_text')
      .map((item: { text?: string }) => item.text ?? '').join('\n').trim();
    if (!text || data.status !== 'completed') return reply({ error: unavailable }, 503);
    return reply({ message: text.slice(0, 4000) });
  } catch { return reply({ error: unavailable }, 503); }
}
