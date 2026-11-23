import { novitecStories } from './novitec-stories';

export type NewsArticle = {
  slug: string;
  brand: string;
  title: string;
  summary: string;
  description: string;
  image: string;
  cardImage: string;
  imageAlt: string;
  detail: string;
  sections: readonly { heading: string; text: string }[];
  gallery: readonly string[];
  link: string;
  linkLabel: string;
  source?: string;
  allocation?: boolean;
};

// Shared publishing collection: partner launches, LXP announcements and builds.
// Keep the existing editorial order; do not invent publication dates.
export const newsArticles: readonly NewsArticle[] = novitecStories.map(story => ({
  slug: `novitec-${story.marque.toLowerCase()}-${story.slug}`,
  brand: 'NOVITEC',
  title: `NOVITEC ${story.marque} ${story.model}`,
  summary: story.summary,
  description: story.description,
  image: story.image,
  cardImage: 'cardImage' in story ? story.cardImage : `/images/novitec-stories/${story.slug === 'urus-se' ? 'urus-se-card-angle' : `${story.slug}-card`}.jpg`,
  imageAlt: `${story.marque} ${story.model} by NOVITEC`,
  detail: story.detail,
  sections: story.sections,
  gallery: 'gallery' in story ? story.gallery : Array.from({ length: 8 }, (_, i) => `/images/novitec-stories/${story.slug}-original-${i + 1}.jpg`),
  link: story.link,
  linkLabel: 'linkLabel' in story ? story.linkLabel : story.slug === 'urus-se' ? 'Enquire about the Urus SE' : `Explore ${story.model} parts`,
  source: story.source,
  allocation: story.slug === '12cilindri' || story.slug === '12cilindri-n-largo',
}));

export function legacyNovitecNewsSlug(slug: string) {
  const story = novitecStories.find(item => item.slug === slug);
  return story ? `novitec-${story.marque.toLowerCase()}-${story.slug}` : undefined;
}
