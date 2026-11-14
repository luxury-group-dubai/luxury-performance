import './home-intro.css';
import type { Metadata } from 'next';
import Image from 'next/image';
import { HomeHero } from '@/components/home/home-hero';
import { PartnerMarquee } from '@/components/home/partner-marquee';
import './home-tokens.css';
import { ArrowLink, Eyebrow } from '@/components/ui';
import { PurosangueFilm } from '@/components/purosangue/film';
import { NovitecModels } from '@/components/home/novitec-models';
import { NovitecFeatureFilm } from '@/components/home/novitec-feature-film';
import { ValvetronicVehicles } from '@/components/home/valvetronic-vehicles';
import { HomeApproach } from '@/components/home/approach';
import { Reveal } from '@/components/reveal';
import { StickyIntro } from '@/components/home/sticky-intro';
import { Closing } from '@/components/closing';
import { defaultSocialImage } from '@/lib/social-images';

export const metadata: Metadata = {
  title: { absolute: 'Luxury Performance Dubai | Performance Parts & Upgrades' },
  description: 'Shop NOVITEC, TECHART and Valvetronic Designs performance parts for the UAE & GCC. Exhausts, carbon fibre, forged wheels and fitment support from Dubai.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Performance Parts in Dubai, UAE & GCC',
    description: 'Discover NOVITEC, TECHART and Valvetronic Designs with Luxury Performance. Performance parts and vehicle fitment advice from Dubai for the UAE & GCC.',
    images: [defaultSocialImage],
  },
};

export default function Home() {
  return <>
    <HomeHero />
    <div className="home-intro-stack">
      <StickyIntro>
        <PartnerMarquee />
        <section className="intro intro-dark section-pad" aria-labelledby="home-welcome-title">
          <Reveal className="intro-reveal" itemSelector=".eyebrow, #home-welcome-title, .intro-body p, .arrow-link">
            <Eyebrow dark>Luxury Performance / Dubai</Eyebrow>
            <div className="intro-grid">
              <div>
                <h2 id="home-welcome-title">Built around<br /><span className="text-muted">your car.</span></h2>
                <div className="intro-copy">
                  <div className="intro-body">
                    <p>Discover genuine performance parts and upgrades for supercars and luxury vehicles, with products from NOVITEC, TECHART, Valvetronic Designs and other specialist brands.</p>
                    <p>From carbon-fibre body kits and aerodynamics to exhaust systems, forged wheels and suspension, Luxury Performance helps you find the right parts for your car, with guidance on fitment and installation.</p>
                  </div>
                  <ArrowLink href="/about" light>Our story</ArrowLink>
                </div>
              </div>
              <Image className="intro-lettering" src="/brand/lxp-white.svg" alt="" aria-hidden="true" width={1088} height={280} />
            </div>
          </Reveal>
        </section>
      </StickyIntro>
      <div className="home-intro-cover">
        <NovitecModels />
        <PurosangueFilm />
      </div>
    </div>
    <NovitecFeatureFilm />
    <ValvetronicVehicles />
    <HomeApproach />
    <Closing />
  </>;
}
