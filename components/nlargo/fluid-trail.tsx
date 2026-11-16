'use client';

import { useEffect, useRef, useState } from 'react';
import { AllocationHeroArt } from './allocation-hero';
import type { NlargoHeroImage } from '@/lib/nlargo-hero-images';
import { createFluidReveal } from '@/lib/nlargo-fluid-renderer';
import styles from './fluid-trail.module.css';

const ignoreReady = () => {};

export function FluidTrail({ light, demo = 0, onReady = ignoreReady }: { light: NlargoHeroImage; demo?: number; onReady?: (ready: boolean) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const replay = useRef<(() => void) | null>(null);
  const [fallback, setFallback] = useState(false);
  const [still, setStill] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  useEffect(() => { if (demo) replay.current?.(); }, [demo]);
  useEffect(() => {
    const root = rootRef.current, canvas = root?.querySelector('canvas'), hero = root?.closest('section');
    if (!root || !canvas || !hero) return;
    const abort = new AbortController();
    let renderer: Awaited<ReturnType<typeof createFluidReveal>> | undefined;
    let timer = 0, reminder = 0, reminderEnd = 0;
    let inView = true;
    let touch: { id: number; x: number; y: number; horizontal: boolean } | null = null;
    function tried() {
      setHintVisible(false);
      window.clearTimeout(reminder); window.clearTimeout(reminderEnd);
      reminder = window.setTimeout(() => {
        if (!inView || document.hidden) return;
        setHintVisible(true);
        reminderEnd = window.setTimeout(() => setHintVisible(false), 6000);
      }, 20000);
    }
    function end(event: PointerEvent) { if (touch?.id === event.pointerId) touch = null; }
    let simple = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    onReady(false); setStill(false); setFallback(simple); setHintVisible(true);
    function flash() { setStill(true); window.clearTimeout(timer); timer=window.setTimeout(()=>setStill(false),500); }
    function move(event: PointerEvent) {
      if ((event.target as Element).closest('a,button,input,select,textarea')) return;
      if (simple) return;
      const rect=root!.getBoundingClientRect();
      if(event.clientY<rect.top||event.clientY>rect.bottom)return;
      if (event.pointerType !== 'mouse') {
        if (!touch || touch.id !== event.pointerId || !renderer) return;
        const dx = Math.abs(event.clientX - touch.x), dy = Math.abs(event.clientY - touch.y);
        if (!touch.horizontal) {
          if (dy > 12 && dy > dx) { touch = null; return; }
          if (dx < 18 || dx < dy * 1.3) return;
          touch.horizontal = true;
          renderer.move(touch.x - rect.left, touch.y - rect.top);
        }
        tried();
      }
      renderer?.move(event.clientX-rect.left,event.clientY-rect.top);
    }
    function down(event: PointerEvent) {
      if ((event.target as Element).closest('a,button,input,select,textarea'))return;
      const rect = root!.getBoundingClientRect();
      if (event.clientY < rect.top || event.clientY > rect.bottom) return;
      if (simple) { flash(); if (event.pointerType !== 'mouse') tried(); }
      else if (event.pointerType !== 'mouse') touch = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
    }
    function resize(){renderer?.resize(root!.clientWidth,root!.clientHeight);}
    function visibility(){if(document.hidden)renderer?.stop();}
    function lost(event: Event){event.preventDefault();renderer?.stop();simple=true;setFallback(true);onReady(true);}
    replay.current=()=>simple?flash():renderer?.play();
    const observer=new ResizeObserver(resize);observer.observe(root);
    const intersection=new IntersectionObserver(entries=>{inView=!!entries[0]?.isIntersecting;if(!inView){renderer?.stop();touch=null;}});intersection.observe(root);
    if(simple)onReady(true);
    else createFluidReveal(canvas,light,abort.signal).then(value=>{
      if(abort.signal.aborted){value.dispose();return;}
      renderer=value;resize();onReady(true);
    }).catch(()=>{if(!abort.signal.aborted){simple=true;setFallback(true);onReady(true);}});
    hero.addEventListener('pointermove',move);hero.addEventListener('pointerdown',down);hero.addEventListener('pointerup',end);hero.addEventListener('pointercancel',end);
    canvas.addEventListener('webglcontextlost',lost);document.addEventListener('visibilitychange',visibility);
    return()=>{abort.abort();window.clearTimeout(timer);window.clearTimeout(reminder);window.clearTimeout(reminderEnd);renderer?.dispose();observer.disconnect();intersection.disconnect();replay.current=null;hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerdown',down);hero.removeEventListener('pointerup',end);hero.removeEventListener('pointercancel',end);canvas.removeEventListener('webglcontextlost',lost);document.removeEventListener('visibilitychange',visibility);};
  },[light,onReady]);
  return <div ref={rootRef} className={styles.viewport} aria-hidden="true">
    <canvas className={styles.canvas} hidden={fallback} data-fluid-trail />
    {fallback && <div className={styles.fallback} data-visible={still}><AllocationHeroArt image={light}/></div>}
    <div className={styles.hint} data-visible={hintVisible}>{fallback ? 'Tap the car to switch lighting' : <><span className={styles.mouse}>Move to reveal the light</span><span className={styles.touch}>Swipe to reveal</span></>}</div>
  </div>;
}
