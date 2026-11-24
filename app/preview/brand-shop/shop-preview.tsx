'use client';
import { useShopParams as useSearchParams } from '@/components/shop/use-shop-params';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ArrowDownWideNarrow, Search, X, RotateCcw } from 'lucide-react';
import { BrandArtwork } from '@/components/brand-artwork';
import { ManufacturerLogo } from '@/components/shop/manufacturer-logo';
import { CatalogChoice } from '@/components/shop/catalog-choice';
import { TechartGenerationLinks, TechartModelRange } from '@/components/shop/techart-model-overview';
import { TechartStepPicker, techartStepHeading } from '@/components/shop/techart-step-picker';
import { filterBodyProducts, techartSelection, vehicleBodyMatch, vehicleImage, vehicleName, vehicleOptions } from '@/lib/shop/techart-fitment';
import { cayenneImage, cayenneName, cayenneOptions } from '@/lib/shop/techart-cayenne';
import { money, type CatalogProduct } from '@/lib/shop/types';
import { categoryOf, filterProducts, suppliers, tagsFor, techartGeneration, type Filters } from '@/lib/shop/taxonomy';
import { novitecModelCover, novitecShopProfile } from '@/lib/shop/novitec-models';
import { brandMakes, brandVehicleName } from '../shop/brand-catalogue';
import { shopBrandHref, productHref } from '@/lib/shop/routes';
import styles from '../novitec-shop/preview.module.css';
import own from './shop-preview.module.css';
import { VehicleVersionPicker } from './vehicle-version-picker';
import { capristoFitmentOptions } from '@/lib/shop/capristo-fitment';
import { valvetronicFitmentOptions } from '@/lib/shop/valvetronic-fitment';

type Car = { make: string; marque: string; model: string; name: string; count: number; fit?: string; body?: string };
const matches = (value: string, query: string) => query.toLowerCase().trim().split(/\s+/).every(word => value.toLowerCase().includes(word));


export function BrandShopPreview({ brand, products }: { brand: string; products: CatalogProduct[] }) {
  const supplier = suppliers.find(item => item.slug === brand)!;
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const makes = useMemo(() => brandMakes(products), [products]);
  const cars = useMemo(() => makes.flatMap(make => {
    const inventory = products.filter(product => tagsFor(product, 'make').includes(make.key));
    return [...new Set(inventory.flatMap(product => tagsFor(product, 'model')))].map(model => ({ make: make.key, marque: make.name, model, name: brandVehicleName(model), count: filterProducts(inventory, { make: make.key, model }).length }));
  }).sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true })), [makes, products]);
  const requestedMake = brand === 'valvetronic' && params.get('make') === 'corvette' ? 'chevrolet' : params.get('make');
  const make = makes.find(item => item.key === requestedMake) ?? (makes.length === 1 ? makes[0] : undefined);
  const models = cars.filter(car => car.make === make?.key);
  const choosing = params.get('choose') === '1';
  const selected = models.find(car => car.model === params.get('model')) ?? (!params.get('model') && models.length === 1 ? models[0] : undefined);
  const techart = brand === 'techart';
  const fit = params.get('fit') || undefined;
  const porscheGeneration = techart ? params.get('generation') || techartGeneration(fit) : undefined;
  const body = params.get('body') || undefined;
  const hasVehicleFitments = brand === 'capristo' || brand === 'valvetronic';
  const modelProducts = hasVehicleFitments && make && selected ? filterProducts(products, { brand, make: make.key, model: selected.model }) : [];
  const fitmentOptions = make && selected ? brand === 'capristo' ? capristoFitmentOptions(modelProducts, make.key, selected.model)
    : brand === 'valvetronic' ? valvetronicFitmentOptions(modelProducts, make.key, selected.model) : [] : [];
  const selectedFitment = fitmentOptions.find(option => option.key === fit);
  const vehicleGeneration = params.get('generation') || selectedFitment?.generation;
  const generations = [...new Map(fitmentOptions.filter(option => option.generation).map(option => [option.generation!, option.generationLabel!])).entries()];
  const generationLabel = fitmentOptions.find(option => option.generation === vehicleGeneration)?.generationLabel;
  const porscheOptions = useMemo(() => techart ? {
    '911': vehicleOptions(filterProducts(products, { brand, make: 'porsche', model: '911' })),
    cayenne: cayenneOptions(filterProducts(products, { brand, make: 'porsche', model: 'cayenne' })),
  } : undefined, [techart, brand, products]);
  const porscheModel = techart && (selected?.model === '911' || selected?.model === 'cayenne') ? selected.model : undefined;
  const modelLanding = !!porscheModel && !porscheGeneration && params.get('view') !== 'accessories';
  const selection = techartSelection({ brand, model: porscheModel, fit, body });
  const porscheTrim = porscheModel ? porscheOptions?.[porscheModel].flatMap(generation => generation.bodies.filter(style => body === 'targa' ? style.key === 'targa' : style.key !== 'targa').flatMap(style => style.choices)).find(choice => choice.fit === fit)?.name : undefined;
  const validPorsche = porscheModel && porscheOptions?.[porscheModel].some(generation => generation.bodies.some(style => style.key === body && style.choices.some(choice => choice.fit === fit)));
  const active = !choosing && (!techart || validPorsche) ? selected : undefined;
  const activeName = active && selection?.body ? selection.model === '911' ? vehicleName(selection.fit, selection.body) : cayenneName(selection.fit, selection.body) : active && hasVehicleFitments ? [active.name, generationLabel, selectedFitment?.version].filter(Boolean).join(' / ') : active?.name;
  const accessories = params.get('view') === 'accessories';
  const unassigned = products.filter(product => !tagsFor(product, 'make').length);
  const category = params.get('category') || undefined;
  const sort = params.get('sort') || undefined;
  const filters: Filters = { brand, ...(active ? { make: active.make, model: active.model, body, ...(techart ? { fit, generation: techartGeneration(fit) } : hasVehicleFitments ? { fit, generation: vehicleGeneration } : {}) } : {}), category, sort };
  const candidates = accessories ? unassigned : active ? filterProducts(products, { ...filters, category: undefined, sort: undefined }) : [];
  const scoped = filterBodyProducts(candidates, techart ? selection : undefined);
  const review = techart && selection?.body ? candidates.filter(product => vehicleBodyMatch(product, selection) === 'review') : [];
  const categories = [...new Set(scoped.map(categoryOf))].sort((a, b) => {
    const rank = (name: string) => { const index = supplier.categories.indexOf(name); return index < 0 ? 99 : index; };
    return rank(a) - rank(b) || a.localeCompare(b);
  });
  const shown = filterProducts(scoped, accessories ? { category, sort } : filters);
  const browsing = !!active || accessories;
  const generationTabs = hasVehicleFitments && !!active && !accessories && generations.length > 0;
  function go(values: Filters & { choose?: string; view?: string }) {
    const query = shopBrandHref(brand, values);
    setSearch(''); setSearchOpen(false);
    router.push(query, { scroll: ['make', 'model', 'generation', 'fit', 'body', 'choose', 'view'].some(key => (params.get(key) || undefined) !== values[key as keyof typeof values]) });
  }
  const chooseCar = (car: Car, category?: string) => go({ make: car.make, model: car.model, fit: car.fit, body: car.body, category });
  function chooseMake(key: string) {
    const options = cars.filter(car => car.make === key);
    if (options.length === 1) chooseCar(options[0]);
    else go({ make: key });
  }
  const searchCars: Car[] = useMemo(() => porscheOptions ? Object.entries(porscheOptions).flatMap(([model, generations]) => generations.flatMap(generation => generation.bodies.flatMap(style => style.choices.map(choice => ({ make: 'porsche', marque: 'Porsche', model, name: model === '911' ? vehicleName(choice.fit, style.key === 'suv' ? undefined : style.key) : cayenneName(choice.fit, style.key === 'coupe' ? 'coupe' : 'suv'), count: choice.count, fit: choice.fit, body: style.key }))))) : cars, [porscheOptions, cars]);
  const collections = useMemo(() => searchCars.flatMap(car => {
    const scope = { brand, make: car.make, model: car.model, fit: car.fit, body: car.body };
    return [...new Set(filterBodyProducts(filterProducts(products, scope), techartSelection(scope)).map(categoryOf))].map(name => ({ car, name }));
  }), [searchCars, products, brand]);
  const carResults = search.trim() ? searchCars.filter(car => matches(`${car.marque} ${car.name}`, search)).slice(0, 5) : [];
  const collectionResults = search.trim() ? collections.filter(item => matches(`${item.car.marque} ${item.car.name} ${item.name}`, search)).slice(0, 5) : [];
  const partResults = search.trim() ? products.filter(product => matches(product.title, search)).slice(0, 4) : [];
  const porscheProfile = active && selection?.body ? selection.model === '911' ? vehicleImage(selection.fit, selection.body) : cayenneImage(selection.fit, selection.body) : undefined;
  const landingProfile = modelLanding ? porscheModel === '911' ? vehicleImage('992_2_carrera', 'coupe') : cayenneImage('e3_2_cayenne', 'suv') : undefined;
  const profile = porscheProfile ?? (active ? novitecShopProfile(active.model, body) : undefined);
  const cover = active && !techart ? novitecModelCover(body ? `${active.model}_${body}` : active.model) : undefined;

  return <div className={`${styles.page} ${own.page}`}>
    <header className={`${styles.hero}${browsing ? ` ${styles.heroWithToolbar}` : ''}`}>
      <div className={styles.topline}>
        <BrandArtwork brand={brand} className={own.wordmark} sizes="180px" />
        <div className={styles.searchWrap} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setSearchOpen(false); }}>
          <div className={styles.searchField}><Search size={18} aria-hidden="true" /><input aria-label={`Search ${supplier.name} cars, collections and parts`} placeholder="Search a car, collection or part…" value={search} onChange={event => { setSearch(event.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} onKeyDown={event => { if (event.key === 'Escape') setSearchOpen(false); }} aria-controls="brand-preview-search" />{search && <button aria-label="Clear search" onClick={() => setSearch('')}><X size={17} /></button>}</div>
          {searchOpen && search.trim() && <div className={styles.suggestions} id="brand-preview-search">
            {!!carResults.length && <section><h2>Cars</h2>{carResults.map(car => <button key={`${car.make}-${car.model}-${car.fit}-${car.body}`} onClick={() => chooseCar(car)}><span>{car.marque} {car.name}<small>{car.count} parts</small></span><ArrowUpRight size={15} /></button>)}</section>}
            {!!collectionResults.length && <section><h2>Collections</h2>{collectionResults.map(({ car, name }) => <button key={`${car.make}-${car.model}-${car.fit}-${car.body}-${name}`} onClick={() => chooseCar(car, name)}><span>{car.marque} {car.name}<small>{name}</small></span><ArrowUpRight size={15} /></button>)}</section>}
            {!!partResults.length && <section><h2>Parts</h2>{partResults.map(product => <Link key={product.id} href={productHref(product.handle, shopBrandHref(brand, filters))}>{product.title}<ArrowUpRight size={15} /></Link>)}</section>}
            {!carResults.length && !collectionResults.length && !partResults.length && <p>No matches. Try a model or article number.</p>}
          </div>}
        </div>
      </div>
      {techart ? <nav className={styles.breadcrumbs} aria-label="Vehicle selection">
        <Link href="/shop">SHOP</Link><span aria-hidden="true">/</span><Link href="/shop/techart">TECHART</Link>
        {porscheModel && <><span aria-hidden="true">/</span>{!porscheGeneration ? <span aria-current="page">Porsche {selected?.name}</span> : <Link href={shopBrandHref(brand, { make: 'porsche', model: porscheModel })}>Porsche {selected?.name}</Link>}</>}
        {porscheGeneration && <><span aria-hidden="true">/</span>{!fit ? <span aria-current="page">{porscheGeneration.replaceAll('_', '.').toUpperCase()}</span> : <Link href={shopBrandHref(brand, { make: 'porsche', model: porscheModel, generation: porscheGeneration })}>{porscheGeneration.replaceAll('_', '.').toUpperCase()}</Link>}</>}
        {fit && <><span aria-hidden="true">/</span>{!body || body === 'targa' ? <span aria-current="page">{porscheTrim || activeName}</span> : <Link href={shopBrandHref(brand, { make: 'porsche', model: porscheModel, generation: porscheGeneration, fit })}>{porscheTrim || activeName}</Link>}</>}
        {body && body !== 'targa' && <><span aria-hidden="true">/</span><span aria-current="page">{body === 'coupe' ? 'Coupé' : body === 'suv' ? 'SUV' : 'Cabriolet'}</span></>}
      </nav> : <nav className={styles.breadcrumbs} aria-label="Vehicle selection"><Link href="/shop">SHOP</Link><span aria-hidden="true">/</span><button onClick={() => go({})}>{supplier.name}</button>{!accessories && make && <><span aria-hidden="true">/</span><button onClick={() => go({ make: make.key, choose: '1' })}>{make.name}</button></>}{porscheModel && !accessories && <><span aria-hidden="true">/</span><Link href={shopBrandHref(brand, { make: 'porsche', model: porscheModel })}>{selected?.name}</Link></>}{active && !accessories && <><span aria-hidden="true">/</span><span aria-current="page">{activeName}</span></>}{accessories && <><span aria-hidden="true">/</span><span aria-current="page">Accessories & controls</span></>}</nav>}
      <div className={styles.heroContent}><div><h1>{accessories ? 'Accessories & controls.' : active ? <><span className={styles.vehicleMarque}>{active.marque}</span><span>{activeName}</span></> : modelLanding ? <><span className={styles.vehicleMarque}>Porsche</span><span>{porscheModel === '911' ? '911' : 'Cayenne'}</span></> : techart ? techartStepHeading({ model: porscheModel, generation: porscheGeneration, body, fit }) : make ? `Choose your ${make.name}.` : 'Start with your car.'}</h1>{!browsing && <p>{modelLanding ? `TECHART carbon fibre parts, body kits, wheels and exhausts for your Porsche ${porscheModel === '911' ? '911' : 'Cayenne'}. Choose your generation to find parts for your exact variant.` : techart ? porscheModel ? 'Select the next step to find parts for your exact Porsche.' : 'Start with your Porsche model.' : 'Find the parts and possibilities for your model.'}</p>}{modelLanding && porscheModel && porscheOptions && <TechartGenerationLinks model={porscheModel} options={porscheOptions[porscheModel]}/>}</div>
        {landingProfile && <div className={`${styles.selectedCar} ${own.modelLandingCar}`}>
          <div className={styles.selectedArtwork} data-tall={porscheModel === 'cayenne' ? 'true' : undefined}><Image className={styles.selectedImage} src={landingProfile.src} alt={`Porsche ${porscheModel === '911' ? '911 Coupé' : 'Cayenne SUV'} model illustration`} width={landingProfile.width} height={landingProfile.height} sizes="(max-width:700px) 85vw, (max-width:1100px) 40vw, 495px" loading="eager" /></div>
        </div>}
        {active && !accessories && <div className={profile ? styles.selectedCar : own.changeOnly}>
          {profile && <div className={styles.selectedArtwork} data-tall={['urus', 'cullinan', 'purosangue', 'cayenne'].includes(active.model) ? 'true' : undefined}>{cover && <Image className={`${styles.selectedImage} ${styles.selectedShadow}`} src={cover} alt="" aria-hidden="true" width={1116} height={598} sizes="(max-width:700px) 85vw, 40vw" />}<Image className={styles.selectedImage} src={profile.src} alt={`${active.marque} ${activeName}`} width={porscheProfile?.width ?? 1116} height={porscheProfile?.height ?? 598} sizes="(max-width:700px) 85vw, 40vw" /></div>}
          <button className={styles.change} onClick={() => go(techart ? { make: active.make, model: active.model } : { make: active.make, choose: '1' })}><RotateCcw size={15} />Change car</button>
        </div>}
      </div>
      {browsing && <div className={styles.toolbar}>
        {generationTabs && active ? <nav className={`${styles.categories} ${own.generationTabs}`} aria-label="Vehicle generation">
          <button aria-pressed={!vehicleGeneration} onClick={() => go({ make: active.make, model: active.model, sort })}>All generations</button>
          {generations.map(([key, name]) => <button key={key} aria-pressed={vehicleGeneration === key}
            onClick={() => go({ make: active.make, model: active.model, generation: key, sort })}>{name}</button>)}
        </nav> : categories.length > 1 ? <nav className={styles.categories} aria-label="Product categories">
          <button aria-pressed={!category} onClick={() => go({ ...filters, view: accessories ? 'accessories' : undefined, category: undefined })}>All parts</button>
          {categories.map(name => <button key={name} aria-pressed={category === name} onClick={() => go({ ...filters, view: accessories ? 'accessories' : undefined, category: name })}>{name}</button>)}
        </nav> : null}
        <div className={`${styles.sortControl} ${own.toolbarChoices}`}>
          {generationTabs && categories.length > 1 && <CatalogChoice variant="filter" label="Product category" value={category || ''}
            options={[['', 'All parts'], ...categories.map(name => [name, name] as const)]}
            onChange={value => go({ ...filters, category: value || undefined })}><span>{category || 'All parts'}</span></CatalogChoice>}
          <CatalogChoice variant="sort" label="Sort parts" value={sort || ''} options={[["", "Default"], ["price-up", "Price: low to high"], ["price-down", "Price: high to low"], ["name", "Name: A–Z"]]}
            onChange={value => go({ ...filters, view: accessories ? 'accessories' : undefined, sort: value || undefined })}><ArrowDownWideNarrow size={18} /><span>Sort</span></CatalogChoice>
        </div>
      </div>}
    </header>
    {hasVehicleFitments && active && !accessories && fitmentOptions.some(option => option.generation === vehicleGeneration) && <section className={own.fitmentSection} aria-label={`${supplier.name} generation and version`}>
      <VehicleVersionPicker versions={fitmentOptions} brand={supplier.name} generation={vehicleGeneration} fit={fit}
        onChange={(generation, fit) => go({ make: active.make, model: active.model, generation, fit, sort })} />
    </section>}
    {modelLanding && porscheModel ? <TechartModelRange model={porscheModel} products={products}/> : !browsing ? <section className={`${styles.picker}${!porscheModel && !techart ? ` ${own.manufacturerPicker}` : ''}`} aria-label="Choose your car"><div className={styles.pickerTitle}><span>{modelLanding ? 'Choose your generation' : techart ? 'Select an option' : make ? 'Select a model' : 'Select a manufacturer'}</span>{!!unassigned.length && <button onClick={() => go({ view: 'accessories' })}>Accessories & controls</button>}</div>
      {techart && porscheOptions ? <TechartStepPicker options={porscheOptions} model={porscheModel} generation={porscheGeneration} body={body} fit={fit} /> : !make ? <div className={`${own.makeGrid}${brand === 'gintani' ? ` ${own.twoColumnMakes}` : ''}`}>{makes.map(item => {
        return <button key={item.key} className={own.makeCard} data-make={item.key} aria-label={`Choose ${item.name}`} onClick={() => chooseMake(item.key)}>
          <ManufacturerLogo make={item.key} name={item.name} /><ArrowUpRight size={17} />
        </button>;
      })}</div> : <div className={own.modelGrid}>{models.map(car => <button key={car.model} className={`${styles.carCard} ${own.modelCard}`} onClick={() => chooseCar(car)}><div className={styles.carLabel}><h2>{car.name}</h2><ArrowUpRight size={20} aria-hidden="true" /></div></button>)}</div>}
      {make && !models.length && <p>Contact our team for parts for this model.</p>}
    </section> : <section className={styles.catalogue} aria-label="Products for your car">
      {categories.filter(name => !category || name === category).map(name => { const items = shown.filter(product => categoryOf(product) === name); return <section className={styles.productSection} key={name}><h2>{name}<sup>{items.length}</sup></h2><div className={styles.productGrid}>{items.map(product => <Link key={product.id} href={productHref(product.handle, shopBrandHref(brand, filters))} className={`shop-product-card ${styles.productCard}`}><div className="shop-product-image">{product.featuredImage && <Image src={product.featuredImage.url} alt={product.featuredImage.altText || product.title} width={600} height={600} sizes="(max-width:700px) 44vw, (max-width:1100px) 29vw, 22vw" />}<span className="shop-product-arrow"><ArrowUpRight size={18} /></span></div><h3>{techart ? product.title.replace(/^TECHART\s*[-–]\s*/i, '') : product.title}</h3><p className="shop-price">From {money(product.priceRange.minVariantPrice)}</p></Link>)}</div></section>; })}
      {!shown.length && <p>No parts in this category. <button onClick={() => go({ ...filters, view: accessories ? 'accessories' : undefined, category: undefined })}>View all parts</button></p>}
      {!!review.length && <details className={own.fitmentReview}><summary>Fitment confirmation needed ({review.length})</summary><p>These parts need a compatibility check for your selected Porsche. Contact our team before ordering.</p><ul>{review.map(product => <li key={product.id}><Link href={productHref(product.handle, shopBrandHref(brand, filters))}>{product.title.replace(/^TECHART\s*[-–]\s*/i, '')}<ArrowUpRight size={15} aria-hidden="true" /></Link></li>)}</ul></details>}
      <Link className={styles.help} href={`/contact?programme=${encodeURIComponent(supplier.name)}`}>Need help choosing parts for your car? Speak to our team <ArrowUpRight size={16} /></Link>
    </section>}
    {techart && !porscheModel && !browsing && <TechartModelRange products={products}/>}
  </div>;
}
