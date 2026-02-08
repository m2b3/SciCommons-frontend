import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'auth_token';
const SESSION_VALIDATION_TTL_MS = 30_000;
const sessionValidationCache = new Map<string, { isValid: boolean; expiresAt: number }>();

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

async function hasServerValidatedSession(request: NextRequest): Promise<boolean> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
  if (!backendUrl) {
    return process.env.NODE_ENV !== 'production';
  }

  const accessToken = request.cookies.get(AUTH_COOKIE_NAME)?.value || '';
  const cacheKey = `${backendUrl}|${accessToken}`;
  const now = Date.now();
  const cached = sessionValidationCache.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    return cached.isValid;
  }

  try {
    const response = await fetch(`${backendUrl}/api/users/me`, {
      method: 'GET',
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
      cache: 'no-store',
    });
    sessionValidationCache.set(cacheKey, {
      isValid: response.ok,
      expiresAt: now + SESSION_VALIDATION_TTL_MS,
    });
    return response.ok;
  } catch {
    return cached?.isValid ?? false;
  }
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

  if (accessToken && hasValidExpiry && (await hasServerValidatedSession(request))) {
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
