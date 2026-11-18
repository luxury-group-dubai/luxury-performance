'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUp, ArrowUpRight, MessageCircle, RotateCcw, X } from 'lucide-react';
import { contact } from '@/lib/content';
import { LUPER_MAX_MESSAGE, luperWhatsAppHref, parseLuperMessages, type LuperMessage } from '@/lib/luper';
import { lockOverlayScroll } from '@/lib/overlay-scroll-lock';
import styles from './luper-widget.module.css';

const starters = ['Find an exhaust for my car', 'Explore carbon & styling', 'Help me choose wheels'];

export function LuperWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<LuperMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const history = useRef<HTMLDivElement>(null);
  const request = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) return;
    const modal = dialog.current;
    const unlock = lockOverlayScroll();
    modal?.showModal();
    input.current?.focus({ preventScroll: true });
    return () => { modal?.close(); unlock(); launcher.current?.focus({ preventScroll: true }); };
  }, [open]);
  useEffect(() => { history.current?.scrollTo({ top: history.current.scrollHeight, behavior: 'instant' }); }, [messages, pending, error, open]);
  useEffect(() => () => { request.current?.abort(); }, []);

  async function send(text: string) {
    const content = text.trim();
    if (!content || content.length > LUPER_MAX_MESSAGE || request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(content); setDraft(''); setError('');
    let context: LuperMessage[] = [...messages.slice(-8), { role: 'user', content }];
    while (!parseLuperMessages(context) && context.length > 1) context = context.slice(2);
    const timer = setTimeout(() => controller.abort(), 27000);
    try {
      const response = await fetch('/api/luper', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: context }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok || typeof data.message !== 'string') throw new Error(data.error || 'Luper is unavailable. Our team can help on WhatsApp.');
      setMessages(previous => [...previous, { role: 'user', content }, { role: 'assistant', content: data.message }].slice(-40) as LuperMessage[]);
    } catch (failure) {
      setDraft(content);
      setError(controller.signal.aborted ? 'That reply took too long. Please try again or speak with our team on WhatsApp.' : failure instanceof Error ? failure.message : 'Please try again or speak with our team on WhatsApp.');
    } finally { clearTimeout(timer); request.current = null; setPending(''); }
  }
  function submit(event: FormEvent) { event.preventDefault(); void send(draft); }
  function reset() { if (request.current) return; setMessages([]); setError(''); setDraft(''); input.current?.focus(); }
  const handoffMessages = draft.trim() ? [...messages, { role: 'user' as const, content: draft.trim() }] : messages;

  return <>
    <button ref={launcher} className={styles.launcher} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} aria-controls="luper-dialog">
      <MessageCircle size={19} strokeWidth={1.5} aria-hidden="true" /><span>Ask Luper</span>
    </button>
    <dialog ref={dialog} id="luper-dialog" className={styles.dialog} aria-labelledby="luper-title"
      onCancel={event => { event.preventDefault(); setOpen(false); }}
      onClick={event => { if (event.target === dialog.current) setOpen(false); }}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <div><span className={styles.eyebrow}>Luxury Performance</span><h2 id="luper-title">LXP <span>Luper</span><i aria-hidden="true" /></h2><p>Your AI concierge</p></div>
          <div className={styles.controls}>
            <button type="button" onClick={reset} disabled={!!pending || !messages.length} aria-label="Start a new chat"><RotateCcw size={17}/></button>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close Luper"><X size={22}/></button>
          </div>
        </header>
        <div ref={history} className={styles.history} data-lenis-prevent>
          {!messages.length && !pending && <div className={styles.welcome}>
            <span className={styles.eyebrow}>Built around your car</span>
            <h3>Extraordinary cars.<br/><span>Your next detail.</span></h3>
            <p>I’m Luper. Let’s explore the sound, stance or finishing touch you have in mind.</p>
            <p className={styles.question}>What do you drive?</p>
            <div className={styles.starters}>{starters.map(text => <button key={text} onClick={() => void send(text)}>{text}<ArrowUpRight size={17} aria-hidden="true"/></button>)}</div>
          </div>}
          <div role="log" aria-label="Conversation with Luper" aria-live="polite" aria-relevant="additions" className={styles.messages}>
            {messages.map((message, index) => <div key={index} className={message.role === 'user' ? styles.user : styles.assistant}>
              <span className={styles.speaker}>{message.role === 'user' ? 'You' : 'Luper'}</span><p dir="auto">{message.content}</p>
            </div>)}
          </div>
          {!!pending && <><div className={styles.user}><span className={styles.speaker}>You</span><p dir="auto">{pending}</p></div><p className={styles.thinking} role="status">Luper is thinking<span aria-hidden="true">…</span></p></>}
          {!!error && <p className={styles.error} role="alert">{error}</p>}
        </div>
        <footer className={styles.footer}>
          <nav className={styles.links} aria-label="Luper shortcuts"><a href="/shop" onClick={() => setOpen(false)}>Browse parts <ArrowUpRight size={13}/></a><a href="/contact" onClick={() => setOpen(false)}>Visit us <ArrowUpRight size={13}/></a></nav>
          <form onSubmit={submit} className={styles.composer}>
            <label className="sr-only" htmlFor="luper-message">Your message to Luper</label>
            <textarea ref={input} id="luper-message" rows={2} maxLength={LUPER_MAX_MESSAGE} value={draft} readOnly={!!pending}
              placeholder="Your car, your idea…" onChange={event => setDraft(event.target.value)}
              onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(draft); } }}/>
            <button type="submit" aria-label="Send message" disabled={!draft.trim() || !!pending}><ArrowUp size={21}/></button>
          </form>
          <p className={styles.privacy}>AI replies may be imperfect. Messages are sent to OpenAI. Please avoid sensitive information.</p>
          <a className={styles.handoff} href={luperWhatsAppHref(contact.whatsapp, handoffMessages)} target="_blank" rel="noopener noreferrer">
            <span>Prefer a personal conversation?<strong>Speak with our team on WhatsApp</strong></span><ArrowUpRight size={20}/>
          </a>
          {!!handoffMessages.length && <p className={styles.draftNote}>Opens a draft with your recent questions. You choose when to send.</p>}
        </footer>
      </div>
    </dialog>
  </>;
}
