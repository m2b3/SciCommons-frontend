import 'next-auth';

declare module 'next-auth' {
  interface User {
    token: string;
    expiresAt: number;
  }

  interface Session {
    accessToken?: string;
    error?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    expiresAt?: number;
    error?: string;
  }
}
