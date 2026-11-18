import { permanentRedirect } from 'next/navigation';
import { legacyCollectionHref } from '@/lib/shop/legacy-collections';

type Props = { params: Promise<{ handle: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Collection({ params, searchParams }: Props) {
  const [{ handle }, query] = await Promise.all([params, searchParams]);
  permanentRedirect(legacyCollectionHref(handle, query));
}
