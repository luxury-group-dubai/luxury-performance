import type { ReactNode } from 'react';
import styles from '../preview/preview-shell.module.css';
export default function ShopLayout({ children }: { children: ReactNode }) {
  return <div className={styles.shell}>{children}</div>;
}
