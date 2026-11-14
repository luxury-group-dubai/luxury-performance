import Image from 'next/image';
import { useId } from 'react';
import styles from './brand-artwork.module.css';

const artwork: Record<string, { name: string; src: string; width: number; height: number }> = {
  novitec: { name: 'NOVITEC', src: '/brand/novitec.svg', width: 228, height: 45 },
  valvetronic: { name: 'Valvetronic Designs', src: '/brand/valvetronic-compact.avif', width: 384, height: 97 },
  techart: { name: 'TECHART', src: '/brand/techart.svg', width: 487, height: 35 },
  'fi-exhaust': { name: 'FI Exhaust', src: '/brand/fi-exhaust.svg', width: 163, height: 64 },
  capristo: { name: 'Capristo', src: '/brand/capristo.svg', width: 537, height: 116 },
  gintani: { name: 'Gintani', src: '/brand/gintani.png', width: 2193, height: 665 },
  'liberty-walk': { name: 'Liberty Walk', src: '/brand/liberty-walk-symbol.png', width: 163, height: 177 },
  voltrix: { name: 'Voltrix', src: '/brand/voltrix.jpg', width: 1600, height: 260 },
  urban: { name: 'URBAN Automotive', src: '/brand/urban.svg', width: 644, height: 102 },
  lxp: { name: 'Luxury Performance', src: '/brand/lxp-white.svg', width: 1088, height: 280 },
  collectibles: { name: 'LXP Collectibles', src: '/brand/lxp-collectibles-sticker-bottle-cap.png', width: 1072, height: 521 },
};

function CompactValvetronic({ sizes, loading }: { sizes: string; loading: 'eager' | 'lazy' }) {
  // Precompressed AVIF variants avoid converting the same logo a second time.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/valvetronic-compact.avif" srcSet="/brand/valvetronic-compact-200.avif 200w, /brand/valvetronic-compact.avif 384w" sizes={sizes} alt="" width={384} height={97} loading={loading} decoding="async" />;
}

/** Shared original artwork for the partner strip and both navigation menus. */
export function BrandArtwork({ brand, labelled = true, className = '', sizes = '200px', loading = 'eager', variant = 'compact' }: { brand: string; labelled?: boolean; className?: string; sizes?: string; loading?: 'eager' | 'lazy'; variant?: 'compact' | 'hero' }) {
  const filterId = `brand-alpha-${useId().replace(/:/g, '')}`;
  const item = artwork[brand];
  if (!item) return null;
  return <span className={`${styles.artwork} ${className}`} data-brand-artwork={brand} role={labelled ? 'img' : undefined} aria-label={labelled ? item.name : undefined}>
    {brand === 'fi-exhaust' || brand === 'liberty-walk' ? <span className={brand === 'fi-exhaust' ? styles.fi : styles.liberty}>
      <Image src={item.src} alt="" width={item.width} height={item.height} sizes={brand === 'fi-exhaust' ? '60px' : '40px'} unoptimized={item.src.endsWith('.svg') || item.src.endsWith('.avif')} loading={loading} />
      <Image src={brand === 'fi-exhaust' ? '/brand/fi-exhaust-lettering.png' : '/brand/liberty-walk-lettering.png'} alt="" width={brand === 'fi-exhaust' ? 535 : 1200} height={brand === 'fi-exhaust' ? 73 : 137} sizes={brand === 'fi-exhaust' ? (variant === 'hero' ? '(max-width: 700px) 156px, 303px' : '(max-width: 700px) 110px, 128px') : '(max-width: 700px) 140px, 164px'} quality={variant === 'hero' ? 90 : 75} loading={loading} />
    </span> : brand === 'voltrix' ? <svg viewBox="0 0 1600 260" aria-hidden="true">
      <defs><filter id={filterId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 -0.2126 -0.7152 -0.0722 1 0" /></filter></defs>
      <image href={item.src} width="1600" height="260" filter={`url(#${filterId})`} />
    </svg> : brand === 'valvetronic' ? (
      variant === 'hero'
        ? <Image src="/brand/valvetronic.png" alt="" width={1200} height={304} sizes={sizes} quality={90} loading={loading} />
        : <CompactValvetronic sizes={sizes} loading={loading} />
    ) : <Image src={item.src} alt="" width={item.width} height={item.height} sizes={brand === 'collectibles' ? '160px' : sizes} quality={75} unoptimized={item.src.endsWith('.svg') || item.src.endsWith('.avif')} loading={loading} />}
  </span>;
}
