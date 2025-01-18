import NextAuth, { AuthOptions } from 'next-auth';
import { NextRequest } from 'next/server';

import { authOptions } from './options';

interface RouteHandlerContext {
  params: { nextauth: string[] };
}

// const handler = NextAuth(authOptions as AuthOptions);
const handler = async (req: NextRequest, context: RouteHandlerContext) => {
  return NextAuth(req, context, authOptions as AuthOptions);
};
export { handler as GET, handler as POST };
