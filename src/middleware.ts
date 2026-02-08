import type { NextRequest } from 'next/server';

// import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');
  console.log(accessToken);

  if (!accessToken) {
    return Response.redirect(new URL('/auth/login?redirect=/submitarticle', request.url));
  }

  //   try {
  //     jwt.verify(token, process.env.JWT_SECRET);
  //     return NextResponse.next();
  //   } catch (error) {
  //     return NextResponse.redirect(new URL('/login', request.url));
  //   }
}

// Config to specify which routes the middleware applies to
export const config = {
  matcher: [],
};
