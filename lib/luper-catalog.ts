import { partners } from './partners';
import { partnerCardImages } from './brand-hero-images';
import { getCatalog } from './shop/storefront';
import { shopBrandHref, shopPathFilters, vehicleBrowseHref } from './shop/routes';
import { vehicleMenu } from './shop-navigation';
import { normalizeSearch } from './shop/search';
import { money, type CatalogProduct } from './shop/types';
import type { LuperMessage } from './luper';
import { luperVehicleCatalog, type LuperVehicleCatalog } from './luper-vehicles';
import { luperBrowseCards } from './luper-browse';
import { filterProducts, supplierOf, suppliers } from './shop/taxonomy';
import { luperVehicleIndex, vehicleQuery as normalizeVehicleQuery } from './luper-vehicle-index';
import { safeLuperImage, safeLuperPath, type LuperCard, type LuperProfile } from './luper-shopping';

export type LuperCatalogContext = { candidates: LuperCard[]; page?: LuperCard; catalogAvailable: boolean; vehicleCatalog: LuperVehicleCatalog; verifiedVehicleMatches: LuperCard[]; directBrowse: LuperCard[] };
const makes = ['porsche', 'ferrari', 'lamborghini', 'mclaren', 'bmw', 'mercedes', 'audi', 'rolls royce', 'bentley', 'land rover', 'range rover', 'aston martin'];
const interests = [
  { words: /\b(exhaust|sound|loud|louder|valved)\b/, terms: ['exhaust', 'valved'] },
  { words: /\b(carbon|styling|aggressive|aero|body|spoiler|diffuser|splitter)\b/, terms: ['carbon', 'aero', 'spoiler', 'diffuser', 'splitter', 'body'] },
  { words: /\b(wheel|wheels|rims|stance)\b/, terms: ['wheel', 'forged', 'rim'] },
  { words: /\b(suspension|lower|lowering|springs)\b/, terms: ['suspension', 'spring'] },
];
const stopWords = new Set('the and for with your you my have want like looking help about this that these those what which can could would should please tell show find more some from into car drive year make model get best need something options upgrade upgrades'.split(' '));
const tokens = (text: string) => normalizeSearch(text).split(' ').filter(t => t.length > 2 && !stopWords.has(t) && !/^(19|20)\d{2}$/.test(t));
const contains = (text: string, term: string) => ` ${text} `.includes(` ${term} `);

function productCard(product: CatalogProduct): LuperCard {
  const amount = Number(product.priceRange.minVariantPrice.amount);
  const currency = product.priceRange.minVariantPrice.currencyCode;
  return { id: `product:${product.handle}`, kind: 'product', title: product.title.slice(0, 180),
    href: `/products/${encodeURIComponent(product.handle)}`, image: safeLuperImage(product.featuredImage?.url),
    subtitle: product.vendor.slice(0, 80),
    price: amount > 0 && Number.isFinite(amount) && /^[A-Z]{3}$/.test(currency) ? `From ${money(product.priceRange.minVariantPrice)}` : 'Ask for pricing' };
}

/** Deterministic retrieval: catalog data, never model-generated URLs or prices. */
export function rankLuperCatalog(products: CatalogProduct[], messages: LuperMessage[], profile: LuperProfile, pagePath: string): LuperCatalogContext {
  products = luperVehicleIndex(products).products;
  const path = safeLuperPath(pagePath);
  const pathname = path.split('?')[0];
  const currentProduct = products.find(p => pathname === `/products/${p.handle}`);
  const brands: LuperCard[] = partners.map(p => ({ id: `brand:${p.slug}`, kind: 'brand', title: p.name,
    href: `/partners/${p.slug}`, image: partnerCardImages[p.slug]?.image || p.image, subtitle: p.focus }));
  const shopCards: LuperCard[] = [
    ...partners.filter(p => p.supplier).map(p => ({ id: `shop:${p.supplier}`, kind: 'shop' as const,
      title: `Shop ${p.name}`, href: shopBrandHref(p.supplier!), image: partnerCardImages[p.slug]?.image || p.image, subtitle: p.focus })),
    ...vehicleMenu.map(item => {
      const make = new URLSearchParams(item.href.split('?')[1]).get('make')!;
      return { id: `shop:vehicle:${make}`, kind: 'shop' as const, title: `Shop by vehicle · ${item.name}`, href: vehicleBrowseHref(make) };
    }),
  ];
  const page = currentProduct ? productCard(currentProduct) : [...brands, ...shopCards].find(c => c.href === pathname);
  const latest = normalizeVehicleQuery(messages.at(-1)?.content || '');
  const conversation = normalizeSearch(messages.filter(m => m.role === 'user').slice(-4).map(m => m.content).join(' '));
  const query = normalizeSearch([conversation, ...Object.values(profile), page?.title || '', path.replace(/[/?=&-]/g, ' ')].join(' '));
  const supplierIn = (text: string) => suppliers.find(p => p.slug !== 'collectibles' && (contains(text, normalizeSearch(p.name)) || contains(text, p.slug)))?.slug;
  // A newly named vehicle starts an all-brand lookup unless this turn names a supplier.
  const supplier = supplierIn(latest) || (luperBrowseCards(products, latest).length ? undefined : supplierIn(query));
  const latestBrowse = luperBrowseCards(products, latest, supplier);
  const rememberedBrowse = luperBrowseCards(products, normalizeSearch(`${profile.make} ${profile.model}`), supplier);
  const browseCards = latestBrowse.length ? latestBrowse : rememberedBrowse.length ? rememberedBrowse : luperBrowseCards(products, query, supplier);
  const browseProductIds = new Set(browseCards.flatMap(card => filterProducts(products, shopPathFilters(card.href)).map(product => product.id)));
  const make = makes.find(m => contains(latest, m)) || makes.find(m => contains(normalizeSearch(profile.make), m)) || makes.find(m => contains(query, m));
  const category = interests.find(i => i.words.test(latest)) || interests.find(i => i.words.test(normalizeSearch(profile.interest))) || interests.find(i => i.words.test(query));
  const terms = [...new Set(tokens(query))];
  const score = (text: string) => terms.reduce((sum, term) => sum + (contains(normalizeSearch(text), term) ? (/[0-9]/.test(term) ? 5 : 1) : 0), 0);
  // Explicit model tags keep a Porsche 911 request away from Cayenne products.
  const models = [...new Set(products.filter(p => !make || contains(normalizeSearch(`${p.title} ${p.tags.join(' ')}`), make))
    .flatMap(p => p.tags.filter(t => /^(car_model_|model_)/.test(t)).map(t => normalizeSearch(t.replace(/^(car_model_|model_)/, '')))))];
  const model = models.filter(m => m.length > 1 && contains(latest, m)).sort((a, b) => b.length - a.length)[0]
    || models.filter(m => m.length > 1 && contains(normalizeSearch(profile.model), m)).sort((a, b) => b.length - a.length)[0]
    || models.filter(m => m.length > 1 && contains(query, m)).sort((a, b) => b.length - a.length)[0];
  const vehicleQuery = (make && contains(latest, make)) || (model && contains(latest, model)) ? latest
    : profile.make || profile.model ? normalizeSearch(`${profile.make} ${profile.model} ${profile.year}`) : query;
  const ranked = products.map(product => {
    const text = normalizeSearch([product.title, product.vendor, product.productType, ...product.tags].join(' '));
    const title = normalizeSearch(product.title);
    const generation = /\b(99[127]) ([12])\b/.exec(vehicleQuery);
    const listedGenerations = [...title.matchAll(/\b(99[127]) ([12])\b/g)].map(match => `${match[1]} ${match[2]}`);
    const generationMatches = !generation || !listedGenerations.length || listedGenerations.includes(`${generation[1]} ${generation[2]}`);
    const baseCarrera = /\bcarrera\b/.test(vehicleQuery) && !/\b(gts|gt3|gt2|turbo|dakar|carrera (?:4 )?s)\b/.test(vehicleQuery);
    const trimMatches = !baseCarrera || !/\b(gts|gt3|gt2|turbo|dakar)\b/.test(title)
      || /\bcarrera\b(?!\s*(?:4\s*)?(?:gts\b|s\b))/.test(title);
    const dailyUse = /\b(daily|road|street)\b/.test(query);
    const roadCandidate = !dailyUse || !/\b(cat replacement|catless|decat|racing|race)\b/.test(title);
    const vehicleMatches = browseCards.length ? browseProductIds.has(product.id) : (!make || contains(text, make)) && (!model || contains(text, model));
    const relevant = (!supplier || supplierOf(product) === supplier) && vehicleMatches
      && (!category || category.terms.some(term => title.includes(term) || normalizeSearch(product.productType).includes(term)))
      && generationMatches && trimMatches && roadCandidate;
    return { product, score: relevant ? score(title) * 3 + score(text) : 0 };
  }).filter(p => p.score > 1).sort((a, b) => b.score - a.score);
  const explicitPart = interests.some(interest => interest.words.test(latest)) || /\b(sku|part number|product code)\b/.test(latest);
  const browseFirst = !explicitPart && (latestBrowse.length > 0 || /\b(browse|whole|full|range|catalogue|catalog|collections?|everything)\b/.test(latest));
  const broad = browseFirst || (!category && !explicitPart && !currentProduct) || (!make && !model && !browseCards.length && !currentProduct);
  const productCards = broad ? [] : ranked.slice(0, 6).map(p => productCard(p.product));
  const rankedBrands = brands.map(card => ({ card, score: score(`${card.title} ${card.subtitle} ${partners.find(p => `brand:${p.slug}` === card.id)?.detail}`) }))
    .filter(p => p.score > 0).sort((a, b) => b.score - a.score).slice(0, 4).map(p => p.card);
  const rankedShop = shopCards.map(card => ({ card, score: score(`${card.title} ${card.subtitle || ''} ${card.href}`) }))
    .filter(p => p.score > 0).sort((a, b) => b.score - a.score).slice(0, 4).map(p => p.card);
  const candidates = [browseFirst && page?.kind === 'product' ? undefined : page, ...productCards, ...browseCards, ...rankedShop, ...rankedBrands].filter((c): c is LuperCard => !!c);
  return { candidates: [...new Map(candidates.map(c => [c.id, c])).values()].slice(0, 12), page, catalogAvailable: true, vehicleCatalog: luperVehicleCatalog(products), verifiedVehicleMatches: latestBrowse, directBrowse: luperBrowseCards(products, latest, supplier, true) };
}

export async function getLuperCatalogContext(messages: LuperMessage[], profile: LuperProfile, path: string): Promise<LuperCatalogContext> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const products = await Promise.race([
      getCatalog(),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Catalog timeout')), 4500); }),
    ]);
    return rankLuperCatalog(products, messages, profile, path);
  } catch {
    return { ...rankLuperCatalog([], messages, profile, path), catalogAvailable: false };
  } finally { clearTimeout(timer); }
}
