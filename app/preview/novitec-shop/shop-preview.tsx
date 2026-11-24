'use client';
import { useShopParams as useSearchParams } from '@/components/shop/use-shop-params';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ArrowDownWideNarrow, Search, X, RotateCcw } from 'lucide-react';
import type { CatalogProduct } from '@/lib/shop/types';
import { money } from '@/lib/shop/types';
import { categoryOf, filterProducts, type Filters } from '@/lib/shop/taxonomy';
import { novitecMakes, novitecModelCover, novitecModelKeys, novitecModelName, novitecProductsForMake, novitecShopProfile } from '@/lib/shop/novitec-models';
import { novitecVariantFamilies } from '@/lib/shop/novitec-variants';
import { compareProgrammeCategories, prepareNovitecShop } from '@/lib/shop/novitec-programme';
import { novitecModelShopCopy } from '@/lib/shop/novitec-model-seo';
import { nlargoPath } from '@/lib/nlargo-allocation';
import { CatalogChoice } from '@/components/shop/catalog-choice';
import { MenuLogo } from '@/components/shop-menu-cards';
import { SelectorCarImage } from '@/components/shop/selector-car-image';
import carPlaceholders from '@/lib/generated/novitec-selector-placeholders.json';
const placeholders: Record<string, string> = carPlaceholders;
import { vehicleMenu } from '@/lib/shop-navigation';
import { shopBrandHref, productHref } from '@/lib/shop/routes';
import styles from './preview.module.css';
import selectorStyles from '../brand-shop/shop-preview.module.css';


type Car = { make: string; marque: string; model: string; body?: string; name: string; image?: string; cover?: string; count: number };
const scope = (car: Car): Filters => ({ brand: 'novitec', make: car.make, model: car.model, body: car.body });
const matchesText = (text: string, query: string) => query.toLowerCase().trim().split(/\s+/).every(word => text.toLowerCase().includes(word));

export function NovitecShopPreview({ products }: { products: CatalogProduct[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const makes = useMemo(() => Object.values(novitecMakes).filter(make => novitecProductsForMake(products, make.tag).length), [products]);
  const cars = useMemo(() => makes.flatMap(make => {
    const inventory = novitecProductsForMake(products, make.tag);
    return novitecModelKeys(inventory, make.tag).flatMap(model => {
      const variants = novitecVariantFamilies[make.tag]?.[model];
      return (variants?.length ? variants.map(variant => ({ body: variant.key, name: variant.name })) : [{ body: undefined, name: novitecModelName(model) }])
        .map(version => ({ make: make.tag, marque: make.name, model, ...version, image: novitecShopProfile(model, version.body)?.src, cover: novitecModelCover(version.body ? `${model}_${version.body}` : model), count: filterProducts(inventory, { brand: 'novitec', make: make.tag, model, body: version.body }).length }))
        .filter(car => car.count > 0);
    });
  }), [products, makes]);
  const make = makes.find(item => item.tag === params.get('make'));
  const model = make && cars.some(car => car.make === make.tag && car.model === params.get('model')) ? params.get('model')! : undefined;
  const variants = cars.filter(car => car.make === make?.tag && car.model === model);
  const selected = variants.find(car => car.body === (params.get('body') || undefined));
  const choosing = params.get('choose') === '1';
  const active = selected && !choosing ? selected : undefined;
  const category = params.get('category') || undefined;
  const sort = params.get('sort') || undefined;
  const filters: Filters = active ? { ...scope(active), category, sort } : { brand: 'novitec' };
  const modelCopy = active ? novitecModelShopCopy(scope(active)) : undefined;
  const prepared = active ? prepareNovitecShop(filterProducts(products, scope(active)), scope(active)) : [];
  const categories = [...new Set(prepared.map(categoryOf))].sort(compareProgrammeCategories);
  const shown = filterProducts(prepared, filters);
  const go = (values: Filters & { choose?: string }) => {
    const url = shopBrandHref('novitec', values);
    setSearchOpen(false);
    setSearch('');
    const changingCar = ['make', 'model', 'body', 'choose'].some(key => (params.get(key) || undefined) !== values[key as keyof typeof values]);
    router.push(url, { scroll: changingCar });
  };
  const chooseCar = (car: Car, selectedCategory?: string) => go({ ...scope(car), category: selectedCategory });
  const allCollections = useMemo(() => cars.flatMap(car => {
    const carProducts = prepareNovitecShop(filterProducts(products, scope(car)), scope(car));
    return [...new Set(carProducts.map(categoryOf))].map(name => ({ car, name }));
  }), [cars, products]);
  const vehicleResults = search.trim() ? cars.filter(car => matchesText(`${car.marque} ${car.name}`, search)).slice(0, 5) : [];
  const collectionResults = search.trim() ? allCollections.filter(collection => matchesText(`${collection.car.marque} ${collection.car.name} ${collection.name}`, search)).slice(0, 6) : [];
  const partResults = search.trim() ? products.filter(product => matchesText(product.title, search)).slice(0, 4) : [];
  const models = [...new Set(cars.filter(car => car.make === make?.tag).map(car => car.model))];
  const heading = active ? `${active.marque} ${active.name}` : !make ? 'Start with your car.' : !model ? `Choose your ${make.name}.` : `Choose your ${novitecModelName(model)}.`;

  return <div className={`${styles.page}${!make ? ` ${styles.manufacturerPage}` : ''}`}>
    <header className={`${styles.hero}${active ? ` ${styles.heroWithToolbar}` : ''}`}>
      <div className={styles.topline}><Image src="/brand/novitec.svg" alt="NOVITEC" width={185} height={43} className={styles.wordmark} />
      <div className={styles.searchWrap} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false); }}>
        <div className={styles.searchField}><Search size={18} /><input aria-label="Search NOVITEC cars, collections and parts" placeholder="Search a car, collection or part…" value={search} onFocus={() => setSearchOpen(true)} onChange={event => { setSearch(event.target.value); setSearchOpen(true); }} onKeyDown={event => { if (event.key === 'Escape') setSearchOpen(false); }} aria-controls="novitec-preview-search" />{search && <button aria-label="Clear search" onClick={() => setSearch('')}><X size={17} /></button>}</div>
        {searchOpen && !!search.trim() && <div id="novitec-preview-search" className={styles.suggestions}>
          {!!vehicleResults.length && <section><h2>Cars</h2>{vehicleResults.map(car => <button key={`${car.make}-${car.model}-${car.body}`} onClick={() => chooseCar(car)}><span>{car.marque} {car.name}<small>{car.count} parts</small></span><ArrowUpRight size={15} /></button>)}</section>}
          {!!collectionResults.length && <section><h2>Collections</h2>{collectionResults.map(({ car, name }) => <button key={`${car.make}-${car.model}-${car.body}-${name}`} onClick={() => chooseCar(car, name)}><span>{car.name} — {name}<small>{car.marque} · NOVITEC collection</small></span><ArrowUpRight size={15} /></button>)}</section>}
          {!!partResults.length && <section><h2>Parts</h2>{partResults.map(product => <Link key={product.id} href={productHref(product.handle, shopBrandHref('novitec', filters))}><span>{product.title}</span><ArrowUpRight size={15} /></Link>)}</section>}
          {!vehicleResults.length && !collectionResults.length && !partResults.length && <p>No matches. Try a model such as “12Cilindri” or “F8 exhaust”.</p>}
        </div>}
      </div>
      </div>
      <nav className={styles.breadcrumbs} aria-label="Vehicle selection">
        <Link href="/shop">SHOP</Link><span aria-hidden="true">/</span>
        <button onClick={() => go({})}>NOVITEC</button>
        {make && <><span aria-hidden="true">/</span><button onClick={() => go({ make: make.tag })}>{make.name}</button></>}
        {model && <><span aria-hidden="true">/</span><button onClick={() => go({ make: make!.tag, model, choose: '1' })}>{novitecModelName(model)}</button></>}
        {active?.body && <><span aria-hidden="true">/</span><span aria-current="page">{active.name}</span></>}
      </nav>
      <div className={styles.heroContent}><div><h1>{active ? <><span className={styles.vehicleMarque}>{active.marque}</span><span>{active.name}</span></> : heading}</h1>{modelCopy ? <p>{modelCopy.introduction}</p> : !active && <p>Find the parts and possibilities for your exact model.</p>}
      </div>{active && <div className={styles.selectedCar}>
        {active.image && <div className={styles.selectedArtwork} data-tall={active.model === 'urus' || active.model === 'cullinan' || active.model === 'purosangue' ? 'true' : undefined}>{active.cover && <Image className={`${styles.selectedImage} ${styles.selectedShadow}`} src={active.cover} alt="" aria-hidden="true" width={1116} height={598} sizes="(max-width: 700px) 85vw, 40vw" />}<Image className={styles.selectedImage} src={active.image} alt={active.name} width={1116} height={598} sizes="(max-width: 700px) 85vw, 40vw" /></div>}
        <button className={styles.change} onClick={() => go({ ...scope(active), choose: '1' })}><RotateCcw size={15} /> Change car</button>
      </div>}</div>

      {active && <div className={styles.toolbar}>
        <nav className={styles.categories} aria-label="Product categories"><button aria-pressed={!category} onClick={() => go({ ...filters, category: undefined })}>All parts</button>{categories.map(name => <button key={name} aria-pressed={category === name} onClick={() => go({ ...filters, category: name })}>{name}</button>)}</nav>
        <div className={styles.sortControl}><CatalogChoice variant="sort" label="Sort parts" value={sort || ''}
          options={[["", "Default"], ["price-up", "Price: low to high"], ["price-down", "Price: high to low"], ["name", "Name: A–Z"]]}
          onChange={value => go({ ...filters, sort: value || undefined })}>
          <ArrowDownWideNarrow size={18} aria-hidden="true" /><span>Sort</span>
        </CatalogChoice></div>
      </div>}
    </header>
    {!active ? <section className={`${styles.picker}${!make ? ` ${selectorStyles.manufacturerPicker}` : ''}`} aria-label="Choose your car">
      <div className={styles.pickerTitle}><span>{!make ? 'Select a manufacturer' : !model ? 'Select a model' : 'Select a version'}</span>{choosing && selected && <button onClick={() => chooseCar(selected)}>Return to {selected.name}</button>}</div>
      <div className={!make ? `${selectorStyles.makeGrid} ${styles.manufacturerGrid}` : styles.carGrid}>
        {!make ? makes.map(item => {
          const logo = vehicleMenu.find(vehicle => vehicle.href.endsWith(`make=${item.tag}`));
          return <button className={selectorStyles.makeCard} key={item.tag} aria-label={`Choose ${item.name}`} onClick={() => go({ make: item.tag })}>
            {logo ? <MenuLogo reveal item={logo} /> : <span>{item.name}</span>}<ArrowUpRight size={17} aria-hidden="true" />
          </button>;
        }) : !model ? models.map(key => {
          const versions = cars.filter(car => car.make === make.tag && car.model === key);
          const first = versions[0];
          return <button className={styles.carCard} key={key} onClick={() => versions.length === 1 ? chooseCar(first) : go({ make: make.tag, model: key })}>
            <div className={styles.carPicture}>{first.cover && <SelectorCarImage src={key === '12cilindri' ? '/images/novitec-models/12cilindri-nlargo-side.jpg' : first.cover} placeholder={placeholders[key === '12cilindri' ? '/images/novitec-models/12cilindri-nlargo-side.jpg' : first.cover]} width={1116} height={598} sizes="(max-width:700px) 90vw, 40vw" />}</div><div className={styles.carLabel}><div><small>{make.name}</small><h2>{novitecModelName(key)}</h2><p>{versions.length > 1 ? `${versions.length + (key === '12cilindri' ? 1 : 0)} versions` : `${first.count} parts`}</p></div><ArrowUpRight size={21} /></div>
          </button>;
        }) : <>{variants.map(car => <button className={styles.carCard} key={car.name} onClick={() => chooseCar(car)}><div className={styles.carPicture}>{car.cover && <SelectorCarImage src={car.cover} placeholder={placeholders[car.cover]} width={1116} height={598} sizes="(max-width:700px) 90vw, 40vw" />}</div><div className={styles.carLabel}><div><small>{car.marque}</small><h2>{car.name}</h2><p>{car.count} parts</p></div><ArrowUpRight size={21} /></div></button>)}
          {make.tag === 'ferrari' && model === '12cilindri' && <Link className={`${styles.carCard} ${styles.project}`} href={nlargoPath}><span className={styles.newTag}>NEW</span><div className={styles.carPicture}><SelectorCarImage src="/images/novitec-models/12cilindri-nlargo-side.jpg" placeholder={placeholders['/images/novitec-models/12cilindri-nlargo-side.jpg']} width={1116} height={598} sizes="(max-width:700px) 90vw, 40vw" /></div><div className={styles.carLabel}><div><small>Exclusive project</small><h2>12Cilindri N-LARGO</h2><p>Explore the conversion allocation</p></div><ArrowUpRight size={21} /></div></Link>}
        </>}
      </div>
    </section> : <section className={styles.catalogue} aria-label="Products for your car">

      {categories.filter(name => !category || name === category).map(name => {
        const items = shown.filter(product => categoryOf(product) === name);
        return <section className={styles.productSection} key={name}><h2>{name} <sup>{items.length}</sup></h2><div className={styles.productGrid}>{items.map(product => <Link key={product.id} className={`shop-product-card ${styles.productCard}`} href={productHref(product.handle, shopBrandHref('novitec', filters))}><div className="shop-product-image">{product.featuredImage && <Image src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} width={600} height={600} sizes="(max-width:700px) 44vw, (max-width:1100px) 29vw, 22vw" />}<span className="shop-product-arrow"><ArrowUpRight size={18} aria-hidden="true" /></span></div><h3>{product.title}</h3><p className="shop-price">From {money(product.priceRange.minVariantPrice)}</p></Link>)}</div></section>;
      })}
      {!shown.length && <p>No parts in this collection. <button onClick={() => go(scope(active))}>View all parts for your car</button></p>}
      {modelCopy && !category && !sort && <section className={styles.modelGuide} aria-labelledby="novitec-model-guide-title">
        <h2 id="novitec-model-guide-title">{modelCopy.heading}</h2>
        <div><p>{modelCopy.range}</p><h3>Standard body or ESTESO?</h3><p>{modelCopy.fitment}</p><h3>Ordering NOVITEC Purosangue parts in Dubai.</h3><p>{modelCopy.ordering}</p>
          <nav aria-label="More about NOVITEC Ferrari parts"><Link href="/partners/novitec/ferrari">Explore NOVITEC for Ferrari</Link><Link href="/partners/novitec">About the NOVITEC range</Link><Link href="/contact?programme=NOVITEC+Ferrari+Purosangue">Discuss your Purosangue specification</Link></nav>
        </div>
      </section>}
      <Link className={styles.help} href="/contact">Need help choosing parts for your car? Speak to our team <ArrowUpRight size={16} /></Link>
    </section>}
  </div>;
}
