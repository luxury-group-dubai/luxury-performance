import { permanentRedirect } from 'next/navigation';
import { previewSearchHref } from '../search-navigation';
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  permanentRedirect(previewSearchHref(Array.isArray(q) ? q[0] : q ?? ''));
}
