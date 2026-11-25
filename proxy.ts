import { NextResponse, type NextRequest } from 'next/server';
import { techartRedirect } from './lib/shop/techart-routes';

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/partners/urban') {
    return NextResponse.redirect(new URL('/shop/in-stock?stock_group=urban', request.url), 308);
  }
  const target = techartRedirect(request.nextUrl.pathname, request.nextUrl.searchParams);
  if (target) return NextResponse.redirect(new URL(target, request.url), 308);
  return NextResponse.next();
}

export const config = { matcher: ['/shop', '/shop/techart/:path*', '/partners/techart', '/partners/urban'] };
