"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { ArrowUpRight, Play, X } from 'lucide-react';
import styles from './novitec-feature-film.module.css';

const videoId = 'QYbObl7MWxk';
const videoTitle = 'NOVITEC Ferrari Purosangue in Dubai — Ahmed Amwell';

export function NovitecFeatureFilm() {
  const [playing, setPlaying] = useState(false);
  const poster = useRef<HTMLButtonElement>(null);

  function stop() {
    setPlaying(false);
    requestAnimationFrame(() => poster.current?.focus());
  }

  return <section id="novitec-film" className={styles.section} aria-labelledby="novitec-film-title">
    <div className={styles.inner}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>NOVITEC × Ferrari / Dubai</p>
          <h2 id="novitec-film-title">NOVITEC Purosangue.<br /><span>On the road.</span></h2>
        </div>
        <p className={styles.description}>Watch Ahmed Amwell’s feature on the NOVITEC Ferrari Purosangue in Dubai.</p>
      </header>
      <div className={styles.player}>
        {playing ? <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`}
          title={videoTitle}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        /> : <button
          ref={poster}
          type="button"
          className={styles.poster}
          aria-label="Play NOVITEC Purosangue film"
          onClick={() => setPlaying(true)}
        >
          <picture>
            {/* Cap the decorative mobile frame; the separate vector logos and live text stay sharp. */}
            <source media="(max-width: 480px)" type="image/avif" srcSet="/images/home/novitec-film-poster-mobile-v1-384.avif" />
            <source media="(max-width: 600px)" type="image/avif" srcSet="/images/home/novitec-film-poster-mobile-v1-480.avif" />
            <source media="(max-width: 700px)" type="image/avif" srcSet="/images/home/novitec-film-poster-mobile-v1-640.avif" />
            <Image className={styles.frame} src="/images/home/novitec-purosangue-film-frame-enhanced-v1.webp" alt="" fill sizes="(max-width: 700px) calc(100vw - 50px), min(1438px, calc(100vw - 2 * clamp(24px,5vw,88px) - 2px))" quality={75} />
          </picture>
          <span className={styles.thumbnailCopy} aria-hidden="true">
            <Image className={styles.novitecMark} src="/brand/novitec.svg" alt="" width={228} height={45} />
            <span className={styles.collaboration}>×</span>
            <Image className={styles.purosangueMark} src="/brand/ferrari-purosangue-white.svg" alt="" width={663} height={96} />
            <strong className={styles.thumbnailLocation}>The 1st in Dubai.</strong>
            <span className={styles.thumbnailCredit}>With Ahmed Amwell</span>
          </span>
          <span className={styles.play}><Play size={26} fill="currentColor" strokeWidth={1.5} aria-hidden="true" /></span>
        </button>}
      </div>
      <div className={styles.footer}>
        <div className={styles.filmActions}>
          <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">Watch on YouTube <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
          {playing && <button type="button" onClick={stop}><X size={15} aria-hidden="true" /> Close video</button>}
        </div>
        <Link href="/collections/ferrari-purosangue?brand=novitec">Explore Purosangue parts <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </div>
    </div>
  </section>;
}
