import './home-intro.css';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ActionArrow } from '@/components/action-arrow';
import { HomeHero } from '@/components/home/home-hero';
import { PartnerMarquee } from '@/components/home/partner-marquee';
import './home-tokens.css';
import { Eyebrow } from '@/components/ui';
import { PurosangueFilm } from '@/components/purosangue/film';
import { NovitecModels } from '@/components/home/novitec-models';
import { NovitecFeatureFilm } from '@/components/home/novitec-feature-film';
import { ValvetronicVehicles } from '@/components/home/valvetronic-vehicles';
import { HomeApproach } from '@/components/home/approach';
import { Reveal } from '@/components/reveal';
import { StickyIntro } from '@/components/home/sticky-intro';
import { Closing } from '@/components/closing';
import { defaultSocialImage } from '@/lib/social-images';

const homeTitle = 'Luxury Performance | Auto Parts & Upgrades Dubai';
const homeDescription = 'Shop exhausts, body kits, wheels and suspension from leading brands, including NOVITEC. Dubai fitment support for the UAE & GCC.';

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  alternates: { canonical: '/' },
  openGraph: {
    title: homeTitle,
    siteName: 'Luxury Performance',
    description: homeDescription,
    images: [defaultSocialImage],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Luxury Performance',
  url: 'https://www.luxuryperformance.com/',
};

export default function Home() {
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replace(/</g, '\\u003c') }} />
    <HomeHero />
    <div className="home-intro-stack">
      <StickyIntro>
        <PartnerMarquee />
        <section className="intro intro-dark section-pad" aria-labelledby="home-welcome-title">
          <Reveal className="intro-reveal" itemSelector=".eyebrow, #home-welcome-title, .intro-body p, .intro-story">
            <Eyebrow dark>Luxury Performance / Dubai</Eyebrow>
            <div className="intro-grid">
              <div>
                <h2 id="home-welcome-title">Built around<br /><span className="text-muted">your car.</span></h2>
                <div className="intro-copy">
                  <div className="intro-body">
                    <p>Discover genuine auto parts and upgrades for supercars and luxury vehicles, from NOVITEC, TECHART, Valvetronic Designs and other leading brands.</p>
                    <p>From carbon-fibre body kits and aerodynamics to exhaust systems, forged wheels and suspension, Luxury Performance helps you find the right parts for your car, with guidance on fitment and installation.</p>
                  </div>
                </div>
              </div>
              <div className="intro-brand">
                <Image className="intro-lettering" src="/brand/lxp-white.svg" alt="" aria-hidden="true" width={1088} height={280} />
                <Link className="intro-story" href="/about">Our story <ActionArrow /></Link>
              </div>
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
