import { AllocationBanner } from '@/components/nlargo/allocation-banner';
import { ActionArrow } from '@/components/action-arrow';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { novitecStories } from '@/lib/novitec-stories';
import styles from './story.module.css';

type Props = { params: Promise<{ story: string }> };
export function generateStaticParams() { return novitecStories.map(story => ({ story: story.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { story: slug } = await params; const story = novitecStories.find(item => item.slug === slug);
  if (!story) return {};
  return { title: `NOVITEC ${story.marque} ${story.model}`, description: story.description, alternates: { canonical: `/partners/novitec/stories/${story.slug}` }, robots: { index: process.env.SHOP_SEO_LIVE === 'true', follow: true }, openGraph: { images: [{ url: story.image, alt: `${story.marque} ${story.model} by NOVITEC` }] } };
}
export default async function NovitecStory({ params }: Props) {
  const { story: slug } = await params; const story = novitecStories.find(item => item.slug === slug);
  if (!story) notFound();
  const gallery = 'gallery' in story ? story.gallery : [1, 2, 3, 4, 5, 6, 7, 8].map(number => `/images/novitec-stories/${story.slug}-original-${number}.jpg`);
  return <main className={styles.page}>
    <div className={styles.intro}><Link className={styles.back} href="/partners/novitec#novitec-journal"><ArrowLeft size={16} /> NOVITEC journal</Link><p className={styles.eyebrow}>NOVITEC / {story.marque}</p><h1>{story.model}</h1></div>
    <div className={styles.hero}><Image src={story.image} alt={`${story.marque} ${story.model} by NOVITEC`} fill priority sizes="100vw" quality={90} /></div>
    {(story.slug === '12cilindri' || story.slug === '12cilindri-n-largo') && <AllocationBanner />}
    <section className={styles.detail}><div><span className={styles.eyebrow}>The story</span><h2>NOVITEC {story.marque} {story.model}</h2></div><div className={styles.prose}><p>{story.detail}</p>{story.sections.map(section => <section key={section.heading}><h3>{section.heading}</h3><p>{section.text}</p></section>)}<Link href={story.link} className={`${styles.link} action-secondary`}>{'linkLabel' in story ? story.linkLabel : story.slug === 'urus-se' ? 'Enquire about the Urus SE' : `Explore ${story.model} parts`} <ActionArrow size={18} /></Link><a href={story.source} className={styles.source} target="_blank" rel="noopener noreferrer">Based on NOVITEC’s original story <ActionArrow size={14} /></a></div></section>
    {gallery.length > 0 && <section className={styles.gallery} aria-labelledby="gallery-title"><span className={styles.eyebrow}>NOVITEC / {story.model}</span><h2 id="gallery-title">Gallery</h2><div className={styles.galleryGrid}>{gallery.map((src, index) => <div className={styles.galleryImage} key={src}><Image src={src} alt={`${story.marque} ${story.model} by NOVITEC, view ${index + 1}`} fill sizes={index === 0 || index === gallery.length - 1 ? '100vw' : '50vw'} quality={90} /></div>)}</div></section>}
  </main>;
}
