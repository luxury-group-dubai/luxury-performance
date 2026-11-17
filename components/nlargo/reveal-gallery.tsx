'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { nlargoGallery } from '@/lib/nlargo-allocation';
import { createRegisteredGalleryImage } from '@/lib/nlargo-gallery-registration';
import styles from './reveal-gallery.module.css';

function RegisteredGalleryImage({ src, sizes, onReady }: { src: string; sizes: string; onReady: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onReadyRef = useRef(onReady);
  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  const [registered, setRegistered] = useState(false);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const abort = new AbortController();
    let renderer: Awaited<ReturnType<typeof createRegisteredGalleryImage>> | undefined;
    let observer: ResizeObserver | undefined;
    function lost() { setRegistered(false); }
    canvas.addEventListener('webglcontextlost', lost);
    createRegisteredGalleryImage(canvas, '/images/nlargo/hero-front-quarter-light.webp', abort.signal).then(value => {
      if (abort.signal.aborted) { value.dispose(); return; }
      renderer = value;
      const resize = () => value.resize(canvas.clientWidth, canvas.clientHeight);
      resize(); observer = new ResizeObserver(resize); observer.observe(canvas);
      setRegistered(true); onReadyRef.current();
    }).catch(() => { /* Keep the ordinary image when GPU rendering is unavailable. */ });
    return () => { abort.abort(); observer?.disconnect(); renderer?.dispose(); canvas.removeEventListener('webglcontextlost', lost); };
  }, []);
  return <>
    <Image className={styles.lightImage} src={src} alt="" aria-hidden="true" fill sizes={sizes} onLoad={onReady} style={registered ? { visibility: 'hidden' } : undefined} />
    <canvas ref={canvasRef} className={`${styles.lightImage} ${styles.registeredLight}`} aria-hidden="true" style={{ visibility: registered ? 'visible' : 'hidden' }} data-registered-gallery />
  </>;
}

function RevealImage({ photo, featured, revealed, showPrompt, onReveal, onHide, onToggle }: {
  photo: (typeof nlargoGallery)[number];
  featured: boolean;
  revealed: boolean;
  showPrompt: boolean;
  onReveal: () => void;
  onHide: () => void;
  onToggle: () => void;
}) {
  const [lightReady, setLightReady] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);

  const sizes = featured ? '(max-width: 760px) 100vw, 67vw' : '(max-width: 760px) 100vw, 33vw';

  return <figure className={styles.card} data-featured={featured || undefined}>
    <button
      type="button"
      className={styles.imageButton}
      data-revealed={revealed && lightReady}
      data-alignment={photo.alignment}
      aria-label={`${photo.caption} — studio lighting`}
      aria-pressed={revealed}
      onPointerEnter={event => { if (event.pointerType === 'mouse') onReveal(); }}
      onPointerLeave={event => { if (event.pointerType === 'mouse') onHide(); }}
      onClick={() => { setPromptDismissed(true); onToggle(); }}
    >
      <Image src={photo.redSrc} alt={photo.alt} fill sizes={sizes} />
      {photo.alignment === 'front-quarter' ? <RegisteredGalleryImage src={photo.src} sizes={sizes} onReady={() => setLightReady(true)} /> :
        <Image className={styles.lightImage} src={photo.src} alt="" aria-hidden="true" fill sizes={sizes} onLoad={() => setLightReady(true)} />}
      {showPrompt && !promptDismissed && <span className={styles.tapPrompt} aria-hidden="true">Tap to switch lighting</span>}
    </button>
    <figcaption>{photo.caption}</figcaption>
  </figure>;
}

export function RevealGallery() {
  const grid = useRef<HTMLDivElement>(null);
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const [phoneScroll, setPhoneScroll] = useState(false);
  const [tabletTouch, setTabletTouch] = useState(false);

  useEffect(() => {
    const phone = window.matchMedia('(max-width: 600px) and (pointer: coarse)');
    const touch = window.matchMedia('(any-pointer: coarse)');
    let frame = 0;
    let lastScrollImage: number | null = null;

    function update() {
      frame = 0;
      // Screen size also excludes an iPad in a narrow Split View window.
      const smallScreen = Math.min(window.screen.width, window.screen.height) <= 600;
      const enabled = phone.matches && smallScreen;
      setPhoneScroll(enabled);
      setTabletTouch(touch.matches && !smallScreen);
      if (!enabled) return;

      const cards = Array.from(grid.current?.children ?? []);
      const viewport = window.visualViewport;
      const focusLine = (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight) * .45;
      // Shared boundaries keep the outgoing and incoming fades simultaneous,
      // including the small grid gap. No reveal until the first image reaches
      // the focus line; the last returns to red as it passes that same line.
      const bounds = cards.map(card => card.getBoundingClientRect());
      let next: number | null = null;
      if (bounds.length && focusLine >= bounds[0].top && focusLine < bounds[bounds.length - 1].bottom) {
        next = bounds.findIndex((rect, index) =>
          focusLine < (bounds[index + 1] ? (rect.bottom + bounds[index + 1].top) / 2 : rect.bottom));
      }
      if (next !== lastScrollImage) {
        lastScrollImage = next;
        setActiveImage(next);
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    function reset() {
      lastScrollImage = null;
      setActiveImage(null);
      schedule();
    }

    schedule();
    phone.addEventListener('change', reset);
    touch.addEventListener('change', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      phone.removeEventListener('change', reset);
      touch.removeEventListener('change', schedule);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
    };
  }, []);

  return <section id="gallery" className={styles.gallery} data-phone-scroll={phoneScroll} aria-labelledby="nlargo-gallery-title">
    <header className={styles.heading}>
      <div><p>Official NOVITEC photography</p><h2 id="nlargo-gallery-title">N-LARGO. Revealed.</h2></div>
      <p className={styles.hint}><span className={styles.desktopHint}>Hover to reveal the details</span><span className={styles.touchHint}>{phoneScroll ? 'Scroll to reveal' : ''}</span></p>
      <p className="sr-only">Each image is a button. Press Enter or Space to switch between red and studio lighting.</p>
    </header>
    <div ref={grid} className={styles.grid}>{nlargoGallery.map((photo, index) => <RevealImage
      key={photo.src}
      photo={photo}
      featured={index === 0}
      revealed={activeImage === index}
      showPrompt={tabletTouch && index === 0}
      onReveal={() => setActiveImage(index)}
      onHide={() => setActiveImage(current => current === index ? null : current)}
      onToggle={() => setActiveImage(current => current === index ? null : index)}
    />)}</div>
  </section>;
}
