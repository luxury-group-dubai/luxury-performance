import { finishLuperResponse, luperReplyPrefix, type LuperResponseContext } from './luper-response';
import type { LuperShopping } from './luper-shopping';

/** Decode SSE data across arbitrary network and UTF-8 boundaries. */
export async function* readSseData(body: ReadableStream<Uint8Array>, signal?: AbortSignal): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal?.addEventListener('abort', cancel, { once: true });
  try {
    while (true) {
      signal?.throwIfAborted();
      const { value, done } = await reader.read();
      signal?.throwIfAborted();
      if (done) return;
      buffer += decoder.decode(value, { stream: true });
      let boundary;
      while ((boundary = /\r?\n\r?\n/.exec(buffer))) {
        const block = buffer.slice(0, boundary.index);
        if (block.length > 131072) throw new Error('Stream event too large');
        buffer = buffer.slice(boundary.index + boundary[0].length);
        const data = block.split(/\r?\n/).filter(line => line.startsWith('data:'))
          .map(line => line.slice(5).replace(/^ /, '')).join('\n');
        if (data) yield data;
      }
      if (buffer.length > 131072) throw new Error('Stream event too large');
    }
  } finally {
    signal?.removeEventListener('abort', cancel);
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export function encodeLuperEvent(event: { type: 'delta'; delta: string } | { type: 'shopping'; shopping: LuperShopping } | { type: 'done' } | { type: 'error'; error: string }) {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

/** Forward only display text and sanitized lifecycle events, never upstream metadata. */
export function luperResponseStream(body: ReadableStream<Uint8Array>, signal: AbortSignal, abort: AbortController, context?: LuperResponseContext) {
  let cancelled = false;
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let text = '', json = '';
      let refusal = false;
      try {
        for await (const data of readSseData(body, signal)) {
          if (cancelled) return;
          const event = JSON.parse(data);
          if (event.type === 'response.output_text.delta' || event.type === 'response.refusal.delta') {
            if (typeof event.delta !== 'string') throw new Error('Invalid delta');
            refusal ||= event.type === 'response.refusal.delta';
            let incoming = event.delta;
            if (context && !refusal) {
              json += incoming;
              if (json.length > 16000) throw new Error('Response too large');
              incoming = luperReplyPrefix(json).slice(text.length);
            }
            const delta = incoming.slice(0, Math.max(0, 4000 - text.length));
            text += delta;
            if (delta) controller.enqueue(encodeLuperEvent({ type: 'delta', delta }));
          } else if (event.type === 'response.completed') {
            if (event.response?.status !== 'completed' || !text.trim()) throw new Error('Empty reply');
            if (context && !refusal) {
              const result = finishLuperResponse(json, context);
              if (result.reply !== text) throw new Error('Incomplete reply');
              controller.enqueue(encodeLuperEvent({ type: 'shopping', shopping: result.shopping }));
            }
            controller.enqueue(encodeLuperEvent({ type: 'done' }));
            controller.close();
            return;
          } else if (['error', 'response.failed', 'response.incomplete'].includes(event.type)) {
            throw new Error('Incomplete reply');
          }
        }
        throw new Error('Stream ended before completion');
      } catch {
        if (!cancelled) {
          controller.enqueue(encodeLuperEvent({ type: 'error', error: 'The reply was interrupted. Please try again or speak with our team.' }));
          controller.close();
        }
      } finally {
        abort.abort();
      }
    },
    cancel() {
      cancelled = true;
      abort.abort();
    },
  });
}
