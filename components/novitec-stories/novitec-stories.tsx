import { ActionArrow } from '@/components/action-arrow';
import Image from 'next/image';
import Link from 'next/link';
import { novitecStories } from '@/lib/novitec-stories';
import styles from './novitec-stories.module.css';

export function NovitecStories() {
  return <section id="novitec-journal" className={styles.section} aria-labelledby="novitec-stories-title">
    <div className={styles.sectionHeading}><div><h2 id="novitec-stories-title">News</h2></div><p>Explore the latest from NOVITEC.</p></div>
    <div className={styles.grid}>{novitecStories.map(story => <article key={story.slug}>
      <Link href={`/partners/novitec/stories/${story.slug}`} className={`${styles.card} action-secondary`}>
        <span className={styles.cardImage}><Image src={`/images/novitec-stories/${story.slug === 'urus-se' ? 'urus-se-card-angle' : `${story.slug}-card`}.jpg`} alt={`${story.marque} ${story.model} by NOVITEC`} fill sizes="(max-width: 700px) 88vw, 33vw" /></span>
        <span className={styles.cardTitle}>{story.marque} {story.model}</span>
        <span className={styles.cardSummary}>{story.summary}</span><span className={styles.read}>Read story <ActionArrow size={14} /></span>
      </Link>
    </article>)}</div>
  </section>;
}
