import type { Metadata } from 'next';
import Link from 'next/link';
import { NewsCard } from '@/components/news-card';
import { newsArticles } from '@/lib/news';
import styles from './news.module.css';

type Props = { searchParams: Promise<{ brand?: string | string[] }> };
export const metadata: Metadata = {
  title: 'News — Partner Launches & LXP Updates',
  description: 'The latest partner launches, performance upgrades and updates from Luxury Performance in Dubai.',
  alternates: { canonical: '/news' },
  robots: { index: process.env.SHOP_SEO_LIVE === 'true', follow: true },
  openGraph: { title: 'News | Luxury Performance', description: 'Partner launches and updates from Luxury Performance in Dubai.', url: '/news' },
};
export default async function News({ searchParams }: Props) {
  const { brand } = await searchParams;
  const selected = typeof brand === 'string' ? brand.toLowerCase() : '';
  const brands = [...new Set(newsArticles.map(article => article.brand))];
  const active = brands.find(name => name.toLowerCase() === selected);
  const articles = active ? newsArticles.filter(article => article.brand === active) : newsArticles;
  return <div className={styles.page}>
    <header className={styles.intro}><p className={styles.eyebrow}>Luxury Performance</p><h1>News.</h1><p>Partner launches. New perspectives. The latest from LXP.</p></header>
    <nav className={styles.filters} aria-label="Filter news by brand">
      <Link href="/news" aria-current={!active ? 'page' : undefined}>All news</Link>
      {brands.map(name => <Link key={name} href={`/news?brand=${encodeURIComponent(name.toLowerCase())}`} aria-current={active === name ? 'page' : undefined}>{name}</Link>)}
    </nav>
    <section aria-label={active ? `${active} news` : 'All news'} className={styles.grid}>{articles.map((article, index) => <NewsCard heading="h2" wide={index === 0} key={article.slug} article={article} />)}</section>
  </div>;
}
