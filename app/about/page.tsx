import './interior.css';
import './about.css';
import type { Metadata } from 'next';
import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { ArrowLink } from '@/components/ui';
import { NewsCard } from '@/components/news-card';
import { Reveal } from '@/components/reveal';
import { contact } from '@/lib/content';
import { newsArticles } from '@/lib/news';
import { defaultSocialImage } from '@/lib/social-images';
import { DivisionsTimeline } from './divisions-timeline';
import showroomPhoto from '@/public/images/headquarters-forecourt.webp';
import showroomPortrait from '@/public/images/headquarters-forecourt-portrait.webp';
const title = 'About Luxury Performance | Our Story';
const description = 'Meet Luxury Performance in Al Quoz, Dubai. Explore the people and approach behind our exhausts, body kits, carbon fibre parts, wheels and suspension upgrades.';
export const metadata: Metadata = {
  title: { absolute: title }, description, alternates: { canonical: '/about' },
  openGraph: { title, description, url: '/about', type: 'website', images: [defaultSocialImage] },
  twitter: { card: 'summary_large_image', title, description, images: [defaultSocialImage.url] },
};
export default function About() {
  const { props: portrait } = getImageProps({
    src: showroomPortrait,
    sizes: 'max(100vw, 81.25svh)', quality: 75, alt: '',
  });
  return <><div className="about-story">
  <div className="about-opening">
  <div className="interior-hero">
    <picture>
      <source media="(max-width: 900px) and (max-aspect-ratio: 4/5)" srcSet={portrait.srcSet} sizes={portrait.sizes} />
      <Image src={showroomPhoto} alt="Supercars lined up outside The Luxury Group showroom in Al Quoz, Dubai"
        fill quality={75} loading="eager" fetchPriority="high" sizes="max(100vw, 150svh)" />
    </picture>
    <h1 className="about-hero-title">
      <span>Luxury</span>{' '}
      <span>Performance</span>
    </h1>
  </div>
  <section className="about-manifesto section-pad" data-header-hero="end"><Image src="/brand/lxp-winged-black.svg" width={1868} height={728} sizes="185px" alt="Luxury Performance wing emblem" className="about-emblem" /><Reveal><h2>Built around cars.<br /><span className="text-muted">Driven by people.</span></h2><p><Link className="about-home-link" href="/">Luxury Performance</Link> is the automotive performance division of The Luxury Group Dubai. From our base in Al Quoz, we help owners, collectors and specialist workshops choose parts and upgrades for their vehicles.</p><p>Our <Link className="about-home-link" href="/shop">shop</Link> brings together exhaust systems, body kits, carbon fibre parts, wheels and suspension. Explore <Link className="about-home-link" href="/partners">our partner brands</Link>, including NOVITEC, TECHART, Valvetronic Designs, CAPRISTO, FI Exhaust and Gintani. Available components and configurations depend on your exact vehicle.</p><p>Whether you’re choosing one component or planning a wider build, we help check compatibility, supplied components and finishes, explain stock status and lead times, and discuss installation options. The starting point is your car and what you want to change.</p><ArrowLink href="/contact">Talk to our team</ArrowLink></Reveal></section>
  </div>
  <DivisionsTimeline /></div>
  <section className="about-why" id="why-lxp" aria-labelledby="about-why-title">
    <div className="about-why-copy">
      <h2 id="about-why-title">Why LXP?</h2>
      <p>What sets us apart is not just the products we sell but how we support our clients before, during, and after the purchase.</p>
      <ul>
        <li>Authorized access to leading performance brands</li>
        <li>Expert product knowledge and fitment support</li>
        <li>Transparent pricing and professional service</li>
        <li>Worldwide shipping with export experience</li>
        <li>Installation support through trusted partners in the UAE</li>
      </ul>
      <p>We do not believe in guesswork, shortcuts, or compromises. Only precision and results.</p>
      <ArrowLink href="/contact" light>Discuss your build</ArrowLink>
      <div className="about-visit" id="dubai">
        <a href={contact.maps} target="_blank" rel="noopener noreferrer">{contact.address}</a>
        <span>Monday–Saturday · 10am–8pm</span>
      </div>
    </div>
    <div className="about-why-image">
      <Image src="/images/sf90.webp" alt="Rear diffuser and exhaust of a grey Ferrari SF90" fill
        sizes="(max-width: 700px) calc(100vw - 48px), 45vw" />
    </div>
  </section>
  <section className="about-news" id="news" aria-labelledby="about-news-title">
    <div className="about-news-heading">
      <h2 id="about-news-title">News.</h2>
      <ArrowLink href="/news">All news</ArrowLink>
    </div>
    <div className="about-news-grid">
      {newsArticles.slice(0, 2).map(article => <NewsCard key={article.slug} article={article} />)}
    </div>
  </section>
  </>;
}
