import type { ChatModelAdapter, ThreadMessage } from '@assistant-ui/react';
import { parseLuperMessages, type LuperMessage } from './luper';
import { readSseData } from './luper-stream';
import { parseLuperShopping, type LuperShopping } from './luper-shopping';

/** Reconcile cancelled/failed turns before sending bounded text to our API. */
export function luperContext(messages: readonly Pick<ThreadMessage, 'role' | 'content'>[]): LuperMessage[] {
  const turns: LuperMessage[] = [];
  for (const message of messages) {
    if (message.role !== 'user' && message.role !== 'assistant') continue;
    const content = message.content.filter(part => part.type === 'text').map(part => part.text).join('\n').trim();
    if (!content) continue;
    const last = turns.at(-1);
    if (last?.role === message.role) turns[turns.length - 1] = { role: message.role, content };
    else if (message.role === 'user' || last) turns.push({ role: message.role, content });
  }
  let bounded = turns.slice(-9);
  if (bounded[0]?.role === 'assistant') bounded = bounded.slice(1);
  while (!parseLuperMessages(bounded) && bounded.length > 1) bounded = bounded.slice(2);
  if (!parseLuperMessages(bounded)) throw new Error('Please shorten your message and try again.');
  return bounded;
}

function revealDelay(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, 32);
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });
}

export const luperAdapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    const transport = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; transport.abort(); }, 27000);
    const signal = AbortSignal.any([abortSignal, transport.signal]);
    let receiving: Promise<void> | undefined;
    let notify: (() => void) | undefined;
    const wake = () => { notify?.(); notify = undefined; };
    abortSignal.addEventListener('abort', wake);
    try {
      const previous = messages.filter(message => message.role === 'assistant').map(message => parseLuperShopping(message.metadata?.custom?.shopping)).filter(Boolean).at(-1);
      const response = await fetch('/api/luper', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({ messages: luperContext(messages), profile: previous?.profile,
          page: typeof window === 'undefined' ? '' : window.location.pathname + window.location.search }),
        signal,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(typeof data.error === 'string' ? data.error : 'Luper is unavailable. Please try again or speak with our team.');
      }
      if (!response.body || !response.headers.get('content-type')?.includes('text/event-stream')) {
        await response.body?.cancel();
        throw new Error('Please refresh the chat and try again.');
      }
      let text = '', displayed = '';
      let shopping: LuperShopping | undefined;
      let finished = false;
      let failure: unknown;
      // Drain the network independently: presentation pacing must not trigger a network timeout.
      receiving = (async () => {
        for await (const data of readSseData(response.body!, signal)) {
          const event = JSON.parse(data);
          if (event.type === 'error') throw new Error(typeof event.error === 'string' ? event.error : 'The reply was interrupted. Please try again.');
          if (event.type === 'done' && text.trim()) return;
          if (event.type === 'shopping') {
            shopping = parseLuperShopping(event.shopping);
            if (!shopping) throw new Error('The reply was interrupted. Please try again.');
            continue;
          }
          if (event.type !== 'delta' || typeof event.delta !== 'string' || text.length + event.delta.length > 4000) {
            throw new Error('The reply was interrupted. Please try again.');
          }
          text += event.delta;
          wake();
        }
        throw new Error('The reply was interrupted. Please try again.');
      })().catch(error => { failure = error; }).finally(() => {
        finished = true;
        clearTimeout(timeout);
        wake();
      });
      while (true) {
        abortSignal.throwIfAborted();
        if (displayed.length < text.length) {
          // Reveal about 60 characters/second without splitting UTF-16 surrogate pairs.
          displayed += Array.from(text.slice(displayed.length)).slice(0, 2).join('');
          yield { content: [{ type: 'text', text: displayed }] };
          if (displayed.length < text.length || !finished) await revealDelay(abortSignal);
        } else if (finished) {
          if (failure) throw failure;
          if (shopping) yield { content: [{ type: 'text', text: displayed }], metadata: { custom: { shopping } } };
          return;
        } else {
          await new Promise<void>(resolve => { notify = resolve; });
        }
      }
    } catch (error) {
      if (abortSignal.aborted) throw error;
      if (timedOut) throw new Error('That reply took too long. Please try again or speak with our team.');
      if (error instanceof TypeError) throw new Error('Please check your connection and try again. Our team is also on WhatsApp.');
      throw error;
    } finally {
      clearTimeout(timeout);
      abortSignal.removeEventListener('abort', wake);
      transport.abort();
      await receiving;
    }
  },
};
