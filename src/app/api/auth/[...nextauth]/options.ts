import { AuthOptions, Session, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';

const setRefreshTokenCookie = (cookieSettings: any, refreshToken: string) => {
  cookies().set('refreshToken', refreshToken, {
    httpOnly: cookieSettings.httpOnly || true,
    maxAge: cookieSettings.maxAge || 120,
    path: cookieSettings.path || '/',
    sameSite: cookieSettings.sameSite || 'lax',
    expires:
      new Date(Date.now() + cookieSettings.maxAge * 1000) || new Date(Date.now() + 120 * 1000),
    secure: cookieSettings.secure || false,
  });
};

const getRefreshTokenFromCookie = (): string | null => {
  const cookieStore = cookies();
  return cookieStore.get('refreshToken')?.value || null;
};

const extractRefreshTokenFromCookieHeader = (cookieHeader: string | null): string | null => {
  if (!cookieHeader) return null;
  const refreshTokenCookie = cookieHeader
    .split(',')
    .find((cookie) => cookie.includes('refreshToken'));
  return refreshTokenCookie ? refreshTokenCookie.split('=')[1] : null;
};

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        login: { label: 'Username or Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) {
          throw new Error('Please provide both login and password');
        }

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              login: credentials.login,
              password: credentials.password,
            }),
            credentials: 'include',
          });

          const data = await response.json();
          const cookieSettings = data.cookie;

          if (!response.ok) {
            throw new Error(data.message || 'Invalid credentials');
          }

          const refreshToken = extractRefreshTokenFromCookieHeader(
            response.headers.get('set-cookie')
          );
          if (refreshToken) {
            setRefreshTokenCookie(cookieSettings, refreshToken);
          } else {
            console.error('Refresh token cookie not found');
          }

          return { ...data };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User }) {
      if (user) {
        token.accessToken = user.token;
        token.expiresAt = user.expiresAt;
      }

      const refreshToken = getRefreshTokenFromCookie();
      if (token.expiresAt && Date.now() > token.expiresAt) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Cookie: `refreshToken=${refreshToken}`,
            },
          });

          if (!response.ok) throw new Error('Token expired');

          const data = await response.json();
          const cookieSettings = data.cookie;

          const newRefreshToken = extractRefreshTokenFromCookieHeader(
            response.headers.get('set-cookie')
          );
          if (newRefreshToken) {
            setRefreshTokenCookie(cookieSettings, newRefreshToken);
          } else {
            console.error('Refresh token cookie not found');
          }

          token.accessToken = data.token;
          token.expiresAt = data.expiresAt;
        } catch (error) {
          return { ...token, error: 'RefreshAccessTokenError' };
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
