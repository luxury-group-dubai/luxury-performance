'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { Play, X } from 'lucide-react';
import { ActionArrow } from '@/components/action-arrow';
import styles from './nlargo.module.css';

const videoId = 'gDCB86m1Ud0';
const title = 'NOVITEC Ferrari 12Cilindri N-LARGO — Redefining Perfection';

export function RevealFilm() {
  const [playing, setPlaying] = useState(false);
  const poster = useRef<HTMLButtonElement>(null);

  function close() {
    setPlaying(false);
    requestAnimationFrame(() => poster.current?.focus({ preventScroll: true }));
  }

  return <>
    <div className={styles.film}>
      {playing ? <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      /> : <button ref={poster} type="button" className={styles.filmPoster} onClick={() => setPlaying(true)} aria-label="Play the official NOVITEC 12Cilindri N-LARGO reveal film, 15 minutes 31 seconds">
        <Image src="/images/nlargo/hero.webp" alt="" fill sizes="(max-width: 700px) 100vw, 90vw" />
        <span className={styles.filmPlay}><Play size={25} fill="currentColor" aria-hidden="true" /></span>
        <span className={styles.filmPrompt}>Watch the full reveal <span>15:31</span></span>
      </button>}
    </div>
    <div className={styles.filmActions}>
      <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">Watch on YouTube <ActionArrow size={16} /><span className="sr-only"> (opens in a new tab)</span></a>
      {playing && <button type="button" onClick={close}><X size={16} aria-hidden="true" /> Close video</button>}
    </div>
  </>;
}
