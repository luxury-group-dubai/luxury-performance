/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Image, { getImageProps } from 'next/image';
import { brandHeroImages } from '@/lib/brand-hero-images';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { partners } from '@/lib/partners';
import { getCatalog } from '@/lib/shop/storefront';
import { categoryOf, filterUrl, label, supplierOf, tagsFor, suppliers } from '@/lib/shop/taxonomy';
import { money } from '@/lib/shop/types';
import { ArrowLink, Eyebrow } from '@/components/ui';
import { BrandArtwork } from '@/components/brand-artwork';
import { VehicleSelector } from '@/components/shop/vehicle-selector';
import { is911Fit } from '@/lib/shop/techart-fitment';
import { NovitecStories } from '@/components/novitec-stories/novitec-stories';
import { NovitecFeed } from '@/components/novitec-feed/novitec-feed';
import { novitecFeedAlbums } from '@/lib/novitec-feed-albums';
import styles from '../partners.module.css';
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
const novitecWordmarks: Record<string, string> = {
  ferrari: '/brand/navigation/wordmarks/ferrari.svg',
  lamborghini: '/brand/navigation/wordmarks/lamborghini.svg',
  mclaren: '/brand/navigation/wordmarks/mclaren-dark.svg',
  rolls_royce: '/brand/navigation/wordmarks/rolls-royce.svg',
};
const novitecHero = {
  image: '/images/novitec-models/novitec-partner-hero-wide.jpg',
  mobile: { src: '/images/novitec-models/novitec-partner-hero-mobile.jpg', width: 687, height: 1024 },
  alt: 'NOVITEC Ferrari Purosangue in a dark studio',
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
export function generateStaticParams() { return partners.map(p => ({ slug: p.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = partners.find(p => p.slug === slug);
  if (!p) return { title: 'Partner not found' };
  const heroAsset = p.slug === 'novitec' ? novitecHero : brandHeroImages[p.slug];
  return { title: `${p.name} in Dubai`, description: p.intro + ' ' + p.detail, alternates: { canonical: `/partners/${p.slug}` }, robots: { index: process.env.SHOP_SEO_LIVE === 'true', follow: true }, openGraph: { title: `${p.name} | Luxury Performance`, description: p.intro, images: [{ url: heroAsset?.image || p.image, alt: heroAsset?.alt || p.imageAlt }] } };
}
export default async function PartnerPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const p = partners.find(p => p.slug === slug);
  if (!p) notFound();
  const products = p.supplier ? (await getCatalog()).filter(item => supplierOf(item) === p.supplier) : [];
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
  const heroAsset = p.slug === 'novitec' ? novitecHero : brandHeroImages[p.slug];
  const mobileHero = heroAsset ? getImageProps({ ...heroAsset.mobile, alt: '', sizes: '100vw', quality: 95 }).props : null;
  const vehicleFirst = p.slug === 'techart' && vehicles.includes('911');
  const compactNovitec = p.slug === 'novitec' && vehicles.length > 0;
  const initialFit = typeof query.fit === 'string' && is911Fit(query.fit) ? query.fit : undefined;
  const vehicleSection = vehicles.length > 0 && <section id="vehicles" className={`${styles.vehicles} ${vehicleFirst ? styles.vehicleFirst : ''} ${compactNovitec ? styles.novitecVehicles : ''}`}>
    <header id={compactNovitec ? 'discover' : undefined}>{!compactNovitec && <Eyebrow number={vehicleFirst ? '01' : '02'}>Your starting point</Eyebrow>}<h2>{p.vehicleHeading}</h2><p>{compactNovitec ? 'NOVITEC aerodynamics, exhausts, wheels and suspension, with fitment and installation support in Dubai.' : vehicleFirst ? 'Choose your generation, body style and trim. Then explore the TECHART parts for your Porsche.' : 'Choose a marque to explore the parts available for your vehicle.'}</p></header>
    {vehicleFirst ? <>
      <nav className={styles.modelChoices} aria-label="Porsche models"><span aria-current="true">911</span>{vehicles.filter(vehicle => vehicle !== '911').map(vehicle => <Link key={vehicle} href={filterUrl('/shop', { brand: p.supplier, make: 'porsche', model: vehicle })}>{label(vehicle)} <ArrowUpRight size={14} /></Link>)}</nav>
      <VehicleSelector products={products.filter(product => tagsFor(product, 'model').includes('911'))} fit={initialFit} />
    </> : compactNovitec ? <div className={styles.novitecWordmarks} aria-label="Explore NOVITEC by vehicle brand">{vehicles.map(vehicle => <Link key={vehicle} href={novitecWordmarks[vehicle] ? `/partners/novitec/${vehicle.replace(/_/g, '-')}` : filterUrl('/shop', { brand: p.supplier, [vehicleType]: vehicle })} aria-label={`Explore NOVITEC for ${label(vehicle)}`} data-make={vehicle}>{novitecWordmarks[vehicle] ? <Image src={novitecWordmarks[vehicle]} alt="" width={240} height={70} /> : <span>{label(vehicle)}</span>}</Link>)}</div> : <div className={styles.vehicleLinks}>{vehicles.map(vehicle => <Link key={vehicle} href={filterUrl('/shop', { brand: p.supplier, [vehicleType]: vehicle })}><span>{label(vehicle)}</span><ArrowUpRight size={19}/></Link>)}</div>}
  </section>;

  const collectionSection = showCategories && <section id="departments" className={styles.departments}><div className={styles.sectionHeading}><div>{p.slug !== 'novitec' && <Eyebrow>The collection</Eyebrow>}<h2>{p.slug === 'novitec' ? 'The collection' : 'Details that define it.'}</h2></div><ArrowLink href={shop}>View all parts</ArrowLink></div><div className={styles.categoryGrid}>{categories.map((category, i) => { const items = products.filter(item => categoryOf(item) === category); const image = items.find(item => item.featuredImage)?.featuredImage; return <Link key={category} className={styles.categoryCard} href={filterUrl('/shop', { brand: p.supplier, category })}><div className={styles.categoryImage}>{image && <img src={`${image.url}${image.url.includes('?') ? '&' : '?'}width=700`} alt={image.altText || `${p.name} ${category}`} loading="lazy"/>}<span>{String(i + 1).padStart(2, '0')}</span></div><div><h3>{category}</h3><ArrowUpRight size={20}/></div><p>{items.length} {items.length === 1 ? 'part' : 'parts'}{p.stockOnly ? ' · limited stock' : ''}</p></Link>; })}</div></section>;

  return <div className={styles.page} data-partner={p.slug}>
    <section className={`${styles.hero} ${heroAsset ? styles.fullBleedHero : ''}`} data-header-hero={heroAsset ? true : undefined} data-brand={p.slug} aria-labelledby="partner-title">
      {heroAsset ? <picture className={styles.heroPicture}>
        {mobileHero && <source media="(max-width: 700px)" srcSet={mobileHero.srcSet} sizes="100vw"/>}
        <Image className={styles.heroImage} src={heroAsset.image} alt={heroAsset.alt} fill quality={95} sizes="100vw" loading="eager" fetchPriority="high"/>
      </picture> : <img className={styles.heroImage} src={p.image} alt={p.imageAlt} fetchPriority="high"/>}
      <div className={styles.heroShade}/>
      <div className={styles.heroContent}>
        <div className={styles.heroBody}><h1 id="partner-title" className={styles.brandHeading}><span className="sr-only">{p.name}</span><BrandArtwork brand={p.slug} labelled={false} className={styles.heroBrand} /></h1></div>
        <div className={styles.heroFoot}><ArrowLink href={vehicleFirst || compactNovitec ? "#vehicles" : products.length ? shop : enquiry} light>{vehicleFirst ? 'Choose your Porsche' : compactNovitec ? 'Choose your vehicle' : products.length ? `Shop ${p.stockOnly ? 'URBAN kits' : p.name}` : p.slug === 'fi-exhaust' ? 'Discuss your exhaust' : 'Ask about availability'}</ArrowLink></div>
      </div>
    </section>
    {vehicleFirst && vehicleSection}
    {!compactNovitec && <section id="discover" className={styles.introduction}><Eyebrow number={vehicleFirst ? "02" : "01"}>{p.stockOnly ? 'From our stock' : `The ${p.name} approach`}</Eyebrow><div><h2>{p.intro}</h2><p>{p.detail}</p>{p.stockOnly && <span className={styles.conditionNote}>Limited stock · 2 kits</span>}{p.supplier && !products.length && <p>No parts are currently listed online. <Link href={enquiry}>Ask our team about current availability.</Link></p>}</div></section>}
    {!vehicleFirst && vehicleSection}
    {p.slug !== 'novitec' && collectionSection}
    {p.slug === 'novitec' && <NovitecFeed looks={feedLooks.map(({ codes, model, ...look }) => {
      const album = novitecFeedAlbums[model];
      const lookProducts = codes.length ? codes.flatMap(code => {
        const product = products.find(item => item.title.toUpperCase().replace(/\s+/g, ' ').includes(code));
        return product ? [product] : [];
      }) : products.filter(item => tagsFor(item, 'model').includes(model)).slice(0, 4);
      return { ...look, image: album.images[0], gallery: album.images.slice(1), products: lookProducts };
    })} />}
    {p.slug === 'novitec' && <NovitecStories />}
    {p.slug === 'novitec' && collectionSection}
    {p.slug !== 'novitec' && featured.length > 0 && <section id="selected" className={styles.selected}><div className={styles.sectionHeading}><div><Eyebrow>A closer look</Eyebrow><h2>Explore the range.</h2></div><ArrowLink href={shop}>{p.slug === 'valvetronic' ? 'View all exhausts' : 'Shop the collection'}</ArrowLink></div><div className={styles.productGrid}>{featured.map(item => <Link className="shop-product-card" key={item.id} href={`/products/${item.handle}`}><div className="shop-product-image">{item.featuredImage && <img src={`${item.featuredImage.url}${item.featuredImage.url.includes('?') ? '&' : '?'}width=700`} alt={item.featuredImage.altText || item.title} loading="lazy"/>}<span className="shop-product-arrow"><ArrowUpRight size={18}/></span>{item.tags.includes('condition_used') && <span className="shop-used">Used</span>}</div><div className="shop-card-meta"><span>{p.name}</span><span>{categoryOf(item)}</span></div><h3>{item.title.replace(/^(TECHART|Valvetronic Designs)\s*[-–]\s*/i, '')}</h3><p className="shop-price">From {money(item.priceRange.minVariantPrice)}</p></Link>)}</div></section>}
    <section className={styles.support}><div><Eyebrow dark>Luxury Performance / Dubai</Eyebrow><h2>Your car.<br/>Your next chapter.</h2></div><div><p>{p.stockOnly ? 'Need a closer look at one of the kits? Ask us about its condition, included parts and fitment.' : 'From the first component to a complete specification, our team can help with compatibility, product choices and installation.'}</p><ArrowLink href={enquiry} light>Discuss your {p.slug === 'fi-exhaust' ? 'exhaust' : 'specification'}</ArrowLink></div></section>
    <nav className={styles.otherPartners} aria-label="Explore other partners"><span className="tiny-label">Another perspective</span>{partners.filter(item => item.slug !== p.slug && !item.stockOnly).map(item => <Link key={item.slug} href={`/partners/${item.slug}#top`}>{item.name}<ArrowUpRight size={15}/></Link>)}</nav>
  </div>;
}
