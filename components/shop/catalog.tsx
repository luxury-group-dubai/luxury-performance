import '@/app/shop.css';
import type { ReactNode } from 'react';
import { ferrariVersionMatch, is812Selection, isSF90Body, isSF90Selection, sf90Bodies } from '@/lib/shop/novitec-ferrari-fitment';
import Image from 'next/image';
import Link from 'next/link';
import { partnerForSupplier } from '@/lib/partners';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { CatalogProductToolbar, CatalogFilterPanel, CatalogAppliedFilters, CatalogMobileProvider } from './catalog-mobile-controls';
import { CatalogTabs } from './catalog-tabs';
import type { CatalogProduct } from '@/lib/shop/types';
import { money } from '@/lib/shop/types';
import { isUsedPart, wheelGroupSize, wheelGroupUnit } from '@/lib/shop/used-parts';
import { suppliers, supplierOf, categoryOf, tagsFor, filterProducts, filterUrl, fitOptions, inStockShopPath, type Filters } from '@/lib/shop/taxonomy';
import { cayenneBodies, isCayenneLineupFit } from '@/lib/shop/techart-cayenne';
import { bodyStyles, filterBodyProducts, is911LineupFit, supportsBody, techartSelection, vehicleBodyMatch } from '@/lib/shop/techart-fitment';
import { SelectedVehicle } from './vehicle-selector';
import { CapristoImagePlaceholder } from './capristo-image-placeholder';
import { novitecShopProfile } from '@/lib/shop/novitec-models';
import { f8Bodies, f8BodyMatch, isF8Body, isF8Selection } from '@/lib/shop/novitec-f8-fitment';
import vehicleStyles from './vehicle-selector.module.css';
// Match the 90% image inset, catalogue gutters, sidebar and 2/3/4-column grids.
const catalogImageSizes = '(max-width: 700px) calc((100vw - 2 * clamp(24px, 5vw, 88px) - 12px) * 0.45), (max-width: 1150px) calc((90vw - 230px) * 0.45), (max-width: 1599px) calc((100vw - 2 * clamp(24px, 5vw, 88px) - 302px) * 0.3), calc((100vw - 2 * clamp(24px, 5vw, 88px) - 322px) * 0.225)';
const shopifyThumbnailWidths = [256, 384, 480, 640, 828, 1080];

function CatalogThumbnail({ src, alt, preview }: { src: string; alt: string; preview: boolean }) {
  if (!src.startsWith('https://cdn.shopify.com/s/files/')) {
    return <Image src={src} alt={alt} width={700} height={700} sizes={catalogImageSizes} unoptimized={preview} quality={75} loading="lazy" />;
  }

  function atWidth(width: number) {
    const url = new URL(src);
    url.searchParams.set('width', String(width));
    return url.href;
  }

  // Shopify resizes its own images; sending them through Next adds an upstream request.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={atWidth(640)} srcSet={shopifyThumbnailWidths.map(width => `${atWidth(width)} ${width}w`).join(', ')} sizes={catalogImageSizes} alt={alt} width={700} height={700} loading="lazy" decoding="async" />;
}
type VehicleCollection = {
  scope: Filters;
  makeHref: string;
  makeLabel: string;
  artwork?: ReactNode;
  versions?: ReactNode;
};

export function Catalog({ products, filters: queryFilters, title, description, basePath = '/shop', productBasePath = '/products', preview = false, previewLabel = 'Used parts preview', vehicleCollection, tabTotals }: { products: CatalogProduct[]; filters: Filters; title?: string; description?: string; basePath?: string; productBasePath?: string; preview?: boolean; previewLabel?: string; vehicleCollection?: VehicleCollection; tabTotals?: { all?: number; stock?: number } }) {
  const filters = vehicleCollection ? { ...queryFilters, ...vehicleCollection.scope } : queryFilters;
  const inStock = basePath === '/shop' && filters.stock === 'in-stock';
  const allTotal = tabTotals?.all ?? (inStock ? undefined : products.length);
  const stockTotal = tabTotals?.stock ?? (inStock ? products.length : undefined);
  const selected = suppliers.find(s => s.slug === filters.brand);
  const heading = inStock && selected
    ? `${selected.name} in stock`
    : inStock ? 'All in stock' : title || selected?.name || 'All parts';
  const introDescription = inStock
    ? 'Available from our stock in Dubai.'
    : description || selected?.description || 'Exceptional components from the names that know your car. Find your programme. Make it yours.';
  const scope = products.filter(p => !filters.brand || supplierOf(p) === filters.brand);
  const makes = [...new Set(scope.flatMap(p => tagsFor(p, 'make')))].sort();
  const vehicleScope = scope.filter(p => !filters.make || tagsFor(p, 'make').includes(filters.make));
  const models = [...new Set(vehicleScope.flatMap(p => tagsFor(p, 'model')))].sort();
  const cayenne = filters.brand === 'techart' && filters.model === 'cayenne';
  const porsche911 = filters.brand === 'techart' && filters.model === '911';
  const fits = fitOptions(scope, filters).filter(fit => fit === filters.fit || (cayenne ? isCayenneLineupFit(fit) : !porsche911 || is911LineupFit(fit)));
  const vehicle = techartSelection(filters);
  const usesTabHeader = !preview && !vehicleCollection && basePath === '/shop';
  const novitecProfile = usesTabHeader && filters.brand === 'novitec' && filters.model
    ? novitecShopProfile(filters.model, filters.body)
    : undefined;
  const hasVehicleArtwork = !!(vehicle || novitecProfile);
  const partnerHref = selected && partnerForSupplier(selected.slug) ? `/partners/${selected.slug}` : undefined;
  const f8Selection = isF8Selection(filters);
  const f8Body = f8Selection && isF8Body(filters.body) ? filters.body : undefined;
  const sf90Body = isSF90Selection(filters) && isSF90Body(filters.body) ? filters.body : undefined;
  const version812 = is812Selection(filters) ? (filters.model === '812_gts' ? 'gts' : 'superfast') : undefined;
  const bodies = isSF90Selection(filters) ? [...sf90Bodies]
    : vehicle?.model === '911' ? bodyStyles.filter(body => supportsBody(vehicle.fit, body.key))
    : vehicle?.model === 'cayenne' ? cayenneBodies.filter(body => !vehicle.fit.endsWith('_turbo_gt') || body.key === 'coupe')
    : f8Selection ? [...f8Bodies] : [];
  const departmentScope = filterBodyProducts(filterProducts(scope, { ...filters, category: undefined }), vehicle);
  const categories = [...new Set(scope.map(categoryOf))].sort().map(name => ({ name, count: departmentScope.filter(p => categoryOf(p) === name).length }));
  const candidates = filterProducts(products, filters);
  const matches = filterBodyProducts(candidates, vehicle);
  const review = vehicle?.body ? candidates.filter(product => vehicleBodyMatch(product, vehicle) === 'review') : f8Body ? filterProducts(products, { ...filters, body: undefined }).filter(product => f8BodyMatch(product, f8Body) === 'review') : sf90Body || version812 ? filterProducts(products, { ...filters, model: version812 ? undefined : filters.model, body: undefined }).filter(product => (!version812 || tagsFor(product, 'model').includes(filters.model!)) && ferrariVersionMatch(product, (sf90Body || version812)!) === 'review') : [];
  const pages = Math.max(1, Math.ceil(matches.length / 24));
  const page = Math.min(pages, Math.max(1, Math.floor(Number(filters.page)) || 1));
  const shown = matches.slice((page - 1) * 24, page * 24);
  const href = (changes: Filters) => filterUrl(basePath, { ...queryFilters, ...changes });
  return <CatalogMobileProvider><div className="shop-page">
    {preview && <div className="shop-topline"><Link href="/">Luxury Performance</Link><span>/</span><Link href={basePath}>{previewLabel}</Link>{selected && <><span>/</span><span>{selected.name}</span></>}</div>}
    <div className={usesTabHeader ? 'shop-dark-header' : undefined}>
    <section className={`shop-intro shop-intro-small ${vehicle && !usesTabHeader ? vehicleStyles.catalogIntro : ''}${vehicleCollection ? ' shop-model-intro' : preview ? '' : ' shop-catalogue-intro'}${usesTabHeader ? ' shop-tab-intro' : ''}`}>
      <div>
        {vehicleCollection && <Link className="shop-model-back" href={vehicleCollection.makeHref}><ArrowLeft size={13} aria-hidden="true" />{vehicleCollection.makeLabel}</Link>}
        {preview && <span className="tiny-label">The parts. The possibilities.</span>}
        <h1>{heading}</h1>
        {usesTabHeader && <p className="shop-intro-description">{introDescription}</p>}
        {vehicleCollection?.versions}
      </div>
      {vehicleCollection ? (
        vehicleCollection.artwork && <div className="shop-intro-aside shop-intro-model-artwork">{vehicleCollection.artwork}</div>
      ) : (!usesTabHeader || hasVehicleArtwork || partnerHref) && (
        <div className={`shop-intro-aside ${vehicle ? vehicleStyles.catalogVehicle : ''}${hasVehicleArtwork && usesTabHeader ? ' shop-tab-vehicle' : ''}`}>
          {vehicle ? <SelectedVehicle selection={vehicle} compact={usesTabHeader} /> : novitecProfile ? (
            <div className={`${vehicleStyles.selectedProfile} ${vehicleStyles.novitecStage}`}>
              <Image
                src={novitecProfile.src}
                alt={novitecProfile.name}
                className={vehicleStyles.novitecProfile}
                width={1116}
                height={598}
                loading="eager"
                sizes="(max-width: 700px) 1px, (max-width: 1100px) 44vw, 495px"
              />
            </div>
          ) : <>
            {!usesTabHeader && <p>{introDescription}</p>}
            {partnerHref && <Link href={partnerHref}>Discover {selected?.name} <ArrowUpRight size={18} /></Link>}
          </>}
        </div>
      )}
    </section>
    </div>
    {!preview && !vehicleCollection && <div className={`shop-supplier-bar${usesTabHeader ? ' shop-supplier-bar-dark' : ''}`}>
      <CatalogTabs activeTab={`${inStock ? 'stock' : 'all'}:${filters.brand ?? ''}`}>
        <Link href={basePath} scroll={!usesTabHeader} aria-current={!inStock && !filters.brand ? 'page' : undefined}>
          All parts {allTotal !== undefined && <sup>{allTotal}</sup>}
        </Link>
        <Link href={inStockShopPath} scroll={!usesTabHeader} aria-current={inStock && !filters.brand ? 'page' : undefined}>
          All in stock {stockTotal !== undefined && <sup>{stockTotal}</sup>}
        </Link>
        {suppliers.filter(supplier => products.some(product => supplierOf(product) === supplier.slug)).map(supplier => (
          <Link
            href={filterUrl(basePath, { brand: supplier.slug, stock: filters.stock })}
            scroll={!usesTabHeader}
            aria-current={filters.brand === supplier.slug ? 'page' : undefined}
            key={supplier.slug}
          >
            {supplier.name} <sup>{products.filter(product => supplierOf(product) === supplier.slug).length}</sup>
          </Link>
        ))}
      </CatalogTabs>
    </div>}
    <div className="shop-catalogue" id="catalogue">
      {filters.brand === 'capristo' && filters.approval && <p className="capristo-approval-note">{filters.approval === 'approved' ? 'Road approved (Germany)' : filters.approval === 'not-approved' ? 'Not road approved (Germany)' : 'Approval to confirm'} · Based on Capristo Germany’s listings reviewed on 12 November 2026. Confirm the exact configuration and local requirements before ordering. <Link href="/partners/capristo#vehicles">Change range</Link></p>}
      <CatalogFilterPanel filters={queryFilters} basePath={basePath} makes={vehicleCollection ? [] : makes} models={vehicleCollection ? [] : models} fits={vehicleCollection ? [] : fits} bodies={vehicleCollection ? [] : bodies} categories={categories} total={departmentScope.length} resultCount={matches.length}><div className="shop-fitment-help"><Link href="/contact">Need help with fitment? <ArrowUpRight size={14} aria-hidden="true" /></Link></div></CatalogFilterPanel>
      <section className="shop-results" aria-label="Products">
        <CatalogProductToolbar filters={queryFilters} basePath={basePath} resultLabel={`${matches.length} ${matches.length === 1 ? 'part' : 'parts'}${selected ? ` from ${selected.name}` : ''}`} />
        <CatalogAppliedFilters filters={queryFilters} basePath={basePath} />
        {shown.length ? <div className="shop-product-grid">{shown.map(p=><Link className="shop-product-card" key={p.id} href={`${productBasePath}/${p.handle}`}><div className="shop-product-image">{p.featuredImage?<CatalogThumbnail src={p.featuredImage.url} alt={p.featuredImage.altText || p.title} preview={preview} />:p.vendor.toLowerCase() === 'capristo' ? <CapristoImagePlaceholder /> : <span>{p.vendor}</span>}<span className="shop-product-arrow"><ArrowUpRight size={18}/></span>{isUsedPart(p) && <span className="shop-used">Used</span>}</div><div className="shop-card-meta"><span>{p.vendor}</span><span>{categoryOf(p)}</span></div><h2>{p.title.replace(/^TECHART\s*[-–]\s*/i,'')}</h2><p className="shop-price">{preview && Number(p.priceRange.minVariantPrice.amount) === 0 ? 'Price pending' : wheelGroupSize(p) ? `${money(p.priceRange.minVariantPrice)} / ${wheelGroupUnit(wheelGroupSize(p)!)}` : `From ${money(p.priceRange.minVariantPrice)}`}</p></Link>)}</div>:<div className="shop-empty"><h2>No matching parts.</h2><p>Try another vehicle or department, or ask our team about your car.</p><Link href={filterUrl(basePath, { brand: queryFilters.brand, stock: queryFilters.stock })} scroll={false}>Clear filters →</Link></div>}
        {pages>1 && <nav className="shop-pagination" aria-label="Pagination">{page>1?<Link href={href({page:String(page-1)})}>← Previous</Link>:<span/>}<span>Page {page} of {pages}</span>{page<pages?<Link href={href({page:String(page+1)})}>Next →</Link>:<span/>}</nav>}
        {!!review.length && <details className={vehicleStyles.review}><summary>{review.length} more {review.length === 1 ? 'part needs' : 'parts need'} fitment confirmation</summary><p>{f8Body || sf90Body || version812 ? 'These listings do not clearly specify your version, or are for a special programme. Confirm compatibility with our team before ordering.' : 'Confirm fitment with our team before ordering these parts.'}</p><ul>{review.map(product => <li key={product.id}><Link href={`/products/${product.handle}`}>{product.title}</Link></li>)}</ul></details>}
      </section>
    </div>
  </div></CatalogMobileProvider>;
}
