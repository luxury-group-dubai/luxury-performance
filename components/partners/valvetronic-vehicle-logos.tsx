import Image from 'next/image';
import Link from 'next/link';
import { valvetronicVehicleHref, valvetronicVehicles } from '@/lib/valvetronic-vehicles';
import styles from './valvetronic-vehicle-logos.module.css';

/** The homepage's vehicle artwork, prepared for the partner page's light surface. */
export function ValvetronicVehicleLogos() {
  return <ul className={styles.grid} aria-label="Shop Valvetronic Designs by vehicle brand">
    {valvetronicVehicles.map(vehicle => <li key={vehicle.mark}>
      <Link
        href={valvetronicVehicleHref(vehicle)}
        prefetch={false}
        className={styles.brand}
        data-mark={vehicle.mark}
        aria-label={`Shop Valvetronic Designs for ${vehicle.name}`}
      >
        <Image
          src={vehicle.lightLogo || vehicle.logo}
          alt=""
          width={200}
          height={80}
          sizes="(max-width: 700px) 40vw, 220px"
          className={`${styles.mark}${vehicle.lightMonochrome ? ` ${styles.monochrome}` : ''}`}
        />
      </Link>
    </li>)}
  </ul>;
}
