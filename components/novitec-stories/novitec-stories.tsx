import Link from 'next/link';
import { NewsCard } from '@/components/news-card';
import { newsArticles } from '@/lib/news';
import styles from './novitec-stories.module.css';

export function NovitecStories() {
  const articles = newsArticles.filter(article => article.brand === 'NOVITEC').slice(0, 3);
  return <section id="novitec-journal" className={styles.section} aria-labelledby="novitec-stories-title">
    <div className={styles.sectionHeading}><h2 id="novitec-stories-title">Latest from NOVITEC</h2><Link href="/news?brand=novitec">All NOVITEC news</Link></div>
    <div className={styles.newsGrid}>{articles.map(article => <NewsCard key={article.slug} article={article} />)}</div>
  </section>;
}
