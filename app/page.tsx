import './home-intro.css';
import type { Metadata } from 'next';
import { HomeHero } from '@/components/home/home-hero';
import { PartnerMarquee } from '@/components/home/partner-marquee';
import './home-tokens.css';
import { Eyebrow, ArrowLink } from '@/components/ui';
import { PurosangueFilm } from '@/components/purosangue/film';
import { NovitecModels } from '@/components/home/novitec-models';
import { NovitecFeatureFilm } from '@/components/home/novitec-feature-film';
import { ValvetronicVehicles } from '@/components/home/valvetronic-vehicles';
import { HomeApproach } from '@/components/home/approach';
import { Reveal } from '@/components/reveal';
import { Closing } from '@/components/closing';

export const metadata: Metadata = {
  title: { absolute: 'Performance Parts Dubai, UAE & GCC | Luxury Performance' },
  description: 'Shop NOVITEC, TECHART and Valvetronic Designs performance parts for the UAE & GCC. Exhausts, carbon fibre, forged wheels and fitment support from Dubai.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Performance Parts in Dubai, UAE & GCC',
    description: 'Discover NOVITEC, TECHART and Valvetronic Designs with Luxury Performance. Performance parts and vehicle fitment advice from Dubai for the UAE & GCC.',
    images: [{ url: '/images/home/novitec-12cilindri-desktop.jpg', width: 3840, height: 1700, alt: 'NOVITEC Ferrari 12Cilindri Spider with Luxury Performance' }],
  },
};

export default function Home() {
  return <>
    <HomeHero />
    <PartnerMarquee />
    <section className="intro intro-dark section-pad" aria-labelledby="home-welcome-title">
      <Reveal>
        <Eyebrow dark number="01">Welcome to Luxury Performance</Eyebrow>
        <div className="intro-grid">
          <div className="intro-side"><span className="large-plus" aria-hidden="true">+</span><p>Based in Dubai.<br />Serving the UAE &amp; GCC.</p></div>
          <div>
            <h2 id="home-welcome-title">Performance.<br /><span className="text-muted">Without compromise.</span></h2>
            <div className="intro-copy">
              <div className="intro-body">
                <p>Discover genuine performance parts for supercars and luxury vehicles, from NOVITEC, TECHART, Valvetronic Designs and other specialist brands.</p>
                <p>Based in Dubai, we help drivers across the UAE and GCC select exhaust systems, carbon fibre aerodynamics, forged wheels and suspension upgrades, with guidance on fitment and installation.</p>
              </div>
              <ArrowLink href="/about" light>Our story</ArrowLink>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
    <NovitecModels />
    <PurosangueFilm />
    <NovitecFeatureFilm />
    <ValvetronicVehicles />
    <HomeApproach />
    <Closing />
  </>;
}
