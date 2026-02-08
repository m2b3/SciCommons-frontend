import { isProtectedPathname, middleware } from '@/middleware';

jest.mock('next/server', () => ({
  NextResponse: {
    next: () => ({ status: 200, headers: new Headers() }),
    redirect: (url: URL) => ({
      status: 307,
      headers: new Headers({ location: url.toString() }),
    }),
  },
}));

describe('middleware route protection', () => {
  type MockRequest = {
    url: string;
    nextUrl: { pathname: string; search: string };
    cookies: { get: (key: string) => { value: string } | undefined };
    headers?: { get: (key: string) => string | null };
  };

  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_BACKEND_URL = '';
    jest.clearAllMocks();
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('marks protected routes correctly', () => {
    expect(isProtectedPathname('/submitarticle')).toBe(true);
    expect(isProtectedPathname('/community/abc/dashboard')).toBe(true);
    expect(isProtectedPathname('/article/test-slug/settings')).toBe(true);
    expect(isProtectedPathname('/')).toBe(false);
    expect(isProtectedPathname('/auth/login')).toBe(false);
  });

  it('redirects protected routes without auth cookie', async () => {
    const request: MockRequest = {
      url: 'https://www.scicommons.org/submitarticle',
      nextUrl: {
        pathname: '/submitarticle',
        search: '',
      },
      cookies: {
        get: jest.fn().mockReturnValue(undefined),
      },
    };

    const response = await middleware(request as never);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://www.scicommons.org/auth/login?redirect=%2Fsubmitarticle'
    );
  });

  it('allows protected routes with auth cookie', async () => {
    const cookieGet = jest.fn((key: string) => {
      if (key === 'auth_token') return { value: 'token' };
      if (key === 'expiresAt') return { value: String(Date.now() + 60_000) };
      return undefined;
    });

    const request: MockRequest = {
      url: 'https://www.scicommons.org/community/a/dashboard',
      nextUrl: {
        pathname: '/community/a/dashboard',
        search: '',
      },
      cookies: {
        get: cookieGet,
      },
    };

    const response = await middleware(request as never);
    expect(response.status).toBe(200);
  });

  it('redirects when auth cookie exists but expiry is invalid', async () => {
    const cookieGet = jest.fn((key: string) => {
      if (key === 'auth_token') return { value: 'token' };
      if (key === 'expiresAt') return { value: '0' };
      return undefined;
    });

    const request: MockRequest = {
      url: 'https://www.scicommons.org/community/a/dashboard',
      nextUrl: {
        pathname: '/community/a/dashboard',
        search: '',
      },
      cookies: {
        get: cookieGet,
      },
    };

    const response = await middleware(request as never);
    expect(response.status).toBe(307);
  });

  it('redirects when backend session validation fails', async () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = 'https://api.example.com';
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: false } as Response) as typeof fetch;

    const cookieGet = jest.fn((key: string) => {
      if (key === 'auth_token') return { value: 'token' };
      if (key === 'expiresAt') return { value: String(Date.now() + 60_000) };
      return undefined;
    });

    const request: MockRequest = {
      headers: { get: () => 'auth_token=token; expiresAt=123' },
      url: 'https://www.scicommons.org/community/a/dashboard',
      nextUrl: {
        pathname: '/community/a/dashboard',
        search: '',
      },
      cookies: {
        get: cookieGet,
      },
    };

    const response = await middleware(request as never);
    expect(response.status).toBe(307);
  });
});
