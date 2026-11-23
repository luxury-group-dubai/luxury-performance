import { AllocationBanner } from '@/components/nlargo/allocation-banner';
import { ActionArrow } from '@/components/action-arrow';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { newsArticles } from '@/lib/news';
import styles from './story.module.css';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return newsArticles.map(story => ({ slug: story.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const story = newsArticles.find(item => item.slug === slug);
  if (!story) return {};
  return { title: story.title, description: story.description, alternates: { canonical: `/news/${story.slug}` }, robots: { index: process.env.SHOP_SEO_LIVE === 'true', follow: true }, openGraph: { title: story.title, description: story.description, type: 'article', url: `/news/${story.slug}`, images: [{ url: story.image, alt: story.imageAlt }] } };
}
export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params; const story = newsArticles.find(item => item.slug === slug);
  if (!story) notFound();
  const gallery = story.gallery;
  return <article className={styles.page}>
    <div className={styles.intro}><Link className={styles.back} href="/news"><ArrowLeft size={16} /> All news</Link><p className={styles.eyebrow}>{story.brand} / News</p><h1>{story.title}</h1></div>
    <div className={styles.hero}><Image src={story.image} alt={story.imageAlt} fill priority sizes="100vw" quality={90} /></div>
    {story.allocation && <AllocationBanner />}
    <section className={styles.detail}><div><span className={styles.eyebrow}>The details</span><h2>{story.title}</h2></div><div className={styles.prose}><p>{story.detail}</p>{story.sections.map(section => <section key={section.heading}><h3>{section.heading}</h3><p>{section.text}</p></section>)}<Link href={story.link} className={`${styles.link} action-secondary`}>{story.linkLabel} <ActionArrow size={18} /></Link>{story.source && <a href={story.source} className={styles.source} target="_blank" rel="noopener noreferrer">Source: {story.brand} <ActionArrow size={14} /></a>}</div></section>
    {gallery.length > 0 && <section className={styles.gallery} aria-labelledby="gallery-title"><span className={styles.eyebrow}>{story.brand}</span><h2 id="gallery-title">Gallery</h2><div className={styles.galleryGrid}>{gallery.map((src, index) => <div className={styles.galleryImage} key={src}><Image src={src} alt={`${story.imageAlt}, view ${index + 1}`} fill sizes={index === 0 || index === gallery.length - 1 ? '100vw' : '50vw'} quality={90} /></div>)}</div></section>}
  </article>;
}
