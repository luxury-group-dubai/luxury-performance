import { ActionLabel } from '@/components/action-label';
import { ActionArrow } from '@/components/action-arrow';
import Image, { getImageProps } from 'next/image';
import Link from 'next/link';
import { brandHeroImages } from '@/lib/brand-hero-images';
import { HeroNewsprintFilter } from '@/components/hero-newsprint-filter';
import newsprint from '@/components/hero-newsprint.module.css';
import { BrandHero } from './brand-hero';
import heroStyles from './brand-hero.module.css';
import { ValvetronicSoundHeadline } from './valvetronic-sound-headline';
import { TechartPersonalHeadline } from './techart-personal-headline';
import { nlargoAvailable, nlargoCta, nlargoPath } from '@/lib/nlargo-allocation';

const mobileHero = {
  src: '/images/home/novitec-hero-mobile-v1-750.webp',
  srcSet: [480, 640, 750, 828, 1080, 1200, 1440, 1600, 1920, 2048, 2560]
    .map(width => `/images/home/novitec-hero-mobile-v1-${width}.webp ${width}w`).join(', '),
};

const heroSlides = [
  {
    slug: 'nlargo', name: 'N-LARGO', logo: '/brand/novitec.svg', logoWidth: 228, logoHeight: 45,
    image: '/images/nlargo/hero-front-quarter-red.webp',
    mobile: { src: '/images/nlargo/hero-front-quarter-red.webp', width: 3200, height: 2133 },
    alt: 'Red Ferrari 12Cilindri N-LARGO by NOVITEC, front three-quarter view',
    title: <>Ferrari 12Cilindri<br />N-LARGO</>,
    description: nlargoAvailable
      ? 'One exclusive allocation available. The first reveal vehicle is secured for Dubai, with one additional NOVITEC conversion allocation for a private client.'
      : 'Fully allocated. Discover the NOVITEC 12Cilindri N-LARGO project and discuss future opportunities with our team in Dubai.',
    href: nlargoPath, cta: nlargoCta,
  },
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
    image: brandHeroImages.valvetronic!.mobile.src,
    alt: 'Rear wing and exposed Valvetronic exhaust on a Porsche GT3 RS',
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
  return <>
    <HeroNewsprintFilter />
    <HeroNewsprintFilter id="hero-newsprint-yellow" preserveYellow />
    <BrandHero brands={heroSlides.map(({ slug, name, image }) => ({ slug, name, image }))}>
    {heroSlides.map((slide, index) => {
      const mobile = slide.slug === 'nlargo' ? null : slide.slug === 'novitec' ? mobileHero : slide.mobile ? getImageProps({ ...slide.mobile, alt: '', sizes: '100vw', quality: 75 }).props : null;
      return <article key={slide.slug} className={heroStyles.slide} data-brand={slide.slug}>
        <div className={heroStyles.imageFrame}>
        {(slide.slug === 'nlargo' ? [false] : [false, true]).map(printed => (
          <picture key={String(printed)} className={printed ? `${heroStyles.picture} ${heroStyles.printLayer} ${newsprint.photo} ${slide.slug === 'techart' ? newsprint.preserveYellow : ''}` : heroStyles.picture} aria-hidden={printed || undefined}>
            {mobile && <source media="(max-width: 700px)" type={slide.slug === 'novitec' ? 'image/webp' : undefined} srcSet={mobile.srcSet} sizes="100vw" />}
            <Image src={slide.image} alt={printed ? '' : slide.alt} {...(slide.slug === 'nlargo' ? { width: 3200, height: 2133 } : { fill: true })} style={slide.slug === 'nlargo' ? {
              position: 'absolute', inset: 0, width: '135%', maxWidth: 'none', height: '100%',
              objectFit: 'cover', objectPosition: '55% 62%',
            } : undefined} quality={slide.slug === 'nlargo' ? 95 : 75} sizes={slide.slug === 'nlargo' ? '(max-width: 700px) 147vw, 84vw' : '100vw'} loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={!printed && index === 0 ? 'high' : 'auto'} />
          </picture>
        ))}
        </div>
        <div className={heroStyles.shade} />
        <div className={heroStyles.copy}>
          <Image className={heroStyles.logo} src={slide.logo} alt={slide.name} width={slide.logoWidth} height={slide.logoHeight} sizes={slide.slug === 'valvetronic' ? '(max-width: 700px) 160px, 210px' : '(max-width: 700px) 170px, 225px'} unoptimized={slide.logo.endsWith('.svg')} />
          <h2>{slide.title}</h2>
          <p>{slide.description}</p>
          <Link className={heroStyles.cta} href={slide.href}><ActionLabel>{slide.cta}</ActionLabel><ActionArrow size={18} strokeWidth={1.4} /></Link>
        </div>
      </article>;
    })}
    </BrandHero>
  </>;
}


