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
  useEffect(() => { if (demo) replay.current?.(); }, [demo]);
  useEffect(() => {
    const root = rootRef.current, canvas = root?.querySelector('canvas'), hero = root?.closest('section');
    if (!root || !canvas || !hero) return;
    const abort = new AbortController();
    let renderer: Awaited<ReturnType<typeof createFluidReveal>> | undefined;
    let timer = 0;
    let simple = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    onReady(false); setStill(false); setFallback(simple);
    function flash() { setStill(true); window.clearTimeout(timer); timer=window.setTimeout(()=>setStill(false),500); }
    function move(event: PointerEvent) {
      if ((event.target as Element).closest('a,button,input,select,textarea')) return;
      if (simple) return;
      const rect=root!.getBoundingClientRect();
      if(event.clientY<rect.top||event.clientY>rect.bottom)return;
      renderer?.move(event.clientX-rect.left,event.clientY-rect.top);
    }
    function down(event: PointerEvent) {
      if ((event.target as Element).closest('a,button,input,select,textarea'))return;
      if(simple)flash();else if(event.pointerType!=='mouse')move(event);
    }
    function resize(){renderer?.resize(root!.clientWidth,root!.clientHeight);}
    function visibility(){if(document.hidden)renderer?.stop();}
    function lost(event: Event){event.preventDefault();renderer?.stop();simple=true;setFallback(true);onReady(true);}
    replay.current=()=>simple?flash():renderer?.play();
    const observer=new ResizeObserver(resize);observer.observe(root);
    const intersection=new IntersectionObserver(entries=>{if(!entries[0]?.isIntersecting)renderer?.stop();});intersection.observe(root);
    if(simple)onReady(true);
    else createFluidReveal(canvas,light,abort.signal).then(value=>{
      if(abort.signal.aborted){value.dispose();return;}
      renderer=value;resize();onReady(true);
    }).catch(()=>{if(!abort.signal.aborted){simple=true;setFallback(true);onReady(true);}});
    hero.addEventListener('pointermove',move);hero.addEventListener('pointerdown',down);
    canvas.addEventListener('webglcontextlost',lost);document.addEventListener('visibilitychange',visibility);
    return()=>{abort.abort();window.clearTimeout(timer);renderer?.dispose();observer.disconnect();intersection.disconnect();replay.current=null;hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerdown',down);canvas.removeEventListener('webglcontextlost',lost);document.removeEventListener('visibilitychange',visibility);};
  },[light,onReady]);
  return <div ref={rootRef} className={styles.viewport} aria-hidden="true">
    <canvas className={styles.canvas} hidden={fallback} data-fluid-trail />
    {fallback && <div className={styles.fallback} data-visible={still}><AllocationHeroArt image={light}/></div>}
    <div className={styles.hint}>{fallback ? 'Tap the car to switch lighting' : <><span className={styles.mouse}>Move to reveal the light</span><span className={styles.touch}>Move your finger across the car</span></>}</div>
  </div>;
}
