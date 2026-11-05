import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { valvetronicVehicles, valvetronicVehicleHref } from '@/lib/valvetronic-vehicles';
import styles from './valvetronic-vehicles.module.css';
import { ValvetronicFeatureFilm } from './valvetronic-feature-film';
import { ValvetronicExhaustCinema } from './valvetronic-exhaust-cinema';


export function ValvetronicVehicles() {
  return <section id="valvetronic" className={styles.section} aria-labelledby="valvetronic-vehicles-title">
    <div className={styles.inner}>
      <ValvetronicExhaustCinema />
      <div className={styles.filmCover}>
        <div className={styles.vehiclesPanel}>
          <header className={styles.heading}>
            <div>
              <h2 id="valvetronic-vehicles-title"><Image src="/brand/valvetronic.png" alt="Valvetronic Designs" width={1200} height={304} unoptimized /></h2>
              <p>Choose your vehicle brand. Find your sound.</p>
            </div>
            <Link href="/shop?brand=valvetronic" className={styles.all}>Shop all Valvetronic <ArrowUpRight size={17} strokeWidth={1.5} aria-hidden="true" /></Link>
          </header>
          <ul className={styles.grid} aria-label="Shop Valvetronic by vehicle brand">
            {valvetronicVehicles.map(vehicle => {
              return <li key={vehicle.mark}>
                <Link href={valvetronicVehicleHref(vehicle)} prefetch={false} className={styles.brand} data-mark={vehicle.mark} aria-label={`Shop Valvetronic Designs for ${vehicle.name}`}>
                  <Image src={vehicle.logo} alt="" width={200} height={64} className={`${styles.mark} ${vehicle.monochrome ? styles.monochrome : ''}`} />
                </Link>
              </li>;
            })}
          </ul>
        </div>
        <ValvetronicFeatureFilm />
      </div>
    </div>
  </section>;
}
