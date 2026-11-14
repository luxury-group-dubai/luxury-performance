import { BrandArtwork } from '@/components/brand-artwork';
import styles from './capristo-image-placeholder.module.css';

export function CapristoImagePlaceholder({ brand = 'capristo' }: { brand?: 'capristo' | 'gintani' }) {
  return <div className={styles.placeholder} role="img" aria-label={`${brand.toUpperCase()} — product photo unavailable`}>
    <BrandArtwork brand={brand} labelled={false} />
  </div>;
}
