'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { ExhaustScene } from '@/components/home/valvetronic-exhaust-scene';
import { valvetronicIntroPose } from './valvetronic-intro-motion';
import styles from './valvetronic-intro-exhaust.module.css';

export function ValvetronicIntroExhaust() {
  const stage = useRef<HTMLElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const scene = useRef<ExhaustScene | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
  const [introRevealed, setIntroRevealed] = useState(false);

  useEffect(() => {
    let disposed = false, started = false, ready = false, failed = false, completed = false, inView = false, introShown = false;
    let frame = 0, generation = 0, progress = 0, lastTick = 0;
    const duration = 1750;
    const mobile = matchMedia('(max-width: 1024px), (pointer: coarse)').matches;
    const compact = matchMedia('(max-width: 700px)');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const preloadDistance = mobile ? 900 : 1200;
    let sceneModule: Promise<typeof import('@/components/home/valvetronic-exhaust-scene')> | undefined;

    function showIntro() {
      if (introShown) return;
      introShown = true;
      setIntroRevealed(true);
    }
    function approaching() {
      const bounds = stage.current?.getBoundingClientRect();
      return bounds && bounds.top < innerHeight + preloadDistance && bounds.bottom > -preloadDistance;
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
      if (!started) return;
      generation++;
      started = false;
      ready = false;
      failed = false;
      pause();
      scene.current?.dispose();
      scene.current = null;
      setStatus('loading');
    }
    function start() {
      if (disposed || started || document.hidden || !mount.current || !approaching()) return;
      const run = ++generation;
      started = true;
      setStatus('loading');
      sceneModule ??= import('@/components/home/valvetronic-exhaust-scene');
      sceneModule.then(async ({ createExhaustScene }) => {
        if (disposed || run !== generation || !mount.current) return;
        const next = createExhaustScene(mount.current, {
          cinematic: true,
          floor: true,
          directProgress: true,
          topOverflow: () => stage.current ? parseFloat(getComputedStyle(stage.current).getPropertyValue('--exhaust-overlap')) || 0 : 0,
          reducedMotion: reducedMotion.matches,
          canvasLabel: 'Valvetronic Designs Huracán titanium exhaust system resting on a studio floor.',
          scrollPose: value => valvetronicIntroPose(value, compact.matches),
          onInteract: () => {},
          onError: () => {
            if (disposed || run !== generation) return;
            failed = true;
            ready = false;
            pause();
            scene.current?.dispose();
            scene.current = null;
            setStatus('unavailable');
            showIntro();
          },
        });
        scene.current = next;
        next.finish('titanium');
        next.progress(reducedMotion.matches ? 1 : progress);
        await next.prepare();
        if (disposed || run !== generation || failed || scene.current !== next) return;
        ready = true;
        setStatus('ready');
        reveal();
      }).catch(() => {
        if (disposed || run !== generation) return;
        ready = false;
        scene.current?.dispose();
        scene.current = null;
        setStatus('unavailable');
        showIntro();
      });
    }
    const preload = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) start();
      else if (mobile) release();
    }, { rootMargin: `${preloadDistance}px 0px` });
    const visibility = new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .2);
      if (inView) reveal();
      else pause();
    }, { threshold: [0, .2] });
    if (stage.current) { preload.observe(stage.current); visibility.observe(stage.current); }
    const motionChange = () => { release(); start(); };
    const pageVisibility = () => {
      if (document.hidden) { pause(); if (mobile) release(); }
      else { start(); reveal(); }
    };
    reducedMotion.addEventListener('change', motionChange);
    document.addEventListener('visibilitychange', pageVisibility);
    start();
    return () => {
      disposed = true;
      generation++;
      preload.disconnect();
      visibility.disconnect();
      pause();
      reducedMotion.removeEventListener('change', motionChange);
      document.removeEventListener('visibilitychange', pageVisibility);
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);

  return <figure ref={stage} className={styles.stage} data-valvetronic-intro-exhaust data-scene-status={status} data-intro-revealed={introRevealed}>
    <div ref={mount} className={`${styles.canvas} ${status === 'ready' ? styles.ready : ''}`} aria-hidden={status !== 'ready'} />
    {status === 'loading' && <span className={styles.loading} role="status">Loading the details</span>}
    {status === 'unavailable' && <Image className={styles.fallback} src="/images/home/valvetronic-huracan-exhaust-reference.webp" alt="Valvetronic Designs Huracán titanium exhaust system" fill sizes="100vw" />}
  </figure>;
}
