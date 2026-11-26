import styles from './page-heading.module.css';

export function PageHeading({ title, description }: { title: string; description: string }) {
  return <header className={styles.heading}>
    <h1>{title}</h1>
    <p>{description}</p>
  </header>;
}
