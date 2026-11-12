/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Image, { getImageProps } from 'next/image';
import { partnerHeroImages } from '@/lib/brand-hero-images';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { partners, type Partner } from '@/lib/partners';
import { getCatalog } from '@/lib/shop/storefront';
import { categoryOf, filterProducts, filterUrl, label, supplierOf, tagsFor, suppliers } from '@/lib/shop/taxonomy';
import { money, type CatalogProduct } from '@/lib/shop/types';
import { ArrowLink, Eyebrow } from '@/components/ui';
import { BrandArtwork } from '@/components/brand-artwork';
import { CayenneSelector, VehicleSelector } from '@/components/shop/vehicle-selector';
import { is911Fit } from '@/lib/shop/techart-fitment';
import { NovitecStories } from '@/components/novitec-stories/novitec-stories';
import { NovitecFeed } from '@/components/novitec-feed/novitec-feed';
import { novitecFeedAlbums } from '@/lib/novitec-feed-albums';
import { PartnerFaq } from '@/components/partners/partner-faq';
import { ValvetronicExhaustComparison } from '@/components/partners/valvetronic-exhaust-comparison';
import { ValvetronicIntroExhaust } from '@/components/partners/valvetronic-intro-exhaust';
import { ValvetronicSoundGallery } from '@/components/partners/valvetronic-sound-gallery';
import { ValvetronicVehicleLogos } from '@/components/partners/valvetronic-vehicle-logos';
import { TechartPageMotion } from '@/components/partners/techart-page-motion';
import { TechartRangePicker } from '@/components/partners/techart-range-picker';
import { techartRange } from '@/lib/techart-range';
import styles from '../partners.module.css';
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const novitecWordmarks: Record<string, string> = {
  ferrari: '/brand/navigation/wordmarks/ferrari.svg',
  lamborghini: '/brand/navigation/wordmarks/lamborghini.svg',
  mclaren: '/brand/navigation/wordmarks/mclaren-dark.svg',
  rolls_royce: '/brand/navigation/wordmarks/rolls-royce.svg',
};
const feedLooks: { name: string; model: string; codes: string[]; fallback: string }[] = [
  { name: 'Ferrari Purosangue', model: 'purosangue', codes: ['F4 666 22', 'F1 666 17', 'F6 666 28', 'F6 666 52'], fallback: '/shop?brand=novitec&make=ferrari&model=purosangue' },
  { name: 'Lamborghini Revuelto', model: 'revuelto', codes: ['L1 444 10', 'L1 444 13', 'L1 444 40', 'L1 444 80'], fallback: '/shop?brand=novitec&make=lamborghini&model=revuelto' },
  { name: 'Ferrari SF90', model: 'sf90', codes: ['F6 090 26', 'F1 090 50', 'F6 090 35', 'F6 090 51'], fallback: '/partners/novitec/ferrari/sf90' },
  { name: 'Ferrari 12Cilindri', model: '12cilindri', codes: [], fallback: '/collections/ferrari-12cilindri?brand=novitec' },
  { name: 'Lamborghini Urus', model: 'urus', codes: [], fallback: '/shop?brand=novitec&make=lamborghini&model=urus' },
  { name: 'Ferrari 812', model: '812', codes: ['F4 812 70', 'F6 812 26', 'F6 812 25', 'F6 812 27'], fallback: '/partners/novitec/ferrari/812' },
  { name: 'Ferrari F8', model: 'f8', codes: [], fallback: '/collections/ferrari-f8?brand=novitec' },
  { name: 'McLaren 750S', model: '750s', codes: ['C4 750 92', 'C5 750 10', 'C6 750 67', 'C6 750 61'], fallback: '/shop?brand=novitec&make=mclaren&model=750s' },
  { name: 'Rolls-Royce Cullinan', model: 'cullinan', codes: [], fallback: '/collections/rolls-royce-cullinan?brand=novitec' },
  { name: 'Rolls-Royce Spectre', model: 'spectre', codes: [], fallback: '/collections/rolls-royce-spectre?brand=novitec' },
];
function productImageUrl(source: string, width: number) {
  const image = new URL(source);
  image.searchParams.set('width', String(width));
  image.searchParams.set('format', 'webp');
  return image.toString();
}

export function generateStaticParams() { return partners.map(p => ({ slug: p.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = partners.find(p => p.slug === slug);
  if (!p) return { title: 'Partner not found' };
  const heroAsset = partnerHeroImages[p.slug];
  return { title: `${p.name} in Dubai`, description: p.intro + ' ' + p.detail, alternates: { canonical: `/partners/${p.slug}` }, robots: { index: process.env.SHOP_SEO_LIVE === 'true', follow: true }, openGraph: { title: `${p.name} | Luxury Performance`, description: p.intro, images: [{ url: heroAsset?.image || p.image, alt: heroAsset?.alt || p.imageAlt }] } };
}
export default async function PartnerPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const p = partners.find(partner => partner.slug === slug);
  if (!p) notFound();

  const productsPromise = p.supplier
    ? getCatalog().then(products => products.filter(item => supplierOf(item) === p.supplier))
    : Promise.resolve([]);
  const shop = p.supplier ? filterUrl('/shop', { brand: p.supplier }) : `/contact?programme=${encodeURIComponent(p.name)}`;
  const heroAsset = partnerHeroImages[p.slug];
  const mobileHero = heroAsset ? getImageProps({ ...heroAsset.mobile, alt: '', sizes: '100vw', quality: 60 }).props : null;

  return <div className={styles.page} data-partner={p.slug}>
    <section className={`${styles.hero} ${heroAsset ? styles.fullBleedHero : ''}`} data-header-hero={heroAsset ? true : undefined} data-brand={p.slug} aria-labelledby="partner-title">
      {heroAsset ? <picture className={styles.heroPicture}>
        {p.slug === 'valvetronic' && <source media="(max-width: 480px)" type="image/avif" srcSet="/images/partners/valvetronic-mobile/hero.avif"/>}
        {mobileHero && <source media="(max-width: 700px)" srcSet={mobileHero.srcSet} sizes="100vw"/>}
        <Image className={styles.heroImage} src={heroAsset.image} alt={heroAsset.alt} fill quality={p.slug === 'valvetronic' ? 75 : 95} sizes="100vw" loading="eager" fetchPriority="high"/>
      </picture> : <img className={styles.heroImage} src={p.image} alt={p.imageAlt} fetchPriority="high"/>}
      <div className={styles.heroShade}/>
      <div className={styles.heroContent}>
        <div className={styles.heroBody}><h1 id="partner-title" className={styles.brandHeading}><span className="sr-only">{p.name}</span><BrandArtwork brand={p.slug} labelled={false} className={styles.heroBrand} sizes="(max-width: 700px) 250px, 480px" /></h1></div>
        <div className={styles.heroFoot}><Suspense fallback={<ArrowLink href={shop} light>{p.supplier ? `Shop ${p.stockOnly ? 'URBAN kits' : p.name}` : 'Discuss your exhaust'}</ArrowLink>}>
          <PartnerHeroAction partner={p} productsPromise={productsPromise} />
        </Suspense></div>
      </div>
    </section>
    <Suspense fallback={<div style={{ minHeight: '100svh' }} aria-busy="true" aria-label="Loading partner collection" />}>
      <PartnerContent partner={p} productsPromise={productsPromise} searchParams={searchParams} />
    </Suspense>
  </div>;
}

type PartnerDataProps = { partner: Partner; productsPromise: Promise<CatalogProduct[]> };

async function PartnerHeroAction({ partner: p, productsPromise }: PartnerDataProps) {
  const products = await productsPromise;
  const vehicles = [...new Set(products.flatMap(item => tagsFor(item, p.slug === 'techart' ? 'model' : 'make')))];
  const vehicleFirst = p.slug === 'techart' && (vehicles.includes('911') || vehicles.includes('cayenne'));
  const compactNovitec = p.slug === 'novitec' && vehicles.length > 0;
  const shop = filterUrl('/shop', { brand: p.supplier });
  const enquiry = `/contact?programme=${encodeURIComponent(p.name)}`;
  return <ArrowLink href={vehicleFirst || compactNovitec ? "#vehicles" : products.length ? shop : enquiry} light>{vehicleFirst ? 'Choose your Porsche' : compactNovitec ? 'Choose your vehicle' : products.length ? `Shop ${p.stockOnly ? 'URBAN kits' : p.name}` : p.slug === 'fi-exhaust' ? 'Discuss your exhaust' : 'Ask about availability'}</ArrowLink>;
}

async function PartnerContent({ partner: p, productsPromise, searchParams }: PartnerDataProps & Pick<Props, 'searchParams'>) {
  const [products, query] = await Promise.all([productsPromise, searchParams]);
  const shop = filterUrl('/shop', { brand: p.supplier });
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
  const techartModel = vehicles.includes('cayenne') && (query.model === 'cayenne' || !vehicles.includes('911')) ? 'cayenne' : '911';
  const compactNovitec = p.slug === 'novitec' && vehicles.length > 0;
  const centeredIntro = p.slug === 'valvetronic';
  const initialFit = typeof query.fit === 'string' && is911Fit(query.fit) ? query.fit : undefined;
  const initialBody = typeof query.body === 'string' ? query.body : undefined;
  const vehicleLinks = centeredIntro ? <ValvetronicVehicleLogos /> : <div className={styles.vehicleLinks}>{vehicles.map(vehicle => <Link key={vehicle} href={filterUrl('/shop', { brand: p.supplier, [vehicleType]: vehicle })}><span>{label(vehicle)}</span><ArrowUpRight size={19}/></Link>)}</div>;
  const vehicleHeading = <><h2>{p.vehicleHeading}</h2><p>{compactNovitec ? 'NOVITEC aerodynamics, exhausts, wheels and suspension, with fitment and installation support in Dubai.' : vehicleFirst ? 'Choose your model and generation to explore TECHART parts for your Porsche.' : 'Choose a marque to explore the parts available for your vehicle.'}</p></>;
  const techartModels = <nav className={styles.modelChoices} aria-label="Porsche models">
    {vehicles.map(vehicle => {
      if (vehicle === techartModel) return <span key={vehicle} aria-current="true">{label(vehicle)}</span>;
      if (vehicle === '911' || vehicle === 'cayenne') {
        return <Link key={vehicle} href={vehicle === '911' ? '/partners/techart#vehicles' : '/partners/techart?model=cayenne#vehicles'}>{label(vehicle)}</Link>;
      }
      return <Link key={vehicle} href={filterUrl('/shop', { brand: p.supplier, make: 'porsche', model: vehicle })}>{label(vehicle)} <ArrowUpRight size={14} /></Link>;
    })}
  </nav>;
  const vehicleSection = vehicles.length > 0 && <section id="vehicles" className={`${styles.vehicles} ${vehicleFirst ? styles.vehicleFirst : ''} ${compactNovitec ? styles.novitecVehicles : ''}`}>
    <header id={compactNovitec ? 'discover' : undefined}>{!compactNovitec && !centeredIntro && !vehicleFirst && <Eyebrow number="02">Your starting point</Eyebrow>}{vehicleHeading}</header>
    {vehicleFirst ? <>
      {techartModel === 'cayenne'
        ? <CayenneSelector products={products} fit={typeof query.fit === 'string' ? query.fit : undefined} body={initialBody} modelChoices={techartModels} />
        : <VehicleSelector products={products.filter(product => tagsFor(product, 'model').includes('911'))} fit={initialFit} body={initialBody} modelChoices={techartModels} />}
    </> : compactNovitec ? <div className={styles.novitecWordmarks} aria-label="Explore NOVITEC by vehicle brand">{vehicles.map(vehicle => <Link key={vehicle} href={novitecWordmarks[vehicle] ? `/partners/novitec/${vehicle.replace(/_/g, '-')}` : filterUrl('/shop', { brand: p.supplier, [vehicleType]: vehicle })} aria-label={`Explore NOVITEC for ${label(vehicle)}`} data-make={vehicle}>{novitecWordmarks[vehicle] ? <Image src={novitecWordmarks[vehicle]} alt="" width={240} height={70} /> : <span>{label(vehicle)}</span>}</Link>)}</div> : vehicleLinks}
  </section>;

  const collectionSection = showCategories && <section id="departments" className={styles.departments}><div className={styles.sectionHeading}><div>{p.slug !== 'novitec' && <Eyebrow>The collection</Eyebrow>}<h2>{p.slug === 'novitec' ? 'The collection' : 'Details that define it.'}</h2></div><ArrowLink href={shop}>View all parts</ArrowLink></div><div className={styles.categoryGrid}>{categories.map((category, i) => { const items = products.filter(item => categoryOf(item) === category); const image = items.find(item => item.featuredImage)?.featuredImage; return <Link key={category} className={styles.categoryCard} href={filterUrl('/shop', { brand: p.supplier, category })}><div className={styles.categoryImage}>{image && <img src={`${image.url}${image.url.includes('?') ? '&' : '?'}width=700`} alt={image.altText || `${p.name} ${category}`} loading="lazy"/>}<span>{String(i + 1).padStart(2, '0')}</span></div><div><h3>{category}</h3><ArrowUpRight size={20}/></div><p>{items.length} {items.length === 1 ? 'part' : 'parts'}{p.stockOnly ? ' · limited stock' : ''}</p></Link>; })}</div></section>;

  const introduction = p.slug === 'capristo' ? <section id="discover" className={styles.capristoIntroduction} aria-labelledby="capristo-intro-title">
    <div className={styles.capristoIntroImage}><Image src="/images/partners/capristo-f40-exhaust.jpg" alt="Polished Capristo exhaust tips and valves for the Ferrari F40" fill sizes="(max-width: 700px) 100vw, 50vw" quality={90} /></div>
    <div className={styles.capristoIntroCopy}><h2 id="capristo-intro-title">Sound, shaped<br />by hand.</h2><p>Born from a passion for Ferrari, Capristo creates exhaust systems with a sound and finish all their own. Designed, hand-welded and polished in Sundern, Germany—made to bring out the character of your car.</p><ArrowLink href={shop} light>Explore Capristo parts</ArrowLink></div>
  </section> : !compactNovitec && p.slug !== 'techart' && <section id="discover" className={`${styles.introduction} ${centeredIntro ? styles.centeredIntroduction : ''}`}>
    {!centeredIntro && p.slug !== 'techart' && <Eyebrow number={vehicleFirst ? "02" : "01"}>{p.stockOnly ? 'From our stock' : `The ${p.name} approach`}</Eyebrow>}
    <div><h2>{p.intro}</h2><p>{p.detail}</p>{p.stockOnly && <span className={styles.conditionNote}>Limited stock · 2 kits</span>}{p.supplier && !products.length && <p>No parts are currently listed online. <Link href={enquiry}>Ask our team about current availability.</Link></p>}</div>
    {centeredIntro && vehicles.length > 0 && <ValvetronicIntroExhaust />}
  </section>;

  return <>
    {p.slug === 'techart' && <TechartPageMotion />}
    {vehicleFirst && vehicleSection}
    {introduction}
    {!vehicleFirst && vehicleSection}
    {p.slug === 'techart' ? <TechartRangePicker options={techartRange.map(option => ({
      ...option,
      count: filterProducts(products, option.filters).length,
      href: filterUrl('/shop', { brand: 'techart', ...option.filters }),
    })).filter(option => option.count > 0)} /> : p.slug !== 'novitec' && collectionSection}
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
    {p.slug !== 'novitec' && featured.length > 0 && <section id="selected" className={styles.selected}>
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
    {(p.slug === 'novitec' || p.slug === 'valvetronic' || p.slug === 'techart') && <PartnerFaq brand={p.slug} enquiry={enquiry} />}
    <section className={styles.support}><div><Eyebrow dark>Luxury Performance / Dubai</Eyebrow><h2>Your car.<br/>Your next chapter.</h2></div><div><p>{p.stockOnly ? 'Need a closer look at one of the kits? Ask us about its condition, included parts and fitment.' : 'From the first component to a complete specification, our team can help with compatibility, product choices and installation.'}</p><ArrowLink href={enquiry} light>Discuss your {p.slug === 'fi-exhaust' ? 'exhaust' : 'specification'}</ArrowLink></div></section>
  </>;
}
