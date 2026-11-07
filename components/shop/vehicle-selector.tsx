/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import type { CatalogProduct } from '@/lib/shop/types';
import { cayenneImage, cayenneName, cayenneOptions, isCayenneBody, isCayenneFit } from '@/lib/shop/techart-cayenne';
import { isBodyStyle, vehicleImage, vehicleName, vehicleOptions, type TechartSelection } from '@/lib/shop/techart-fitment';
import { filterProducts } from '@/lib/shop/taxonomy';
import { VehiclePicker } from './vehicle-picker';
import styles from './vehicle-selector.module.css';

export function VehicleSelector({ products, fit, body, shopPath = '/shop' }: { products: CatalogProduct[]; fit?: string; body?: string; shopPath?: string }) {
  const legacyTarga = fit?.endsWith('_carrera_targa_gts');
  const initialBody = legacyTarga ? 'targa' : isBodyStyle(body) ? body : undefined;
  const initialFit = legacyTarga ? fit?.replace(/_carrera_targa_gts$/, '_carrera_4_gts') : fit;
  return <VehiclePicker key={`${initialFit}:${initialBody}`} model="911" options={vehicleOptions(products)} initialFit={initialFit} initialBody={initialBody} shopPath={shopPath} />;
}

export function CayenneSelector({ products, fit, body }: { products: CatalogProduct[]; fit?: string; body?: string }) {
  const initialFit = isCayenneFit(fit) ? fit : undefined;
  const initialBody = isCayenneBody(body) ? body : undefined;
  const cayennes = filterProducts(products, { brand: 'techart', make: 'porsche', model: 'cayenne' });
  return <VehiclePicker key={`${initialFit}:${initialBody}`} model="cayenne" options={cayenneOptions(cayennes)} initialFit={initialFit} initialBody={initialBody} shopPath="/shop" />;
}

export function SelectedVehicle({ selection }: { selection: TechartSelection }) {
  const { model, fit, body } = selection;
  const cayenne = model === 'cayenne';
  const query = new URLSearchParams({ ...(cayenne ? { model } : {}), fit, ...(body ? { body } : {}) });
  const image = cayenne ? cayenneImage(fit, selection.body) : vehicleImage(fit, selection.body);
  const name = cayenne ? cayenneName(fit, selection.body) : vehicleName(fit, selection.body);
  return <div className={styles.selected}>
    <img {...image} alt="" />
    <p>{name}</p>
    <Link className={styles.change} href={`/partners/techart?${query}#vehicles`}>Change car</Link>
  </div>;
}
