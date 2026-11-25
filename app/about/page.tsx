import './interior.css';
import './about.css';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLink } from '@/components/ui';
import { Closing } from '@/components/closing';
import { Reveal } from '@/components/reveal';
import { contact } from '@/lib/content';
import { defaultSocialImage } from '@/lib/social-images';
import { DivisionsTimeline } from './divisions-timeline';
import { PageHeading } from '@/components/page-heading';
const title = 'About Luxury Performance | Our Story';
const description = 'Meet Luxury Performance in Al Quoz, Dubai. Explore the people and approach behind our exhausts, body kits, carbon fibre parts, wheels and suspension upgrades.';
export const metadata: Metadata = {
  title: { absolute: title }, description, alternates: { canonical: '/about' },
  openGraph: { title, description, url: '/about', type: 'website', images: [defaultSocialImage] },
  twitter: { card: 'summary_large_image', title, description, images: [defaultSocialImage.url] },
};
export default function About() {
  return <><div className="about-story"><PageHeading title="About." description="Auto parts and upgrades, supplied from Dubai. Built around your car, with guidance on fitment, availability and installation options." /><div className="interior-hero"><Image src="/images/headquarters.webp" fill priority sizes="100vw" alt="The Luxury Group headquarters in Al Quoz, Dubai" /><span className="image-bottom-label">One home. A world of automotive possibility.</span></div>
  <section className="about-manifesto section-pad"><Image src="/brand/lxp-winged-black.svg" width={1868} height={728} sizes="185px" alt="Luxury Performance wing emblem" className="about-emblem" /><Reveal><h2>Built around cars.<br /><span className="text-muted">Driven by people.</span></h2><p><Link className="about-home-link" href="/">Luxury Performance</Link> is the automotive performance division of The Luxury Group Dubai. From our base in Al Quoz, we help owners, collectors and specialist workshops choose parts and upgrades for their vehicles.</p><p>Our <Link className="about-home-link" href="/shop">shop</Link> brings together exhaust systems, body kits, carbon fibre parts, wheels and suspension. Explore <Link className="about-home-link" href="/partners">our partner brands</Link>, including NOVITEC, TECHART, Valvetronic Designs, CAPRISTO, FI Exhaust and Gintani. Available components and configurations depend on your exact vehicle.</p><p>Whether you’re choosing one component or planning a wider build, we help check compatibility, supplied components and finishes, explain stock status and lead times, and discuss installation options. The starting point is your car and what you want to change.</p><ArrowLink href="/contact">Talk to our team</ArrowLink></Reveal></section>
  <DivisionsTimeline /></div>
  <section className="about-location section-pad" id="dubai"><div className="about-location-image"><Image src="/images/sf90.webp" alt="Ferrari SF90 at a specialist Dubai workshop" fill sizes="(max-width: 700px) 90vw, 45vw" /></div><Reveal><h2>Local knowledge.<br /><span className="text-muted">A wider perspective.</span></h2><p>Our home in Al Quoz puts us at the heart of Dubai’s automotive community. As part of The Luxury Group, we share a world of supercars, specialist care and people who understand what makes them special.</p><div className="location-details">4th Street, Al Quoz Industrial 3<br />Dubai, United Arab Emirates<br /><span className="text-muted">Monday–Saturday · 10am–8pm</span></div><ArrowLink href={contact.maps} external>Find us in Dubai</ArrowLink></Reveal></section><Closing showEyebrow={false} title={'Same passion.\nNew possibilities.'} /></>;
}
