'use client';

import Image from 'next/image';
import { ArrowRight, ArrowUpRight, Play } from 'lucide-react';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import styles from './valvetronic-sound-gallery.module.css';

const clips = [
  {
    id: 'revuelto',
    name: 'Lamborghini Revuelto',
    caption: 'Valvetronic Full F1',
    video: '118fc60699b64503bcea8b9ca24e3fc3/118fc60699b64503bcea8b9ca24e3fc3.HD-1080p-2.5Mbps-95046285.mp4',
    youtube: 'XchPymVzTx4',
  },
  {
    id: 'm5',
    name: 'BMW F90 M5',
    caption: 'Valvetronic Designs exhaust',
    video: 'cfd59ba306e640f3bf5ff3b1e5f0d36c/cfd59ba306e640f3bf5ff3b1e5f0d36c.HD-1080p-2.5Mbps-95046399.mp4',
    youtube: 'P44YUqYommI',
  },
  {
    id: 'r8-rear',
    name: 'Audi R8',
    caption: 'Valvetronic True F1',
    video: '5bf234628f5740acadc98fc9867edb0c/5bf234628f5740acadc98fc9867edb0c.HD-1080p-2.5Mbps-95046317.mp4',
    youtube: 'U3BDHvmVfJw',
  },
  {
    id: '812-rear',
    name: 'Ferrari 812 Superfast',
    caption: 'Valvetronic Designs exhaust',
    video: '0962955aab4e41bfa01cf4493d669c22/0962955aab4e41bfa01cf4493d669c22.HD-1080p-2.5Mbps-95045883.mp4',
    youtube: 'g_CofLAZsvg',
  },
];

export function ValvetronicSoundGallery() {
  const [activeClip, setActiveClip] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const player = useRef<HTMLVideoElement>(null);

  function playClip(id: string) {
    player.current?.pause();
    // Mount and start the player within the click so mobile browsers allow audio.
    flushSync(() => {
      setActiveClip(id);
      setFailed(false);
    });
    player.current?.focus({ preventScroll: true });
    void player.current?.play().catch(() => {
      // Native controls remain available if the browser requires another gesture.
    });
  }

  return (
    <section id="hear-the-difference" className={styles.section} aria-labelledby="valvetronic-sound-title">
      <div className={styles.intro}>
        <h2 id="valvetronic-sound-title">Hear the difference.</h2>
        <p>Listen to four Valvetronic exhaust setups, from the Revuelto to the 812 Superfast.</p>
      </div>
      <p className={styles.swipe} aria-hidden="true">Swipe for more <ArrowRight size={13} /></p>
      <div className={styles.gallery} role="region" aria-label="Valvetronic exhaust clips" tabIndex={0} data-lenis-prevent>
        {clips.map(clip => {
          const poster = `/images/partners/valvetronic-sound/${clip.id}.webp`;
          const isActive = activeClip === clip.id;

          return (
            <article className={styles.card} key={clip.id}>
              <div className={styles.media}>
                {isActive && failed ? (
                  <div className={styles.fallback}>
                    <p>This clip couldn’t load.</p>
                    <a href={`https://www.youtube.com/watch?v=${clip.youtube}`} target="_blank" rel="noopener noreferrer">
                      Watch {clip.name} on YouTube <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                  </div>
                ) : isActive ? (
                  <video
                    ref={player}
                    src={`https://cdn.shopify.com/videos/c/vp/${clip.video}`}
                    poster={poster}
                    controls
                    playsInline
                    preload="none"
                    aria-label={`${clip.name} exhaust video`}
                    onError={() => setFailed(true)}
                  />
                ) : (
                  <button type="button" className={styles.poster} onClick={() => playClip(clip.id)} aria-label={`Play ${clip.name} exhaust video`}>
                    <picture>
                      <source media="(max-width: 760px)" type="image/avif" srcSet={`/images/partners/valvetronic-mobile/${clip.id}.avif`} />
                      <source type="image/avif" srcSet={`/images/partners/valvetronic-mobile/${clip.id}.avif 320w, /images/partners/valvetronic-desktop/${clip.id}-640.avif 640w`} sizes="calc((min(100vw, 1360px) - 2 * clamp(24px, 5vw, 88px) - 3 * clamp(16px, 2vw, 24px)) / 4)" />
                      <Image src={poster} alt="" fill quality={60} sizes="(max-width: 760px) min(72vw, 260px), calc((min(100vw, 1360px) - 2 * clamp(24px, 5vw, 88px) - 3 * clamp(16px, 2vw, 24px)) / 4)" />
                    </picture>
                    <span className={styles.play} aria-hidden="true"><Play size={18} fill="currentColor" /></span>
                  </button>
                )}
              </div>
              <h3>{clip.name}</h3>
              <p>{clip.caption}</p>
            </article>
          );
        })}
      </div>
      <p className={styles.note}>Sound varies with the vehicle, exhaust setup and recording conditions.</p>
    </section>
  );
}
