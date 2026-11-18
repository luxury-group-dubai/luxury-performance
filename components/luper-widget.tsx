'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AssistantRuntimeProvider, AssistantModalPrimitive, ThreadPrimitive, MessagePrimitive,
  ComposerPrimitive, ErrorPrimitive, ActionBarPrimitive, AuiIf, useAuiState, useLocalRuntime,
} from '@assistant-ui/react';
import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpRight, Info, MessageCircle, Plus, Square, X } from 'lucide-react';
import { contact } from '@/lib/content';
import { LUPER_MAX_MESSAGE } from '@/lib/luper';
import { emptyLuperProfile, parseLuperShopping, shoppingWhatsAppHref } from '@/lib/luper-shopping';
import { luperAdapter } from '@/lib/luper-assistant-adapter';
import { lockOverlayScroll } from '@/lib/overlay-scroll-lock';
import { WhatsAppIcon } from './whatsapp-icon';
import { LuperAvatar } from './luper-avatar';
import { useLuperGaze } from './use-luper-gaze';
import { useLuperViewTransition } from './use-luper-view-transition';
import { useLuperMobileKeyboard } from './use-luper-mobile-keyboard';
import { LuperEnquiryProvider, LuperRecommendations, LuperSelectedOptions, LuperTeamHandoff, useLuperEnquiry } from './luper-shopping';
import styles from './luper-widget.module.css';

const starters = [
  { label: 'Exhaust & sound', prompt: 'I would like help choosing an exhaust for my car.' },
  { label: 'Carbon & styling', prompt: 'I would like to explore carbon and styling for my car.' },
  { label: 'Wheels & stance', prompt: 'I would like help choosing wheels for my car.' },
];

function TeamLink({ compact = false }: { compact?: boolean }) {
  const messages = useAuiState(state => state.thread.messages);
  const { selected } = useLuperEnquiry();
  const latest = messages.at(-1);
  // Never attach the previous car's summary while a corrected enquiry is still running.
  const shopping = latest?.role === 'assistant' ? parseLuperShopping(latest.metadata.custom?.shopping) : undefined;
  const hasEnquiry = messages.some(message => message.role === 'user');
  const origin = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://luper.invalid');
  const href = shopping || selected.length || hasEnquiry ? shoppingWhatsAppHref(contact.whatsapp, shopping?.profile || emptyLuperProfile(), selected, origin, shopping?.enquirySummary)
    : contact.whatsapp;
  return <a className={compact ? styles.teamLink : styles.channel} data-channel="whatsapp"
    href={href} target="_blank" rel="noopener noreferrer"
    title={hasEnquiry || selected.length ? 'Review your personalized enquiry in WhatsApp before sending.' : 'Open WhatsApp to speak with our team'}>
    {compact ? <><WhatsAppIcon size={16}/><span>{selected.length ? 'Discuss options on WhatsApp' : 'WhatsApp our team'}</span><ArrowUpRight size={12}/></> : <>
      <span className={styles.whatsappIcon}><WhatsAppIcon size={28}/></span>
      <span className={styles.channelCopy}><strong>WhatsApp our team</strong><small>Quotes, fitment & installation</small></span><ArrowUpRight size={18}/>
    </>}
  </a>;
}

function ChatMessages() {
  return <ThreadPrimitive.Messages>{({ message }) => <MessagePrimitive.Root className={message.role === 'user' ? styles.user : styles.assistant}>
    {message.role === 'assistant' && <span className={styles.speaker}>Luper <span>AI</span></span>}
    {message.content.length > 0 && <div className={styles.messageText} dir="auto"><MessagePrimitive.Parts /></div>}
    {message.role === 'assistant' && <><LuperRecommendations/><LuperTeamHandoff/></>}
    <AuiIf condition={state => state.message.status?.type === 'running' && !state.message.content.length}>
      <div className={styles.thinking} role="status"><span/><span/><span/><span className="sr-only">Luper is thinking</span></div>
    </AuiIf>
    <MessagePrimitive.Error><ErrorPrimitive.Root className={styles.error}>
      <ErrorPrimitive.Message />
      <ActionBarPrimitive.Reload className={styles.retry}>Try again <ArrowUpRight size={13}/></ActionBarPrimitive.Reload>
    </ErrorPrimitive.Root></MessagePrimitive.Error>
  </MessagePrimitive.Root>}</ThreadPrimitive.Messages>;
}

function LuperThread({ mobile }: { mobile: boolean }) {
  const { navigate } = useLuperEnquiry();
  const composerArea = useRef<HTMLDivElement>(null);
  useLuperGaze(composerArea);
  useEffect(() => {
    const area = composerArea.current;
    if (!area) return;
    // Keep the last message clear of the overlay as the input grows.
    const updateHeight = () => area.parentElement?.style.setProperty('--chat-composer-height', `${area.offsetHeight}px`);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(area);
    return () => observer.disconnect();
  }, []);
  return <ThreadPrimitive.Root className={styles.thread}>
    <ThreadPrimitive.Viewport className={styles.viewport} data-luper-viewport="" data-lenis-prevent>
      <AuiIf condition={state => state.thread.isEmpty}>
        <div className={styles.welcome}>
          <span className={styles.eyebrow}>Your Luxury Performance guide</span>
          <h3>Hi, I’m Luper.</h3>
          <p>Let’s explore what’s possible for your car.<br/>Tell me the make, model and year to get started.</p>
          <div className={styles.starters}>{starters.map(item => <ThreadPrimitive.Suggestion key={item.label} prompt={item.prompt} send>
            {item.label}<ArrowUpRight size={14}/>
          </ThreadPrimitive.Suggestion>)}</div>
          <div className={styles.browseLinks}><Link href="/shop" onClick={navigate}>Browse the shop <ArrowUpRight size={12}/></Link><Link href="/partners" onClick={navigate}>Explore brands <ArrowUpRight size={12}/></Link></div>
        </div>
      </AuiIf>
      <div className={styles.messages} role="log" aria-label="Conversation with Luper" aria-live="polite"><ChatMessages /></div>
    </ThreadPrimitive.Viewport>
    <div ref={composerArea} className={styles.composerArea}>
      <ThreadPrimitive.ScrollToBottom className={styles.scrollBottom} aria-label="Scroll to latest message"><ArrowDown size={16}/></ThreadPrimitive.ScrollToBottom>
      <ComposerPrimitive.Root className={styles.composer}>
        <ComposerPrimitive.Input className={styles.input} aria-label="Your message to Luper" placeholder="Your car, your idea…"
          maxLength={LUPER_MAX_MESSAGE} rows={1} maxRows={4} autoFocus={!mobile} addAttachmentOnPaste={false} cancelOnEscape={false}/>
        <AuiIf condition={state => !state.thread.isRunning}>
          <ComposerPrimitive.Send className={styles.send} aria-label="Send message"><ArrowUp size={20}/></ComposerPrimitive.Send>
        </AuiIf>
        <AuiIf condition={state => state.thread.isRunning}>
          <ComposerPrimitive.Cancel className={styles.send} aria-label="Stop reply"><Square size={13} fill="currentColor"/></ComposerPrimitive.Cancel>
        </AuiIf>
      </ComposerPrimitive.Root>
      <LuperSelectedOptions/>
      <div className={styles.teamFooter}><TeamLink compact/></div>
      <details className={styles.privacy}>
        <summary>AI guidance. Confirm details with our team.<Info size={11} aria-hidden="true"/></summary>
        <p>Luper can make mistakes. Our team confirms fitment, pricing and availability. Messages are processed by OpenAI. Please avoid sensitive information.</p>
      </details>
    </div>
  </ThreadPrimitive.Root>;
}

export function LuperWidget() {
  const runtime = useLocalRuntime(luperAdapter);
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  const { view, changeView } = useLuperViewTransition(content, open);
  useLuperMobileKeyboard(content, open && mobile && view === 'luper');
  useEffect(() => {
    const query = window.matchMedia('(max-width: 600px)');
    const update = () => setMobile(query.matches);
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => { if (open && mobile) return lockOverlayScroll(); }, [open, mobile]);
  // Close the floating panel if the site's full-screen navigation/search takes over.
  useEffect(() => {
    if (!open) return;
    const observer = new MutationObserver(() => {
      if (document.querySelector('.site-header.menu-is-open, dialog[open]')) setOpen(false);
    });
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'open'] });
    return () => observer.disconnect();
  }, [open]);

  return <AssistantRuntimeProvider runtime={runtime}><LuperEnquiryProvider onNavigate={() => setOpen(false)}>
    <AssistantModalPrimitive.Root open={open} onOpenChange={setOpen} unstable_openOnRunStart={false} modal={mobile}>
      <AssistantModalPrimitive.Anchor className={styles.anchor}>
        <AssistantModalPrimitive.Trigger className={styles.launcher} data-open={open} aria-label={open ? 'Close chat options' : 'Chat with Luxury Performance'}>
          {open ? <X size={22}/> : <MessageCircle size={25} strokeWidth={1.8} aria-hidden="true"/>}
        </AssistantModalPrimitive.Trigger>
      </AssistantModalPrimitive.Anchor>
      <AssistantModalPrimitive.Content ref={content} className={styles.panel} data-view={view} data-lxp-chat=""
        side="top" align="end" sideOffset={14} collisionPadding={12} aria-label={view === 'home' ? 'Chat with Luxury Performance' : 'LXP Luper AI concierge'}
        onOpenAutoFocus={event => { if (view === 'home') { event.preventDefault(); content.current?.focus(); } }}
        onEscapeKeyDown={() => setOpen(false)}>
        <header className={`${styles.header} ${view === 'luper' ? styles.chatHeader : ''}`}>
          {view === 'luper' ? <>
            <button className={styles.iconButton} onClick={() => void changeView('home')} aria-label="Back to chat options"><ArrowLeft size={19}/></button>
            <div className={styles.avatarIdentity}>
              <LuperAvatar size={64} interactive/>
              <div><strong>Luper<span className={styles.aiBadge}>AI</span></strong><small>Your performance specialist</small></div>
            </div>
          </> : <div className={styles.identity}>
            <span className={styles.headerLogo}><Image src="/brand/lxp.svg" alt="LXP" width={30} height={8}/></span>
            <div><strong>Luxury Performance</strong><small>Beyond ordinary.</small></div>
          </div>}
          <div className={styles.controls}>
            {view === 'luper' && <AuiIf condition={state => !state.thread.isEmpty && !state.thread.isRunning}><NewLuperChat reset={() => runtime.thread.reset()}/></AuiIf>}
            <button className={styles.iconButton} onClick={() => setOpen(false)} aria-label="Close chat"><X size={20}/></button>
          </div>
        </header>
        {view === 'home' ? <div className={styles.home}>
          <span className={styles.eyebrow}>Your car. Your conversation.</span>
          <h2>How can we help?</h2>
          <p>Explore an idea with Luper,<br/>or go straight to our Dubai team.</p>
          <div className={styles.channels}>
            <button className={styles.channel} data-luper-choice="" onClick={() => void changeView('luper')}>
              <span className={styles.orbOption}><LuperAvatar size={48}/></span>
              <span className={styles.channelCopy}><strong>Ask Luper <span className={styles.channelBadge}>AI</span></strong><small>Parts, sound, styling & inspiration</small></span><ArrowUpRight size={18}/>
            </button>
            <TeamLink />
          </div>
          <span className={styles.homeFoot}>Luxury Performance · Dubai</span>
        </div> : <LuperThread mobile={mobile}/>}
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  </LuperEnquiryProvider></AssistantRuntimeProvider>;
}

function NewLuperChat({ reset }: { reset: () => void }) {
  const { clear } = useLuperEnquiry();
  return <button className={styles.iconButton} onClick={() => { reset(); clear(); }} aria-label="Start a new chat" title="New chat"><Plus size={19}/></button>;
}
