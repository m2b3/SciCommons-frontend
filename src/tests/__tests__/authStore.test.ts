import Cookies from 'js-cookie';

import { useAuthStore } from '@/stores/authStore';

jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

const mockedCookies = Cookies as jest.Mocked<typeof Cookies>;
const mockedGet = mockedCookies.get as unknown as jest.Mock;
/* Fixed by Codex on 2026-02-09
   Problem: TypeScript disallows deleting non-optional globals (e.g., fetch) in test cleanup.
   Solution: Use a typed global helper with an optional fetch reference.
   Result: Cleanup can restore or clear fetch without delete operator errors. */
const getGlobalWithFetch = () => global as typeof globalThis & { fetch?: typeof globalThis.fetch };

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: false,
      accessToken: null,
      expiresAt: null,
      user: null,
    });
    jest.clearAllMocks();
  });

  it('initializes from valid cookies', async () => {
    mockedGet.mockReturnValueOnce('token-1');
    mockedGet.mockReturnValueOnce(String(Date.now() + 60_000));

    await useAuthStore.getState().initializeAuth();

    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe('token-1');
  });

  it('does not treat stale server-validation windows as hard expiry', () => {
    /* Fixed by Codex on 2026-02-27
       Who: Codex
       What: Added regression coverage for 5-minute revalidation windows.
       Why: `isTokenExpired()` must only represent hard token expiry.
       How: Set a fresh token, advance clock beyond 5 minutes (but below token expiry),
            and assert the session remains non-expired. */
    const nowSpy = jest.spyOn(Date, 'now');
    const now = 1_700_000_000_000;
    nowSpy.mockReturnValue(now);

    useAuthStore.getState().setAccessToken('token-4', {
      id: 4,
      username: 'test-user',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
    });

    nowSpy.mockReturnValue(now + 6 * 60 * 1000);
    expect(useAuthStore.getState().isTokenExpired()).toBe(false);

    nowSpy.mockRestore();
  });

  it('clears auth state when cookie expiry is invalid', async () => {
    /* Fixed by Codex on 2026-02-09
       Problem: initializeAuth now probes the server on invalid expiry, so the test needs a deterministic auth failure.
       Solution: Mock backend URL + fetch to return 401 so cookie clearing is exercised.
       Result: The test validates the intended logout path instead of falling into offline tolerance. */
    const originalBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    process.env.NEXT_PUBLIC_BACKEND_URL = 'http://example.com';
    const globalWithFetch = getGlobalWithFetch();
    const originalFetch = globalWithFetch.fetch;
    globalWithFetch.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);

    mockedGet.mockReturnValueOnce('token-2');
    mockedGet.mockReturnValueOnce('not-a-number');

    try {
      await useAuthStore.getState().initializeAuth();
    } finally {
      process.env.NEXT_PUBLIC_BACKEND_URL = originalBackendUrl;
      globalWithFetch.fetch = originalFetch;
    }

    expect(mockedCookies.remove).toHaveBeenCalledWith('auth_token', {
      sameSite: 'strict',
      secure: false,
    });
    expect(mockedCookies.remove).toHaveBeenCalledWith('expiresAt', {
      sameSite: 'strict',
      secure: false,
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('keeps session when expiry is invalid but server is unreachable', async () => {
    /* Fixed by Codex on 2026-02-09
       Problem: The offline-tolerance branch had no test coverage when expiry is invalid.
       Solution: Mock backend URL + fetch rejection to trigger the network-error path.
       Result: Auth remains active and cookies are not cleared. */
    const originalBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    process.env.NEXT_PUBLIC_BACKEND_URL = 'http://example.com';
    const globalWithFetch = getGlobalWithFetch();
    const originalFetch = globalWithFetch.fetch;
    globalWithFetch.fetch = jest.fn().mockRejectedValue(new Error('network down'));
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);

    mockedGet.mockReturnValueOnce('token-3');
    mockedGet.mockReturnValueOnce('not-a-number');

    try {
      await useAuthStore.getState().initializeAuth();
    } finally {
      process.env.NEXT_PUBLIC_BACKEND_URL = originalBackendUrl;
      globalWithFetch.fetch = originalFetch;
      nowSpy.mockRestore();
    }

    expect(mockedCookies.remove).not.toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe('token-3');
    expect(useAuthStore.getState().expiresAt).not.toBeNull();
  });
});
