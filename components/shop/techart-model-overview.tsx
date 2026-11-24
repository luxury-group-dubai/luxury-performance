import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { categoryOf, filterProducts } from '@/lib/shop/taxonomy';
import { productHref, shopBrandHref } from '@/lib/shop/routes';
import type { CatalogProduct } from '@/lib/shop/types';
import type { VehicleGeneration } from '@/lib/shop/techart-fitment';
import styles from './techart-model-overview.module.css';

// Calendar-year introductions, not universal model-year or fitment boundaries.
// Sources: Porsche Newsroom's 991/992 history and 2015, 2017, 2023, 2024 launch releases.
const introductions: Record<string, string> = { '991_1':'2011', '991_2':'2015', '992_1':'2018', '992_2':'2024', e3_1:'2017', e3_2:'2023' };

export function TechartGenerationLinks({ model, options }: { model:'911'|'cayenne'; options:VehicleGeneration[] }) {
  return <div className={styles.selection}>
    <p className={styles.label}>Choose your generation</p>
    <nav className={styles.generations} aria-label="Choose your generation">
      {[...options].reverse().map(generation=><Link key={generation.key} href={shopBrandHref('techart',{make:'porsche',model,generation:generation.key})}>
        <span>{generation.name}<ArrowUpRight size={15} aria-hidden="true"/></span>
        {introductions[generation.key] && <small>Introduced {introductions[generation.key]}</small>}
      </Link>)}
    </nav>
    <p className={styles.note}>Dates vary by variant and market.</p>
    <Link className={styles.assistance} href={`/contact?${new URLSearchParams({programme:'TECHART',vehicle:`Porsche ${model === '911' ? '911' : 'Cayenne'}`})}`}>Not sure which generation? Ask our team <ArrowUpRight size={13} aria-hidden="true"/></Link>
  </div>;
}

export function TechartModelRange({ model, products }: {model:'911'|'cayenne';products:CatalogProduct[]}) {
  const matching=filterProducts(products,{brand:'techart',make:'porsche',model});
  const examples=['Aerodynamics','Wheels','Exhaust'].flatMap(category=>{
    const product=matching.find(item=>categoryOf(item)===category && item.featuredImage);
    return product?[{category,product}]:[];
  });
  if(!examples.length) return null;
  return <section className={styles.range} aria-labelledby="techart-model-range-title">
    <div className={styles.heading}><h2 id="techart-model-range-title">Make it your {model==='911'?'911':'Cayenne'}.</h2><p>A few examples from the TECHART range. Choose your generation and variant above to confirm the right fit for your car.</p></div>
    <div className={styles.products}>{examples.map(({category,product})=><Link key={product.id} href={productHref(product.handle,shopBrandHref('techart',{make:'porsche',model}))}>
      <div className={styles.image}><Image src={product.featuredImage!.url} alt={product.featuredImage!.altText||product.title} fill sizes="(max-width:700px) 85vw, 29vw" loading="lazy"/></div>
      <div className={styles.caption}><span>{category==='Aerodynamics'?'Carbon & aerodynamics':category}</span><ArrowUpRight size={17} aria-hidden="true"/></div>
      <h3>{product.title.replace(/^TECHART\s*[-–]?\s*/i,'')}</h3>
    </Link>)}</div>
  </section>;
}
