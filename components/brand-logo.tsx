import Image from 'next/image';

/** Approved winged vector emblem with the company wordmark. */
export function BrandLogo({ priority = false, wordmark = true }: { priority?: boolean; wordmark?: boolean }) {
  return <span className="company-logo">
    <Image className="company-emblem" src="/brand/lxp-winged-white.svg" alt={wordmark ? '' : 'Luxury Performance'} width={1868} height={728} sizes="180px" priority={priority} />
    {wordmark ? <svg className="company-wordmark" viewBox="0 0 900 65" aria-label="Luxury Performance" focusable="false"><text x="0" y="55" textLength="900" lengthAdjust="spacingAndGlyphs">LUXURY PERFORMANCE</text></svg> : <span className="sr-only">Luxury Performance</span>}
  </span>;
}
