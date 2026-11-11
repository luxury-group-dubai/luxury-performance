import { permanentRedirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  const query = new URLSearchParams(request.nextUrl.searchParams);
  query.set('stock', 'in-stock');
  permanentRedirect('/shop?' + query.toString());
}
