import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { brandHeroImages } from '@/lib/brand-hero-images';
import { BrandHero } from './brand-hero';
import heroStyles from './brand-hero.module.css';
import { ValvetronicSoundHeadline } from './valvetronic-sound-headline';
import { TechartPersonalHeadline } from './techart-personal-headline';

const heroSlides = [
  {
    slug: 'novitec', name: 'NOVITEC', logo: '/brand/novitec.svg', logoWidth: 228, logoHeight: 45,
    ...brandHeroImages.novitec!,
    title: <>Performance<br /><span className={heroStyles.glitchPhrase}>
      <span className="sr-only">en vogue</span>
      <span className={`${heroStyles.glitchWord} ${heroStyles.glitchBase}`} data-text="en vogue" aria-hidden="true">en vogue</span>
      <span className={`${heroStyles.glitchWord} ${heroStyles.glitchAlternate}`} data-text="in style" aria-hidden="true">in style</span>
    </span></>,
    description: 'NOVITEC carbon aerodynamics, forged wheels and performance exhausts for Ferrari, Lamborghini, McLaren and Rolls-Royce.',
    href: '/partners/novitec', cta: 'Explore NOVITEC',
  },
  {
    slug: 'valvetronic', name: 'Valvetronic Designs', logo: '/brand/valvetronic-compact.avif', logoWidth: 384, logoHeight: 97,
    ...brandHeroImages.valvetronic!,
    title: <ValvetronicSoundHeadline />,
    description: 'Explore Valvetronic Designs valved exhaust systems, downpipes and components, with vehicle fitment advice from Dubai.',
    href: '/partners/valvetronic', cta: 'Explore Valvetronic',
  },
  {
    slug: 'techart', name: 'TECHART', logo: '/brand/techart.svg', logoWidth: 487, logoHeight: 35,
    ...brandHeroImages.techart!,
    title: <TechartPersonalHeadline />,
    description: 'TECHART aerodynamics, wheels, interior and performance upgrades for your Porsche, with guidance on the right parts, vehicle fitment and installation.',
    href: '/partners/techart', cta: 'Explore TECHART',
  },
];

export function HomeHero() {
  const mobileHero = heroSlides[0].mobile ? getImageProps({ ...heroSlides[0].mobile, alt: '', sizes: '100vw', quality: 75 }).props : null;
  return <>
    {mobileHero && <link rel="preload" as="image" media="(max-width: 700px)" imageSrcSet={mobileHero.srcSet} imageSizes="100vw" fetchPriority="high" />}
    <BrandHero brands={heroSlides.map(({ slug, name }) => ({ slug, name }))}>
    {heroSlides.map((slide, index) => {
      const mobile = slide.mobile ? getImageProps({ ...slide.mobile, alt: '', sizes: '100vw', quality: 75 }).props : null;
      return <article key={slide.slug} className={heroStyles.slide} data-brand={slide.slug}>
        <picture className={heroStyles.picture}>
          {mobile && <source media="(max-width: 700px)" srcSet={mobile.srcSet} sizes="100vw" />}
          <Image src={slide.image} alt={slide.alt} fill quality={75} sizes="100vw" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} />
        </picture>
        <div className={heroStyles.shade} />
        <div className={heroStyles.copy}>
          <Image className={heroStyles.logo} src={slide.logo} alt={slide.name} width={slide.logoWidth} height={slide.logoHeight} sizes={slide.slug === 'valvetronic' ? '(max-width: 700px) 160px, 210px' : '(max-width: 700px) 170px, 225px'} unoptimized={slide.logo.endsWith('.svg')} />
          <h2>{slide.title}</h2>
          <p>{slide.description}</p>
          <Link className={heroStyles.cta} href={slide.href}>{slide.cta}<ArrowUpRight size={18} strokeWidth={1.4} aria-hidden="true" /></Link>
        </div>
      </article>;
    })}
    </BrandHero>
  </>;
}


