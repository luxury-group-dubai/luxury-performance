import Image from 'next/image';

/** Approved winged vector emblem with the company wordmark. */
export function BrandLogo({ priority = false, wordmark = true }: { priority?: boolean; wordmark?: boolean }) {
  return <span className="company-logo">
    <Image className="company-emblem" src="/brand/lxp-winged-white.svg" alt="" width={1868} height={728} sizes="180px" priority={priority} />
    {wordmark && <span className="company-wordmark">Luxury Performance</span>}
  </span>;
}
