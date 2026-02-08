import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'auth_token';

const PROTECTED_ROUTE_PATTERNS: ReadonlyArray<RegExp> = [
  /^\/submitarticle\/?$/,
  /^\/createcommunity\/?$/,
  /^\/posts\/createpost\/?$/,
  /^\/mycontributions\/?$/,
  /^\/notifications\/?$/,
  /^\/article\/[^/]+\/(community-stats|submit|notifications|settings|official-stats)\/?$/,
  /^\/community\/[^/]+\/(articles\/[^/]+|dashboard|submissions|invite|roles|requests|settings)\/?$/,
];

export function isProtectedPathname(pathname: string): boolean {
  return PROTECTED_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (/\.[^/]+$/.test(pathname)) {
    return NextResponse.next();
  }

  if (!isProtectedPathname(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const expiresAtRaw = request.cookies.get('expiresAt')?.value;
  const expiresAt = expiresAtRaw ? Number.parseInt(expiresAtRaw, 10) : NaN;
  const hasValidExpiry = Number.isFinite(expiresAt) && Date.now() < expiresAt;

  if (accessToken && hasValidExpiry) {
    return NextResponse.next();
  }

  const redirectTarget = `${pathname}${search ?? ''}`;
  const loginUrl = new URL('/auth/login', request.url);
  loginUrl.searchParams.set('redirect', redirectTarget);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|api|.*\\..*).*)'],
};
