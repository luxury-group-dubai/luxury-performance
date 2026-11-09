'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import type { ExhaustScene } from '@/components/home/valvetronic-exhaust-scene';
import { valvetronicIntroPose } from './valvetronic-intro-motion';
import styles from './valvetronic-intro-exhaust.module.css';

type SceneDisplay =
  | { status: 'loading' | 'unavailable'; progress: number }
  | { status: 'ready'; generation: number };

const openingPoster = '/images/partners/valvetronic-exhaust-opening';
const settledPoster = '/images/partners/valvetronic-exhaust-settled';
const desktopPosterSizes = 'clamp(1108px, 110.77vw, 1600px)';
const desktopPosterSrcSet = (pose: 'opening' | 'settled') => [960, 1280, 1480, 1600]
  .map(width => `/images/partners/valvetronic-desktop/exhaust-${pose}-${width}.avif ${width}w`).join(', ');
const exhaustLabel = 'Valvetronic Designs Huracán titanium exhaust system';

const staticSceneQuery = '(max-width: 1024px), (pointer: coarse), (prefers-reduced-motion: reduce)';
function subscribeToScenePreference(onChange: () => void) {
  const preference = matchMedia(staticSceneQuery);
  preference.addEventListener('change', onChange);
  return () => preference.removeEventListener('change', onChange);
}
const prefersStaticScene = () => matchMedia(staticSceneQuery).matches;
const serverScenePreference = () => false;


function ExhaustPoster({ progress }: { progress: number }) {
  const referenceProgress = progress === 1 ? 1 : 0;
  const source = referenceProgress ? settledPoster : openingPoster;
  const pose = valvetronicIntroPose(progress);
  const reference = valvetronicIntroPose(referenceProgress);
  const framing = {
    '--poster-motion-zoom': (pose.zoom ?? 1) / (reference.zoom ?? 1),
    '--poster-wide-y': pose.framingY ?? 0,
    '--poster-wide-reference-y': reference.framingY ?? 0,
    '--poster-compact-y': valvetronicIntroPose(progress, true).framingY ?? 0,
    '--poster-compact-reference-y': valvetronicIntroPose(referenceProgress, true).framingY ?? 0,
  } as CSSProperties;

  return <picture className={styles.poster} style={framing}>
    <source media="(max-width: 700px)" srcSet={`${settledPoster}-mobile.webp`} />
    <source media="(max-width: 1024px), (pointer: coarse)" srcSet={`${settledPoster}.webp`} />
    <source media="(prefers-reduced-motion: reduce) and (max-width: 700px), (scripting: none) and (max-width: 700px)" srcSet={`${settledPoster}-mobile.webp`} />
    <source media="(prefers-reduced-motion: reduce), (scripting: none)" type="image/avif" srcSet={desktopPosterSrcSet('settled')} sizes={desktopPosterSizes} />
    <source media="(prefers-reduced-motion: reduce), (scripting: none)" srcSet={`${settledPoster}.webp`} />
    <source type="image/avif" srcSet={desktopPosterSrcSet(referenceProgress ? 'settled' : 'opening')} sizes={desktopPosterSizes} />
    <Image src={`${source}.webp`} alt={exhaustLabel} width={1600} height={880} unoptimized loading="eager" />
  </picture>;
}

export function ValvetronicIntroExhaust() {
  const staticScene = useSyncExternalStore(subscribeToScenePreference, prefersStaticScene, serverScenePreference);
  const stage = useRef<HTMLElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const scene = useRef<ExhaustScene | null>(null);
  const present = useRef<((generation: number) => void) | null>(null);
  const [display, setDisplay] = useState<SceneDisplay>({ status: 'loading', progress: 0 });
  const [introRevealed, setIntroRevealed] = useState(false);

  useEffect(() => {
    let disposed = false, started = false, ready = false, failed = false, completed = false, inView = false, introShown = false;
    let frame = 0, generation = 0, progress = 0, lastTick = 0;
    let preparationTimer: ReturnType<typeof setTimeout> | undefined;
    const duration = 1750;
    const mobile = matchMedia('(max-width: 1024px), (pointer: coarse)').matches;
    const compact = matchMedia('(max-width: 700px)');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    // The mobile still preserves the final composition without constructing the
    // procedural meshes, textures and shaders on the page's main thread.
    if (staticScene || mobile || reducedMotion.matches) return;
    let sceneModule: Promise<typeof import('@/components/home/valvetronic-exhaust-scene')> | undefined;

    function showIntro() {
      if (introShown) return;
      introShown = true;
      setIntroRevealed(true);
    }
    function pause() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTick = 0;
    }
    function reveal() {
      if (!ready || !inView || !scene.current || document.hidden) return;
      if (completed || reducedMotion.matches) {
        pause();
        completed = true;
        progress = 1;
        scene.current.progress(1);
        showIntro();
        return;
      }
      // Re-entering the viewport resumes the current drop; it never finishes it.
      if (frame) return;
      lastTick = 0;
      function animate(now: number) {
        frame = 0;
        if (disposed || !ready || !inView || !scene.current || document.hidden) { lastTick = 0; return; }
        // A busy first frame or a hidden tab must not consume the whole reveal.
        const delta = lastTick ? Math.min(64, Math.max(0, now - lastTick)) : 0;
        lastTick = now;
        progress = Math.min(1, progress + delta / duration);
        scene.current.progress(progress);
        if (progress >= .14) showIntro();
        if (progress < 1) frame = requestAnimationFrame(animate);
        else { completed = true; lastTick = 0; }
      }
      frame = requestAnimationFrame(animate);
    }
    function release() {
      clearTimeout(preparationTimer);
      if (!started) return;
      generation++;
      started = false;
      ready = false;
      failed = false;
      pause();
      scene.current?.dispose();
      scene.current = null;
      setDisplay({ status: 'loading', progress });
    }
    function unavailable(run: number) {
      if (disposed || run !== generation) return;
      failed = true;
      clearTimeout(preparationTimer);
      ready = false;
      pause();
      scene.current?.dispose();
      scene.current = null;
      setDisplay({ status: 'unavailable', progress: 1 });
      showIntro();
    }
    function start() {
      if (disposed || started || document.hidden || !mount.current || !inView) return;
      const run = ++generation;
      started = true;
      setDisplay({ status: 'loading', progress });
      sceneModule ??= import('@/components/home/valvetronic-exhaust-scene');
      sceneModule.then(async ({ createExhaustScene }) => {
        if (disposed || run !== generation || !mount.current) return;
        const next = createExhaustScene(mount.current, {
          quality: 'balanced',
          cinematic: true,
          floor: true,
          directProgress: true,
          fitWithZoom: true,
          topOverflow: () => stage.current ? parseFloat(getComputedStyle(stage.current).getPropertyValue('--exhaust-overlap')) || 0 : 0,
          reducedMotion: reducedMotion.matches,
          canvasLabel: exhaustLabel,
          scrollPose: value => valvetronicIntroPose(value, compact.matches),
          onInteract: () => {},
          onError: () => unavailable(run),
        });
        scene.current = next;
        preparationTimer = setTimeout(() => unavailable(run), 8000);
        next.finish('titanium');
        next.progress(reducedMotion.matches ? 1 : progress);
        await next.prepare();
        if (disposed || run !== generation || failed || scene.current !== next) return;
        clearTimeout(preparationTimer);
        setDisplay({ status: 'ready', generation: run });
      }).catch(() => unavailable(run));
    }
    const visibility = new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .2);
      if (inView) { start(); reveal(); }
      else pause();
    }, { threshold: [0, .2] });
    if (stage.current) visibility.observe(stage.current);
    const motionChange = () => { release(); start(); };
    const pageVisibility = () => {
      if (document.hidden) { pause(); if (mobile) release(); }
      else { start(); reveal(); }
    };
    reducedMotion.addEventListener('change', motionChange);
    document.addEventListener('visibilitychange', pageVisibility);
    present.current = run => {
      if (disposed || run !== generation || failed) return;
      ready = true;
      reveal();
    };
    return () => {
      disposed = true;
      clearTimeout(preparationTimer);
      generation++;
      present.current = null;
      visibility.disconnect();
      pause();
      reducedMotion.removeEventListener('change', motionChange);
      document.removeEventListener('visibilitychange', pageVisibility);
      scene.current?.dispose();
      scene.current = null;
    };
  }, [staticScene]);

  useEffect(() => {
    // Begin moving after React has presented the prepared frame in place of the still.
    if (display.status === 'ready') present.current?.(display.generation);
  }, [display]);

  const isReady = !staticScene && display.status === 'ready';
  return <figure ref={stage} className={styles.stage} data-valvetronic-intro-exhaust data-scene-status={staticScene ? 'static' : display.status} data-intro-revealed={staticScene || introRevealed}>
    <div ref={mount} className={`${styles.canvas} ${isReady ? styles.ready : ''}`} aria-hidden={!isReady} />
    {!isReady && <ExhaustPoster progress={staticScene ? 1 : display.status === 'ready' ? 1 : display.progress} />}
  </figure>;
}
