'use client';

import { useId } from 'react';
import { useAuiState } from '@assistant-ui/react';
import { lxpLetterPaths, useLuperBrandMorph } from './use-luper-brand-morph';
import styles from './luper-avatar.module.css';

// Uneven lengths, radii and speeds keep the loading lights from forming one spinner.
const loadingTrails = [
  { radius:23.5, sweep:105, speed:.61, width:2.2, opacity:.7 },
  { radius:26, sweep:62, speed:.83, width:1.3, opacity:.5 },
  { radius:28, sweep:135, speed:1.07, width:1, opacity:.32 },
  { radius:24.5, sweep:48, speed:.53, width:2, opacity:.58 },
  { radius:27, sweep:84, speed:.74, width:1.4, opacity:.55 },
  { radius:29, sweep:56, speed:.97, width:.9, opacity:.3 },
  { radius:25, sweep:120, speed:.68, width:1.6, opacity:.44 },
  { radius:27.5, sweep:42, speed:.89, width:1.2, opacity:.45 },
  { radius:24, sweep:72, speed:.57, width:1.8, opacity:.52 },
  { radius:28.5, sweep:96, speed:1.13, width:.8, opacity:.25 },
  { radius:26.5, sweep:52, speed:.79, width:1.5, opacity:.5 },
  { radius:23, sweep:92, speed:.93, width:1.2, opacity:.4 },
];

export function LuperAvatar({ size = 44, interactive = false }: { size?: number; interactive?: boolean }) {
  const id = useId().replace(/:/g, '');
  const { avatarRef, playBrandAnimation } = useLuperBrandMorph();
  const mood = useAuiState(state => {
    const last = state.thread.messages.at(-1);
    if (state.thread.isRunning) {
      const hasReply = last?.role === 'assistant' && last.content.some(part => part.type === 'text' && part.text.trim());
      return hasReply ? 'replying' : 'thinking';
    }
    if (state.composer.text.trim()) return 'typing';
    if (last?.role === 'assistant' && last.status.type === 'incomplete' && last.status.reason === 'error') return 'error';
    return 'idle';
  });

  const avatar = <svg ref={avatarRef} className={styles.avatar} data-mood={mood} width={size} height={size} viewBox="8 8 64 64" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id={`${id}-body`} cx=".32" cy=".22" r=".8">
        <stop stopColor="#353b40"/><stop offset=".65" stopColor="#10191e"/><stop offset="1" stopColor="#080e12"/>
      </radialGradient>
      <radialGradient id={`${id}-aura-fade`}>
        <stop stopColor="#ffffff" stopOpacity=".8"/><stop offset=".64" stopColor="#ffffff" stopOpacity=".9"/><stop offset=".8" stopColor="#ffffff" stopOpacity=".3"/><stop offset="1" stopColor="#ffffff" stopOpacity="0"/>
      </radialGradient>
      <mask id={`${id}-thinking-aura-mask`} maskUnits="userSpaceOnUse" x="6" y="6" width="68" height="68">
        <circle cx="40" cy="40" r="34" fill={`url(#${id}-aura-fade)`}/>
      </mask>
      <radialGradient id={`${id}-white-aura`}>
        <stop stopColor="#ffffff" stopOpacity=".5"/><stop offset=".65" stopColor="#ffffff" stopOpacity=".5"/><stop offset=".82" stopColor="#ffffff" stopOpacity=".15"/><stop offset="1" stopColor="#ffffff" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id={`${id}-white-glow`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#ffffff" stopOpacity="0"/><stop offset="1" stopColor="#ffffff"/>
      </linearGradient>
      <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter>
      <filter id={`${id}-loading-glow`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.1"/></filter>
      <clipPath id={`${id}-terminal-slice`}><rect x="-60" y="110" width="1208" height="65"/></clipPath>
    </defs>
    <circle className={styles.whiteAura} cx="40" cy="40" r="34" fill={`url(#${id}-white-aura)`}/>
    <g className={styles.gradientRotation}>
      <circle className={styles.thinkingAura} cx="40" cy="40" r="34" fill="#ffffff" mask={`url(#${id}-thinking-aura-mask)`}/>
    </g>
    <g className={styles.loadingGlow} fill="none" strokeLinecap="round" filter={`url(#${id}-loading-glow)`}>
      {loadingTrails.map((trail, index) => {
        const angle = trail.sweep * Math.PI / 180;
        const endX = 40 + trail.radius * Math.sin(angle);
        const endY = 40 - trail.radius * Math.cos(angle);
        return <g key={index} className={styles.loadingTrail} opacity={trail.opacity}
          style={{ animationDuration:`${trail.speed * .5}s`, animationDelay:`${-index * .173}s`, animationDirection:index % 4 === 2 ? 'reverse' : 'normal' }}>
          <path d={`M40 ${40 - trail.radius} A${trail.radius} ${trail.radius} 0 0 1 ${endX} ${endY}`}
            stroke={`url(#${id}-white-glow)`} strokeWidth={trail.width}
            style={{ animationDuration:`${1.1 + index * .13}s`, animationDelay:`${-index * .31}s` }}/>
        </g>;
      })}
    </g>
    <g className={styles.shell}>
      <circle className={styles.halo} cx="40" cy="40" r="25" fill="none" stroke="#ffffff" strokeWidth="3" filter={`url(#${id}-glow)`}/>
      <g className={styles.gradientRotation}>
        <circle className={`${styles.thinkingRimGlow} ${styles.ring}`} cx="40" cy="40" r="24.5" fill="none" stroke="#ffffff" strokeWidth="5" filter={`url(#${id}-glow)`}/>
        <circle className={styles.ring} cx="40" cy="40" r="24.5" fill="#ffffff"/>
      </g>
      <circle className={styles.orb} cx="40" cy="40" r="20" fill={`url(#${id}-body)`}/>
      <g className={styles.expression}>
      <g className={styles.face} fill="#ffffff">
        <g className={styles.readingEyes}>
          <g className={styles.eyes}>
            <g className={styles.eyeSlot}><ellipse data-eye-shape="" cx="33" cy="40" rx="3.5" ry="6"/></g>
            <g className={styles.eyeSlot}><circle data-eye-shape="" className={styles.middleEye} cx="40" cy="40" r="0"/></g>
            <g className={styles.eyeSlot}><ellipse data-eye-shape="" cx="47" cy="40" rx="3.5" ry="6"/></g>
          </g>
        </g>
      </g>
      </g>
      <g className={styles.brandLogo} data-brand-contours="" fill="#ffffff"
        transform="translate(40 40) scale(0.023897059) translate(-552 -150)">
        <g data-brand-letters="">
          {lxpLetterPaths.map((path, index) => <path key={index} d={path}/>)}
        </g>
        <g data-brand-square-eyes="" opacity="0">
          <rect x="194" y="30" width="240" height="240"/>
          <rect x="670" y="30" width="240" height="240"/>
        </g>
        <rect data-brand-cursor="" x="8" y="10" width="66" height="280" opacity="0"/>
        <g data-brand-glitch="" clipPath={`url(#${id}-terminal-slice)`} opacity="0">
          {lxpLetterPaths.map((path, index) => <path key={index} d={path}/>)}
        </g>
      </g>
    </g>
  </svg>;

  return interactive ? <button type="button" className={styles.avatarButton}
    aria-label="Animate Luper’s LXP expression"
    onClick={playBrandAnimation}>{avatar}</button> : avatar;
}
