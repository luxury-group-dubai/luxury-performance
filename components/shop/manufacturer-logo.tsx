'use client';

import Image from 'next/image';
import { MenuLogo } from '@/components/shop-menu-cards';
import { SelectorLogo } from '@/components/selector-logo';
import { vehicleMenu } from '@/lib/shop-navigation';
import { valvetronicVehicles } from '@/lib/valvetronic-vehicles';
import styles from './manufacturer-logo.module.css';

const manufacturerLogos: Record<string, { logo: string; monochrome?: boolean }> = {
  audi: { logo: '/brand/navigation/audi.svg', monochrome: true },
  bmw: { logo: '/brand/navigation/wordmarks/bmw.svg' },
  alfa_romeo: { logo: '/brand/capristo-vehicles/alfa-romeo-logo.svg' },
  alpina: { logo: '/brand/capristo-vehicles/alpina-logo.svg' },
  bentley: { logo: '/brand/capristo-vehicles/bentley-logo.svg' },
  chevrolet: { logo: '/brand/capristo-vehicles/chevrolet-bowtie.svg', monochrome: true },
  jaguar: { logo: '/brand/capristo-vehicles/jaguar-logo.svg', monochrome: true },
  corvette: { logo: '/brand/valvetronic-vehicles/chevrolet-corvette-clean.png' },
};

/** Shared artwork for both shop entry paths and every brand's manufacturer selector. */
export function ManufacturerLogo({ make, name }: { make: string; name: string }) {
  const menu = manufacturerLogos[make] ? undefined : vehicleMenu.find(item => item.href.endsWith(`make=${make}`));
  if (menu) return <MenuLogo reveal item={menu} />;
  const artwork = manufacturerLogos[make] ?? valvetronicVehicles.find(item => item.make === make || item.mark.replaceAll('-', '_') === make);
  if (!artwork) return <span className={styles.name}>{name}</span>;
  return <SelectorLogo label={name}><Image className={`${styles.logo}${artwork.monochrome ? ` ${styles.monochrome}` : ''}`} data-make={make} src={artwork.logo} alt="" width={190} height={65} loading="eager" fetchPriority="high" /></SelectorLogo>;
}
