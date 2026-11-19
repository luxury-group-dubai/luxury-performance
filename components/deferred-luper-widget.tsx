"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import styles from './chat-launcher.module.css';

const loadLuper = () => import('./luper-widget').then(module => module.LuperWidget);

function Launcher({ open, pending = false }: { open?: () => void; pending?: boolean }) {
  return <div className={styles.anchor}>
    <button className={styles.launcher} type="button" aria-label="Chat with Luxury Performance" aria-haspopup="dialog" aria-expanded={false} aria-busy={pending || undefined} disabled={pending}
      onPointerEnter={() => { void loadLuper(); }} onFocus={() => { void loadLuper(); }} onClick={open}>
      <MessageCircle size={25} strokeWidth={1.8} aria-hidden="true" />
    </button>
    {pending && <span className="sr-only" role="status">Opening chat…</span>}
  </div>;
}

// The launcher paints immediately; the assistant runtime loads on user intent.
const LuperWidget = dynamic(loadLuper, { ssr: false, loading: () => <Launcher pending /> });

export function DeferredLuperWidget() {
  const [requested, setRequested] = useState(false);
  return requested ? <LuperWidget initialOpen /> : <Launcher open={() => setRequested(true)} />;
}
