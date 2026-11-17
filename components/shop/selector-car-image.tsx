'use client';
/* eslint-disable @next/next/no-img-element */

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from './selector-car-image.module.css';

type Props = {
  src: string;
  placeholder: string;
  width: number;
  height: number;
  sizes?: string;
  optimized?: boolean;
};

export function SelectorCarImage(props: Props) {
  return <CarReveal key={props.src} {...props} />;
}

function CarReveal({ src, placeholder, width, height, sizes, optimized = true }: Props) {
  const image = useRef<HTMLImageElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const element = image.current;
    if (!element) return;
    let active = true;
    const reveal = async () => {
      if (!element.naturalWidth) return;
      try {
        await element.decode();
        if (active) setReady(true);
      } catch { /* Keep the silhouette if the full image cannot be decoded. */ }
    };
    element.addEventListener('load', reveal);
    if (element.complete) void reveal();
    return () => { active = false; element.removeEventListener('load', reveal); };
  }, []);

  const attributes = { src, width, height, ref: image };
  return <span className={styles.frame} data-ready={ready} aria-hidden="true">
    <span className={styles.placeholder}><img src={placeholder} width={width} height={height} alt="" /></span>
    <span className={styles.artwork}>{optimized ? <Image {...attributes} alt="" sizes={sizes} /> : <img {...attributes} alt="" loading="lazy" />}</span>
  </span>;
}
