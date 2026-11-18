export type LuperMessage = { role: 'user' | 'assistant'; content: string };
export const LUPER_MAX_MESSAGE = 800;
export const LUPER_MAX_MESSAGES = 12;
export const LUPER_MAX_HISTORY_BYTES = 10000;
export const LUPER_MODEL = 'gpt-6-luna';
export const LUPER_MAX_OUTPUT_TOKENS = 450;
// Reserve a full cent per attempt, deliberately above the bounded request cost.
// No automatic refund or reset: even interrupted requests may incur API charges.
export const LUPER_LAUNCH_CENTS = 1000;

export function parseLuperMessages(value: unknown): LuperMessage[] | null {
  if (!Array.isArray(value) || !value.length || value.length > LUPER_MAX_MESSAGES) return null;
  let bytes = 0;
  const messages: LuperMessage[] = [];
  for (let i = 0; i < value.length; i++) {
    const item = value[i];
    if (!item || typeof item !== 'object' || item.role !== (i % 2 ? 'assistant' : 'user') ||
      typeof item.content !== 'string' || !item.content.trim() ||
      item.content.length > (item.role === 'user' ? LUPER_MAX_MESSAGE : 4000)) return null;
    bytes += new TextEncoder().encode(item.content).length;
    if (bytes > LUPER_MAX_HISTORY_BYTES) return null;
    messages.push({ role: item.role, content: item.content.trim() });
  }
  return messages.at(-1)?.role === 'user' ? messages : null;
}

export function luperWhatsAppHref(base: string, messages: LuperMessage[]) {
  // Only the visitor's own recent details go into the reviewed WhatsApp draft.
  const details = messages.filter(message => message.role === 'user').slice(-3)
    .map(message => message.content.slice(0, LUPER_MAX_MESSAGE)).join('\n');
  const url = new URL(base);
  url.searchParams.set('text', `Hello Luxury Performance, I was speaking with LXP Luper.${details ? `\n\nMy enquiry:\n${details}` : '\nI would like help with my car.'}`);
  return url.toString();
}
