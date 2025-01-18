import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Public paths that don't require authentication
  const publicPaths = new Set([
    '/auth/login',
    '/auth/signup',
    '/auth/activate',
    '/auth/forgotpassword',
  ]);
  const isPublicPath = publicPaths.has(request.nextUrl.pathname);

  // Protected routes check
  if (!token && !isPublicPath) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Prevent authenticated users from accessing auth pages
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes
    '/profile',
    '/community',
    '/community/articles',
    '/createcommunity',
    '/article/:path*',
    '/submitarticle',
    '/posts/createpost',
    '/mycontributions',
    // Auth routes
    '/auth/:path*',
  ],
};
