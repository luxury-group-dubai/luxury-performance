import Image from 'next/image';
import Link from 'next/link';
import type { NewsArticle } from '@/lib/news';
import styles from '@/app/news/news.module.css';

export function NewsCard({ article, wide = false, heading = 'h3' }: { article: NewsArticle; wide?: boolean; heading?: 'h2' | 'h3' }) {
  const Heading = heading;
  return <article className={styles.card}>
    <Link href={`/news/${article.slug}`}>
      <div className={styles.image}><Image src={article.cardImage} alt={article.imageAlt} fill sizes={wide ? "(max-width: 700px) calc(100vw - 48px), 86vw" : "(max-width: 700px) calc(100vw - 48px), 45vw"} /></div>
      <p className={styles.brand}>{article.brand}</p>
      <Heading>{article.title}</Heading>
      <p className={styles.summary}>{article.summary}</p>
    </Link>
  </article>;
}
