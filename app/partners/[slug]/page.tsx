import { PartnerBreadcrumbs } from '@/components/partner-breadcrumbs';
import { AllocationBanner } from '@/components/nlargo/allocation-banner';
/* eslint-disable @next/next/no-img-element */
import { ActionArrow } from '@/components/action-arrow';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Image, { getImageProps } from 'next/image';
import { hasPartnerHeroOverlay, partnerHeroImages } from '@/lib/brand-hero-images';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { partners, type Partner } from '@/lib/partners';
import { getCatalog } from '@/lib/shop/storefront';
import { shopBrandHref } from '@/lib/shop/routes';
import { categoryOf, filterProducts, label, supplierOf, tagsFor, suppliers } from '@/lib/shop/taxonomy';
import { money, type CatalogProduct } from '@/lib/shop/types';
import { ArrowLink, Eyebrow } from '@/components/ui';
import { HeroNewsprintFilter } from '@/components/hero-newsprint-filter';
import newsprint from '@/components/hero-newsprint.module.css';
import { BrandArtwork } from '@/components/brand-artwork';
import { TechartStepPicker } from '@/components/shop/techart-step-picker';
import { vehicleOptions } from '@/lib/shop/techart-fitment';
import { cayenneOptions } from '@/lib/shop/techart-cayenne';
import { NovitecStories } from '@/components/novitec-stories/novitec-stories';
import { NovitecFeed } from '@/components/novitec-feed/novitec-feed';
import { novitecFeedAlbums } from '@/lib/novitec-feed-albums';
import { PartnerFaq } from '@/components/partners/partner-faq';
import { ValvetronicExhaustComparison } from '@/components/partners/valvetronic-exhaust-comparison';
import { ValvetronicIntroExhaust } from '@/components/partners/valvetronic-intro-exhaust';
import { ValvetronicSoundGallery } from '@/components/partners/valvetronic-sound-gallery';
import { ValvetronicVehicleLogos } from '@/components/partners/valvetronic-vehicle-logos';
import { CapristoChapterNav } from '@/components/partners/capristo-chapter-nav';
import { GintaniRange } from '@/components/partners/gintani-range';
import { valvetronicVehicles } from '@/lib/valvetronic-vehicles';
import { TechartPageMotion } from '@/components/partners/techart-page-motion';
import { TechartRangePicker } from '@/components/partners/techart-range-picker';
import { techartRange } from '@/lib/techart-range';
import { TechartFitmentGuide } from '@/components/partners/techart-fitment-guide';
import styles from '../partners.module.css';
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

const capristoCategoryArt: Record<string, string | undefined> = {
  Exhaust: '/images/partners/capristo-types/exhaust.webp',
  Aerodynamics: '/images/partners/capristo-types/aerodynamics.webp',
  Performance: '/images/partners/capristo-types/performance.webp',
};

function capristoChapterId(category: string) {
  return `capristo-type-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

const capristoLogos: Partial<Record<string, { logo: string; monochrome?: boolean }>> = {
  alfa_romeo: { logo: '/brand/capristo-vehicles/alfa-romeo-logo.svg' },
  alpina: { logo: '/brand/capristo-vehicles/alpina-logo.svg' },
  bentley: { logo: '/brand/capristo-vehicles/bentley-logo.svg' },
  chevrolet: { logo: '/brand/capristo-vehicles/chevrolet.svg', monochrome: true },
  jaguar: { logo: '/brand/capristo-vehicles/jaguar-logo.svg', monochrome: true },
  mercedes: { logo: '/brand/navigation/wordmarks/mercedes.svg', monochrome: true },
  rolls_royce: { logo: '/brand/navigation/wordmarks/rolls-royce.svg', monochrome: true },
};

function CapristoVehicleLogos({ vehicles }: { vehicles: string[] }) {
  return <ul className={styles.capristoVehicleLogos} aria-label="Shop Capristo by vehicle brand">
    {vehicles.map(make => {
      const artwork = capristoLogos[make] ?? valvetronicVehicles.find(vehicle => (vehicle.make ?? vehicle.mark.replaceAll('-', '_')) === make);
      const name = label(make);

      return <li key={make} data-make={make}>
        <Link href={shopBrandHref('capristo', { make })} prefetch={false} aria-label={`Shop Capristo for ${name}`}>
          {artwork ? <Image
            src={artwork.logo}
            alt=""
            width={160}
            height={56}
            sizes="(max-width: 700px) 26vw, 144px"
            className={artwork.monochrome ? styles.capristoMonochromeLogo : undefined}
          /> : <span>{name}</span>}
        </Link>
      </li>;
    })}
  </ul>;
}
const novitecWordmarks: Record<string, string> = {
  ferrari: '/brand/navigation/wordmarks/ferrari.svg',
  lamborghini: '/brand/navigation/wordmarks/lamborghini.svg',
  mclaren: '/brand/navigation/wordmarks/mclaren-dark.svg',
  rolls_royce: '/brand/navigation/wordmarks/rolls-royce.svg',
};
const feedLooks: { name: string; model: string; codes: string[]; fallback: string }[] = [
  { name: 'Ferrari Purosangue', model: 'purosangue', codes: ['F4 666 22', 'F1 666 17', 'F6 666 28', 'F6 666 52'], fallback: '/shop/novitec/ferrari/purosangue' },
  { name: 'Lamborghini Revuelto', model: 'revuelto', codes: ['L1 444 10', 'L1 444 13', 'L1 444 40', 'L1 444 80'], fallback: '/shop/novitec/lamborghini/revuelto' },
  { name: 'Ferrari SF90', model: 'sf90', codes: ['F6 090 26', 'F1 090 50', 'F6 090 35', 'F6 090 51'], fallback: '/partners/novitec/ferrari/sf90' },
  { name: 'Ferrari 12Cilindri', model: '12cilindri', codes: [], fallback: '/shop/novitec/ferrari/12cilindri' },
  { name: 'Lamborghini Urus', model: 'urus', codes: [], fallback: '/shop/novitec/lamborghini/urus' },
  { name: 'Ferrari 812', model: '812', codes: ['F4 812 70', 'F6 812 26', 'F6 812 25', 'F6 812 27'], fallback: '/partners/novitec/ferrari/812' },
  { name: 'Ferrari F8', model: 'f8', codes: [], fallback: '/shop/novitec/ferrari/f8' },
  { name: 'McLaren 750S', model: '750s', codes: ['C4 750 92', 'C5 750 10', 'C6 750 67', 'C6 750 61'], fallback: '/shop/novitec/mclaren/750s' },
  { name: 'Rolls-Royce Cullinan', model: 'cullinan', codes: [], fallback: '/shop/novitec/rolls-royce/cullinan' },
  { name: 'Rolls-Royce Spectre', model: 'spectre', codes: [], fallback: '/shop/novitec/rolls-royce/spectre' },
];
function productImageUrl(source: string, width: number) {
  const image = new URL(source);
  image.searchParams.set('width', String(width));
  image.searchParams.set('format', 'webp');
  return image.toString();
}

const novitecNlargoHero = {
  image: '/images/nlargo/hero-front-quarter-light.webp',
  mobile: { src: '/images/nlargo/hero-front-quarter-light.webp', width: 3200, height: 2133 },
  alt: 'Ferrari 12Cilindri N-LARGO by NOVITEC, front three-quarter view in studio lighting',
};

export function generateStaticParams() { return partners.map(p => ({ slug: p.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = partners.find(p => p.slug === slug);
  if (!p) return { title: 'Partner not found' };
  const heroAsset = p.slug === 'novitec' ? novitecNlargoHero : partnerHeroImages[p.slug];
  return { title: p.seo?.title || `${p.name} in Dubai`, description: p.seo?.description || p.intro + ' ' + p.detail, alternates: { canonical: `/partners/${p.slug}` }, robots: { index: process.env.SHOP_SEO_LIVE === 'true', follow: true }, openGraph: { title: p.seo?.title || `${p.name} | Luxury Performance`, description: p.seo?.description || p.intro, images: [{ url: heroAsset?.image || p.image, alt: heroAsset?.alt || p.imageAlt }] } };
}
export default async function PartnerPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const p = partners.find(partner => partner.slug === slug);
  if (!p) notFound();
  if (p.slug === 'techart') {
    const query = Object.fromEntries(Object.entries(await searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]));
    if (query.model || query.fit || query.generation) {
      if (query.model && query.model !== '911' && query.model !== 'cayenne') notFound();
      permanentRedirect(shopBrandHref('techart', { ...query, make: 'porsche', model: query.model || '911' }));
    }
  }

  const productsPromise = p.supplier && p.slug !== 'gintani'
    ? getCatalog().then(products => products.filter(item => supplierOf(item) === p.supplier))
    : Promise.resolve([]);
  const shop = p.supplier ? shopBrandHref(p.supplier) : `/contact?programme=${encodeURIComponent(p.name)}`;
  const heroAsset = p.slug === 'novitec' ? novitecNlargoHero : partnerHeroImages[p.slug];
  const mobileHero = heroAsset ? getImageProps({ ...heroAsset.mobile, alt: '', sizes: '100vw', quality: p.slug === 'novitec' ? 95 : 60 }).props : null;
  const overlaysHeader = hasPartnerHeroOverlay(p.slug);

  return <div className={styles.page} data-partner={p.slug}>
    <section className={`${styles.hero} ${overlaysHeader ? styles.fullBleedHero : ''}`} data-header-hero={overlaysHeader || undefined} data-brand={p.slug} aria-labelledby="partner-title">
      {p.slug !== 'novitec' && <HeroNewsprintFilter />}
      {p.slug === 'gintani' && <HeroNewsprintFilter id="hero-newsprint-yellow" preserveYellow />}
      <picture className={`${styles.heroPicture} ${p.slug === 'novitec' ? '' : newsprint.photo} ${p.slug === 'gintani' ? newsprint.preserveYellow : ''}`}>
        {p.slug === 'capristo' && heroAsset ? (
          <img className={styles.heroImage} src="/images/partners/capristo-hero/f40-1440.webp"
            srcSet="/images/partners/capristo-hero/f40-640-q52.webp 640w, /images/partners/capristo-hero/f40-960.webp 960w, /images/partners/capristo-hero/f40-1440.webp 1440w, /images/partners/capristo-hero/f40-1672.webp 1672w"
            sizes="(max-width: 700px) 80vw, 100vw" alt={heroAsset.alt} width={1672} height={941}
            loading="eager" fetchPriority="high" />
        ) : heroAsset ? <>
          {p.slug === 'valvetronic' && <source media="(max-width: 480px)" type="image/avif" srcSet="/images/partners/valvetronic-mobile/hero.avif"/>}
          {mobileHero && <source media="(max-width: 700px)" srcSet={mobileHero.srcSet} sizes="100vw"/>}
          <Image className={styles.heroImage} src={heroAsset.image} alt={heroAsset.alt} fill quality={p.slug === 'valvetronic' ? 75 : 95} sizes="100vw" loading="eager" fetchPriority="high"/>
        </> : <img className={styles.heroImage} src={p.image} alt={p.imageAlt} fetchPriority="high"/>}
      </picture>
      <div className={styles.heroShade}/>
      <div className={styles.heroContent}>
        <div className={styles.heroBody}><h1 id="partner-title" className={styles.brandHeading}><span className="sr-only">{p.seo?.heading || (p.slug === 'novitec' ? 'NOVITEC performance parts in Dubai' : p.name)}</span><BrandArtwork brand={p.slug} labelled={false} className={styles.heroBrand} sizes="(max-width: 700px) 250px, 480px" variant="hero" /></h1></div>
        <div className={styles.heroFoot}>
          <ArrowLink href={shop} light>{p.supplier ? `Shop ${p.stockOnly ? 'URBAN kits' : p.name}` : 'Discuss your exhaust'}</ArrowLink>
        </div>
      </div>
    </section>
    {p.slug === 'novitec' && <AllocationBanner compact view="rear" />}
    <div className={styles.partnerTrail}><PartnerBreadcrumbs partner={p} /></div>
    {p.slug === 'gintani' ? <GintaniRange /> : <Suspense fallback={<div style={{ minHeight: '100svh' }} aria-busy="true" aria-label="Loading partner collection" />}>
      <PartnerContent partner={p} productsPromise={productsPromise} />
    </Suspense>}
  </div>;
}

type PartnerDataProps = { partner: Partner; productsPromise: Promise<CatalogProduct[]> };

async function PartnerContent({ partner: p, productsPromise }: PartnerDataProps) {
  const products = await productsPromise;
  const shop = p.supplier ? shopBrandHref(p.supplier) : `/contact?programme=${encodeURIComponent(p.name)}`;
  const enquiry = `/contact?programme=${encodeURIComponent(p.name)}`;
  const vehicleType = p.slug === 'techart' ? 'model' : 'make';
  const vehicles = [...new Set(products.flatMap(item => tagsFor(item, vehicleType)))].sort();
  const categories = [...new Set(products.map(categoryOf))].sort((a, b) => {
    const order = suppliers.find(s => s.slug === p.supplier)?.categories || [];
    return (order.indexOf(a) < 0 ? 99 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 99 : order.indexOf(b));
  });
  const showCategories = p.slug !== 'valvetronic' && categories.length > 0;
  const selections = [...categories.flatMap(c => products.find(item => categoryOf(item) === c) || []), ...products];
  const featured = [...new Map(selections.map(item => [item.id, item])).values()].slice(0, 4);
  const vehicleFirst = p.slug === 'techart' && (vehicles.includes('911') || vehicles.includes('cayenne'));
  const compactNovitec = p.slug === 'novitec' && vehicles.length > 0;
  const centeredIntro = p.slug === 'valvetronic';
  const vehicleLinks = centeredIntro ? <ValvetronicVehicleLogos /> : p.slug === 'capristo' ? <CapristoVehicleLogos vehicles={vehicles} /> : <div className={styles.vehicleLinks}>{vehicles.map(vehicle => <Link key={vehicle} href={shopBrandHref(p.supplier!, { [vehicleType]: vehicle })}><span>{label(vehicle)}</span><ArrowUpRight size={19}/></Link>)}</div>;
  const vehicleHeading = compactNovitec ? <h2>Choose your marque.</h2> : <><h2>{p.vehicleHeading}</h2><p>{vehicleFirst ? 'Choose your model and generation below, then select your variant in the shop.' : 'Choose a marque to explore the parts available for your vehicle.'}</p></>;
  const vehicleSection = vehicles.length > 0 && <section id="vehicles" className={`${styles.vehicles} ${vehicleFirst ? styles.vehicleFirst : ''} ${compactNovitec ? styles.novitecVehicles : ''}`}>
    <header>{!compactNovitec && !centeredIntro && !vehicleFirst && <Eyebrow number="02">Your starting point</Eyebrow>}{vehicleHeading}</header>
    {vehicleFirst ? <TechartStepPicker headingLevel={3} options={{
      '911': vehicleOptions(filterProducts(products, { brand: 'techart', make: 'porsche', model: '911' })),
      cayenne: cayenneOptions(filterProducts(products, { brand: 'techart', make: 'porsche', model: 'cayenne' })),
    }} /> : compactNovitec ? <div className={styles.novitecWordmarks} aria-label="Explore NOVITEC by vehicle brand">{vehicles.map(vehicle => <Link key={vehicle} href={novitecWordmarks[vehicle] ? `/partners/novitec/${vehicle.replace(/_/g, '-')}` : shopBrandHref(p.supplier!, { [vehicleType]: vehicle })} aria-label={`Explore NOVITEC for ${label(vehicle)}`} data-make={vehicle}>{novitecWordmarks[vehicle] ? <Image src={novitecWordmarks[vehicle]} alt="" width={240} height={70} /> : <span>{label(vehicle)}</span>}</Link>)}</div> : vehicleLinks}
  </section>;

  const collectionSection = showCategories && p.slug !== 'capristo' && <section id="departments" className={styles.departments}><div className={styles.sectionHeading}><div>{p.slug !== 'novitec' && <Eyebrow>The collection</Eyebrow>}<h2>{p.slug === 'novitec' ? 'The collection' : 'Details that define it.'}</h2></div><ArrowLink href={shop}>View all parts</ArrowLink></div><div className={styles.categoryGrid}>{categories.map((category, i) => { const items = products.filter(item => categoryOf(item) === category); const image = items.find(item => item.featuredImage)?.featuredImage; return <Link key={category} className={styles.categoryCard} href={shopBrandHref(p.supplier!, { category })}><div className={styles.categoryImage}>{image && <img src={`${image.url}${image.url.includes('?') ? '&' : '?'}width=700`} alt={image.altText || `${p.name} ${category}`} loading="lazy"/>}<span>{String(i + 1).padStart(2, '0')}</span></div><div><h3>{category}</h3><ArrowUpRight size={20}/></div><p>{items.length} {items.length === 1 ? 'part' : 'parts'}{p.stockOnly ? ' · limited stock' : ''}</p></Link>; })}</div></section>;

  const introduction = p.slug === 'novitec' || p.slug === 'techart' ? <section id="discover" className={styles.brandIntroduction} aria-labelledby={`${p.slug}-intro-title`}>
    <h2 id={`${p.slug}-intro-title`}>{p.name}.<br />In Dubai.</h2>
    <div>
      <p>{p.slug === 'novitec'
        ? 'Carbon fibre body kits, exhaust systems, forged wheels and suspension for Ferrari, Lamborghini, McLaren and Rolls-Royce. Our Dubai team helps you choose compatible NOVITEC parts and discuss installation options.'
        : 'Body kits, carbon fibre parts, wheels, exhausts, suspension and interior upgrades for your Porsche 911 or Cayenne. Our Dubai team helps you choose compatible TECHART parts and discuss installation options.'}</p>
      <ArrowLink href={shop}>Shop {p.name} parts</ArrowLink>
    </div>
  </section> : p.slug === 'capristo' ? <section id="discover" className={styles.capristoIntroduction} aria-labelledby="capristo-intro-title">
    <div className={styles.capristoIntroImage}><Image src="/images/partners/capristo-revuelto-instagram.jpg" alt="Capristo Lamborghini Revuelto exhaust system" fill sizes="(max-width: 700px) 100vw, 50vw" quality={90} /></div>
    <div className={styles.capristoIntroCopy}><h2 id="capristo-intro-title">Sound, shaped<br />by hand.</h2><p>Explore CAPRISTO exhaust systems and carbon fibre parts in Dubai. Choose your vehicle below, then check the generation, version and fitting requirements for your chosen components. Our team can help confirm availability and installation options.</p><ArrowLink href={shop}>Explore Capristo parts</ArrowLink></div>
  </section> : !compactNovitec && p.slug !== 'techart' && <section id="discover" className={`${styles.introduction} ${centeredIntro ? styles.centeredIntroduction : ''}`}>
    {!centeredIntro && p.slug !== 'techart' && <Eyebrow number={vehicleFirst ? "02" : "01"}>{p.stockOnly ? 'From our stock' : `The ${p.name} approach`}</Eyebrow>}
    <div><h2>{p.intro}</h2><p>{p.detail}</p>{p.stockOnly && <span className={styles.conditionNote}>Limited stock · 2 kits</span>}{p.supplier && !products.length && <p>No parts are currently listed online. <Link href={enquiry}>Ask our team about current availability.</Link></p>}</div>
    {centeredIntro && vehicles.length > 0 && <ValvetronicIntroExhaust />}
  </section>;

  const capristoBrowsing = p.slug === 'capristo' && showCategories && (
    <div className={styles.capristoBrowsing} data-partner-browsing>
      {vehicleSection}
      <section id="departments" className={styles.capristoCategories} aria-labelledby="capristo-categories-title">
        <div className={styles.capristoCategorySidebar}>
          <div className={styles.capristoCategoryBackdrop}>
            <Image src="/images/partners/capristo-craft-editorial.jpg" alt="" fill sizes="100vw" loading="eager" />
          </div>
          <div className={styles.capristoCategoryNav}>
            <h2 id="capristo-categories-title">Shop by product type</h2>
            <CapristoChapterNav chapters={categories.map(title => ({ title, id: capristoChapterId(title) }))} />
          </div>
        </div>
        <div className={styles.capristoCategoryStory}>
        {categories.map(category => {
          const items = products.filter(item => categoryOf(item) === category);
          const artwork = capristoCategoryArt[category];
          const fallback = items.find(item => item.featuredImage)?.featuredImage;

          return <article key={category} id={capristoChapterId(category)} className={styles.capristoCategory}>
            <h3>{category}</h3>
            <div className={styles.capristoCategoryArt}>
              {artwork ? <Image src={artwork} alt="" fill sizes="(max-width: 700px) 90vw, 50vw" loading={category === categories[0] ? 'eager' : 'lazy'} /> : fallback && (
                <img src={fallback.url} alt="" loading="lazy" />
              )}
            </div>
            <div className={styles.capristoCategoryCopy}>
              <ArrowLink href={shopBrandHref(p.supplier!, { category })}>Shop {category.toLowerCase()}</ArrowLink>
              <p>{items.length} {items.length === 1 ? 'part' : 'parts'}</p>
            </div>
          </article>;
        })}
          <ArrowLink href={shop}>View all parts</ArrowLink>
        </div>
      </section>
    </div>
  );

  return <>
    {p.slug === 'techart' && <TechartPageMotion />}
    {introduction}
    {vehicleFirst && vehicleSection}
    {!vehicleFirst && !capristoBrowsing && vehicleSection}
    {p.slug === 'techart' && <TechartFitmentGuide />}
    {p.slug === 'techart' ? <TechartRangePicker options={techartRange.map(option => ({
      ...option,
      count: filterProducts(products, option.filters).length,
      href: shopBrandHref('techart', option.filters),
    })).filter(option => option.count > 0)} /> : capristoBrowsing || (p.slug !== 'novitec' && collectionSection)}
    {p.slug === 'novitec' && <NovitecFeed looks={feedLooks.map(({ codes, model, ...look }) => {
      const album = novitecFeedAlbums[model];
      const lookProducts = codes.length ? codes.flatMap(code => {
        const product = products.find(item => item.title.toUpperCase().replace(/\s+/g, ' ').includes(code));
        return product ? [product] : [];
      }) : products.filter(item => tagsFor(item, 'model').includes(model)).slice(0, 4);
      return { ...look, image: album.images[0], gallery: album.images.slice(1), imageRatios: album.ratios, products: lookProducts };
    })} />}
    {p.slug === 'novitec' && <NovitecStories />}
    {p.slug === 'valvetronic' && <ValvetronicExhaustComparison />}
    {p.slug === 'capristo' && <section className={styles.capristoFind} aria-labelledby="capristo-find-title">
      <div><h2 id="capristo-find-title">Find the right part.</h2><p>Choose your vehicle above, then narrow the collection by model and category. Already know what you need? Search by model or part number.</p><form action="/shop" className={styles.capristoFindSearch}><input type="hidden" name="brand" value="capristo"/><label htmlFor="capristo-find-query" className="sr-only">Search Capristo by model or part number</label><input id="capristo-find-query" name="q" type="search" placeholder="Model or part number"/><button className="action-secondary" type="submit">Search <ActionArrow size={17} /></button></form></div>
      <div className={styles.capristoFindHelp}><h3>Need help with fitment?</h3><p>Tell us your car’s model and year. Our team can help confirm the right parts and installation options.</p><ArrowLink href={enquiry}>Talk to our team</ArrowLink></div>
    </section>}
    {p.slug !== 'novitec' && p.slug !== 'capristo' && featured.length > 0 && <section id="selected" className={styles.selected}>
      <div className={styles.sectionHeading}>
        <div>{p.slug !== 'techart' && <Eyebrow>A closer look</Eyebrow>}<h2>Explore the range.</h2></div>
        <ArrowLink href={shop}>{p.slug === 'valvetronic' ? 'View all exhausts' : 'Shop the collection'}</ArrowLink>
      </div>
      <div className={styles.productGrid}>{featured.map(item => {
        const image = item.featuredImage;
        return <Link className="shop-product-card" key={item.id} href={`/products/${item.handle}`}>
          <div className="shop-product-image">
            {image && <Image
              src={productImageUrl(image.url, 960)}
              fill
              style={{ padding: '5%' }}
              sizes="(max-width: 1000px) 42vw, 22vw"
              quality={60}
              alt={image.altText || item.title}
            />}
            <span className="shop-product-arrow"><ArrowUpRight size={18}/></span>
            {item.tags.includes('condition_used') && <span className="shop-used">Used</span>}
          </div>
          <div className="shop-card-meta"><span>{p.name}</span><span>{categoryOf(item)}</span></div>
          <h3>{item.title.replace(/^(TECHART|Valvetronic Designs)\s*[-–]\s*/i, '')}</h3>
          <p className="shop-price">From {money(item.priceRange.minVariantPrice)}</p>
        </Link>;
      })}</div>
    </section>}
    {p.slug === 'valvetronic' && <ValvetronicSoundGallery />}
    {(p.slug === 'novitec' || p.slug === 'valvetronic' || p.slug === 'techart' || p.slug === 'capristo' || p.slug === 'fi-exhaust') && <PartnerFaq brand={p.slug} enquiry={enquiry} />}
    {p.slug !== 'capristo' && <section className={styles.support}><div><Eyebrow dark>Luxury Performance / Dubai</Eyebrow><h2>Your car.<br/>Your next chapter.</h2></div><div><p>{p.stockOnly ? 'Need a closer look at one of the kits? Ask us about its condition, included parts and fitment.' : 'From the first component to a complete specification, our team can help with compatibility, product choices and installation.'}</p><ArrowLink href={enquiry} light>Discuss your {p.slug === 'fi-exhaust' ? 'exhaust' : 'specification'}</ArrowLink></div></section>}
  </>;
}
