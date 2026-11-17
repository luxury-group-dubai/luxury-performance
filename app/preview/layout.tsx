import type { ReactNode } from 'react';
import styles from './preview-shell.module.css';

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return <><div className={styles.shell}>{children}</div></>;
}
