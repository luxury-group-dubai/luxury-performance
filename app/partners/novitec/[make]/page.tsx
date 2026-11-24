import { PartnerBreadcrumbs } from '@/components/partner-breadcrumbs';
import { AllocationBanner } from '@/components/nlargo/allocation-banner';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { getCatalog } from '@/lib/shop/storefront';
import { label, supplierOf, tagsFor } from '@/lib/shop/taxonomy';
import styles from './models.module.css';
import { shopBrandHref } from '@/lib/shop/routes';
import { novitecMarqueContent } from '@/lib/novitec-marques';
import { newsArticles } from '@/lib/news';

const makes: Record<string, { tag: string; name: string }> = {
  ferrari: { tag: 'ferrari', name: 'Ferrari' },
  lamborghini: { tag: 'lamborghini', name: 'Lamborghini' },
  mclaren: { tag: 'mclaren', name: 'McLaren' },
  'rolls-royce': { tag: 'rolls_royce', name: 'Rolls-Royce' },
};

const covers: Record<string, string> = {
  purosangue: 'official-covers/purosangue.jpg',
  revuelto: 'official-covers/revuelto.jpg',
  urus: 'official-covers/urus.jpg',
  urus_performante: 'official-covers/urus-performante.jpg',
  urus_s: 'official-covers/urus-s.jpg',
  sf90: 'official-covers/sf90.jpg',
  '12cilindri': '12cilindri-nlargo-side.jpg',
  f8: 'official-covers/f8.jpg',
  '812': 'official-covers/812-superfast.jpg',
  '812_superfast': 'official-covers/812-superfast.jpg',
  '812_gts': 'official-covers/812-gts.jpg',
  '750s': 'official-covers/750s.jpg',
  senna: 'official-covers/senna.jpg',
  cullinan: 'official-covers/cullinan.jpg',
  cullinan_series_ii: 'official-covers/cullinan-series-ii.jpg',
  spectre: 'official-covers/spectre.jpg',
};

function modelLabel(model: string) {
  if (model === '750s') return '750S';
  if (model === 'cullinan_series_ii') return 'Cullinan Series II';
  return label(model);
}

type Props = { params: Promise<{ make: string }> };
export function generateStaticParams() { return Object.keys(makes).map(make => ({ make })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { make } = await params;
  const brand = makes[make];
  if (!brand) return {};
  const copy = novitecMarqueContent[make];
  const title = copy?.title || `NOVITEC for ${brand.name}`;
  const description = copy?.description || `Explore NOVITEC parts for your ${brand.name}. Choose your model to find the available upgrades.`;
  return { title, description, ...(copy ? { openGraph: { title, description, url: `/partners/novitec/${make}` } } : {}), alternates: { canonical: `/partners/novitec/${make}` }, robots: { index: process.env.SHOP_SEO_LIVE === 'true', follow: true } };
}

export default async function NovitecModelsForMake({ params }: Props) {
  const { make } = await params;
  const brand = makes[make];
  if (!brand) notFound();
  const copy = novitecMarqueContent[make];
  const relatedNews = newsArticles.filter(article => article.brand === 'NOVITEC' && article.marque === brand.name).slice(0, 2);
  const products = (await getCatalog()).filter(product => supplierOf(product) === 'novitec' && tagsFor(product, 'make').includes(brand.tag));
  const models = [...new Set(products.flatMap(product => tagsFor(product, 'model')).map(model => make === 'ferrari' && ['812_gts', '812_superfast'].includes(model) ? '812' : model))].sort((a, b) => modelLabel(a).localeCompare(modelLabel(b), 'en', { numeric: true }));
  return <div className={styles.page}>
    <div className={styles.inner}>
      <PartnerBreadcrumbs partner={{ slug: 'novitec', name: 'NOVITEC' }} marque={brand.name} />
      <header className={`${styles.heading} ${copy ? styles.localHeading : ''}`}>
        <div><h1>{copy?.heading || `Choose your ${brand.name}.`}</h1><p>{copy?.introduction || 'Select your model to explore the NOVITEC parts available for your car.'}</p></div>
        <Link href={shopBrandHref('novitec', { make: brand.tag })} className={styles.all}>Shop all {brand.name} parts <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </header>
    </div>
    {make === 'ferrari' && <AllocationBanner compact />}
    <div className={styles.inner}>
      {copy && <h2 className={styles.modelHeading}>Choose your {brand.name} model.</h2>}
      {models.length ? <ul className={styles.grid} aria-label={`${brand.name} models`}>
        {models.map(model => <li key={model}><Link className={styles.card} href={make === 'ferrari' && ['f8', '812', 'sf90', '12cilindri'].includes(model) ? `/partners/novitec/ferrari/${model}` : shopBrandHref('novitec', { make: brand.tag, model })}>
          <span className={styles.picture}>{covers[model] ? <Image src={`/images/novitec-models/${covers[model]}`} alt="" fill sizes="(max-width: 700px) 45vw, (max-width: 1100px) 45vw, 30vw" quality={90} className={styles.image} /> : <Image src="/brand/novitec.svg" alt="" width={160} height={32} className={styles.placeholder} />}</span>
          <span className={styles.cardLabel}><span><small>{brand.name}</small><strong>{modelLabel(model)}</strong></span><ArrowUpRight size={20} aria-hidden="true" /></span>
        </Link></li>)}
      </ul> : <p className={styles.empty}>No models are listed online yet. <Link href={shopBrandHref('novitec', { make: brand.tag })}>Explore available {brand.name} parts</Link> or <Link href="/contact">ask our team</Link>.</p>}
      {copy && <section className={styles.range} aria-labelledby="range-title">
        <h2 id="range-title">{copy.rangeHeading}</h2>
        <div><p>{copy.range}</p><h3>Confirm the right fit.</h3><p>{copy.fitment}</p><h3>Plan your upgrades in Dubai.</h3><p>{copy.advice}</p>
          <div className={styles.relatedLinks}>{make === 'ferrari' && <Link href="/shop/novitec/ferrari/purosangue">Shop NOVITEC Ferrari Purosangue parts</Link>}<Link href={shopBrandHref('novitec', { make: brand.tag })}>Shop NOVITEC {brand.name} parts</Link><Link href={`/contact?${new URLSearchParams({ programme: `NOVITEC ${brand.name}` })}`}>Discuss your {brand.name} specification</Link><Link href="/partners/novitec">Explore the full NOVITEC range</Link></div>
        </div>
      </section>}
      {copy && relatedNews.length > 0 && <section className={styles.news} aria-labelledby="marque-news-title"><h2 id="marque-news-title">NOVITEC {brand.name} news.</h2><div>{relatedNews.map(article => <article key={article.slug}><h3><Link href={`/news/${article.slug}`}>{article.title}</Link></h3><p>{article.summary}</p></article>)}</div></section>}
    </div>
  </div>;
}
