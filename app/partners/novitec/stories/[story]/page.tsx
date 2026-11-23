import { notFound, permanentRedirect } from 'next/navigation';
import { legacyNovitecNewsSlug } from '@/lib/news';

export default async function LegacyNovitecStory({ params }: { params: Promise<{ story: string }> }) {
  const { story } = await params;
  const slug = legacyNovitecNewsSlug(story);
  if (!slug) notFound();
  permanentRedirect(`/news/${slug}`);
}
