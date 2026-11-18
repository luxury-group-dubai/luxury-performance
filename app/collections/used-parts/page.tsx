import { permanentRedirect } from 'next/navigation';
import { stockBrowseHref } from '@/lib/shop/routes';

export default function UsedParts() {
  permanentRedirect(stockBrowseHref());
}
