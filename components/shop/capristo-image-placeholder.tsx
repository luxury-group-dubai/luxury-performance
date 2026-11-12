/* eslint-disable @next/next/no-img-element */
import styles from './capristo-image-placeholder.module.css';

export function CapristoImagePlaceholder() {
  return <div className={styles.placeholder} role="img" aria-label="CAPRISTO — product photo unavailable">
    <img src="/brand/capristo.svg" alt="" width={537} height={116} />
  </div>;
}
