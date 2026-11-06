import 'server-only';
import { cache } from 'react';
import { shopifyAdmin } from './admin';
import { videoIds } from './videos';

const PRODUCT_VIDEOS_QUERY = `query ReadProductVideos($id: ID!) {
  product(id: $id) {
    videos: metafield(namespace: "custom", key: "valvetronic_youtube_videos") { value }
  }
}`;

export const getProductVideos = cache(async (productId: string): Promise<string[]> => {
  try {
    const { product } = await shopifyAdmin<{ product: { videos: { value: string } | null } | null }>(
      PRODUCT_VIDEOS_QUERY, { id: productId }, { next: { revalidate: 300 } },
    );
    return videoIds(product?.videos?.value);
  } catch {
    return [];
  }
});
