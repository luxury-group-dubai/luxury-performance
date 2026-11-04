'use client';
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, ShoppingBag, X } from 'lucide-react';
import { SocialIcon } from '@/components/social-links';
import type { CatalogProduct } from '@/lib/shop/types';
import { money } from '@/lib/shop/types';
import styles from './novitec-feed.module.css';

type FeedLook = { name: string; image: string; gallery?: string[]; imageRatios?: number[]; products: CatalogProduct[]; fallback: string };
export function NovitecFeed({ looks }: { looks: FeedLook[] }) {
  const [selected, setSelected] = useState<FeedLook | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const photos = useRef<HTMLDivElement>(null);
  const photoWidth = useRef(0);
  const closeButton = useRef<HTMLButtonElement>(null);
  const images = selected ? [...new Set([selected.image, ...(selected.gallery || [])])] : [];
  const imageRatio = selected?.imageRatios?.[photoIndex] ?? 3 / 4;

  useEffect(() => {
    if (!selected) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';
    closeButton.current?.focus({ preventScroll: true });
    const track = photos.current;
    // Align every slide with physical pixels so fractional widths cannot reveal an edge.
    const resize = new ResizeObserver(([entry]) => {
      const pixels = window.devicePixelRatio || 1;
      const width = Math.ceil(entry.contentRect.width * pixels) / pixels;
      if (!track || width <= 0 || width === photoWidth.current) return;
      photoWidth.current = width;
      track.style.setProperty('--photo-slide-width', `${width}px`);
    });
    if (track) resize.observe(track);
    return () => { resize.disconnect(); root.style.overflow = previous; };
  }, [selected]);

  function open(look: FeedLook) {
    setPhotoIndex(0);
    photoWidth.current = 0;
    setSelected(look);
    dialog.current?.showModal();
  }
  function showPhoto(index: number) {
    const track = photos.current;
    if (!track) return;
    track.scrollTo({ left: index * (photoWidth.current || track.clientWidth), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }

  return <section id="novitec-feed" className={styles.section} aria-labelledby="feed-title">
    <div className={styles.heading}><div><h2 id="feed-title">Shop the feed</h2><p>Explore the parts behind the cars.</p></div><a href="https://www.instagram.com/lxp.official/" target="_blank" rel="noopener noreferrer" className={styles.follow}><SocialIcon type="instagram" />Follow @lxp.official <ArrowUpRight size={16} aria-hidden="true" /></a></div>
    <ul className={styles.grid}>{looks.map(look => <li key={look.name}><button type="button" className={styles.card} onClick={() => open(look)} aria-label={`Shop the ${look.name} look`} aria-haspopup="dialog" aria-controls="novitec-look-dialog">
      <Image src={look.image} alt={`${look.name} with NOVITEC upgrades`} fill sizes="(max-width: 700px) 33vw, 25vw" />
      <span className={styles.shopIcon} aria-hidden="true"><ShoppingBag size={18} strokeWidth={1.5} /></span>
      <span className={styles.cardText}><span>{look.name}</span><span>Shop the look <ArrowUpRight size={15} aria-hidden="true" /></span></span>
    </button></li>)}</ul>
    <dialog id="novitec-look-dialog" ref={dialog} className={styles.dialog} style={{ '--look-ratio': imageRatio } as CSSProperties} onClose={() => setSelected(null)} aria-labelledby="look-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      {selected && <>
        <button ref={closeButton} type="button" className={styles.close} onClick={() => dialog.current?.close()} aria-label="Close"><X size={20} /></button>
        <div className={styles.dialogContent}>
          <div className={styles.gallery} role="region" aria-roledescription="carousel" aria-label={`${selected.name} photos`}>
            <div ref={photos} className={styles.photos} data-lenis-prevent tabIndex={0} aria-label="Photos. Swipe or use the left and right arrow keys." onScroll={event => { const track = event.currentTarget; const width = photoWidth.current || track.clientWidth; if (width) setPhotoIndex(Math.max(0, Math.min(images.length - 1, Math.round(track.scrollLeft / width)))); }} onKeyDown={event => {
              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
              event.preventDefault();
              showPhoto(Math.max(0, Math.min(images.length - 1, photoIndex + (event.key === 'ArrowRight' ? 1 : -1))));
            }}>
              {images.map((src, index) => <div key={src} className={styles.slide} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${images.length}`} aria-hidden={index !== photoIndex}>
                {Math.abs(index - photoIndex) <= 1 && <Image src={src} alt={`${selected.name} with NOVITEC upgrades, photo ${index + 1}`} fill sizes="(max-width: 700px) 100vw, (max-width: 1200px) 55vw, 600px" draggable={false} />}
              </div>)}
            </div>
            {images.length > 1 && <>
              <button type="button" className={`${styles.photoArrow} ${styles.previous}`} aria-label="Previous photo" disabled={photoIndex === 0} onClick={() => showPhoto(photoIndex - 1)}><ArrowLeft size={20} aria-hidden="true" /></button>
              <button type="button" className={`${styles.photoArrow} ${styles.next}`} aria-label="Next photo" disabled={photoIndex === images.length - 1} onClick={() => showPhoto(photoIndex + 1)}><ArrowRight size={20} aria-hidden="true" /></button>
              <div className={styles.photoDots} aria-hidden="true">{images.map((src, index) => <span key={src} data-active={index === photoIndex} />)}</div>
            </>}
            <span className="sr-only" role="status">Photo {photoIndex + 1} of {images.length}</span>
          </div>
          <div className={styles.details} data-lenis-prevent>
            <div className={styles.dialogHead}><span className={styles.label}>Shop the look</span><h3 id="look-title">{selected.name}</h3></div>
            <div className={styles.productList}>{selected.products.map(product => <Link href={`/products/${product.handle}`} className={styles.product} key={product.id} onClick={() => dialog.current?.close()}><span className={styles.productImage}>{product.featuredImage && <img src={`${product.featuredImage.url}${product.featuredImage.url.includes('?') ? '&' : '?'}width=240`} alt="" loading="lazy" />}</span><span><span className={styles.productName}>{product.title}</span><span className={styles.price}>From {money(product.priceRange.minVariantPrice)}</span></span><ArrowUpRight size={17} aria-hidden="true" /></Link>)}</div>
            {!selected.products.length && <p className={styles.empty}>Explore the available NOVITEC parts for this car.</p>}
            <div className={styles.lookLinks}><Link href={selected.fallback} className={styles.more} onClick={() => dialog.current?.close()}>Explore all {selected.name} parts <ArrowUpRight size={16} aria-hidden="true" /></Link>
              <a href="https://www.instagram.com/lxp.official/" target="_blank" rel="noopener noreferrer" className={styles.source}><SocialIcon type="instagram" />View on Instagram <ArrowUpRight size={14} aria-hidden="true" /></a>
            </div>
          </div>
        </div>
      </>}
    </dialog>
  </section>;
}
