import Cookies from 'js-cookie';

import { useAuthStore } from '@/stores/authStore';
import { useNewTagRetentionStore } from '@/stores/newTagRetentionStore';

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
    useNewTagRetentionStore.getState().reset();
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
    useNewTagRetentionStore.getState().retainNewTag('discussion-comment:88', Date.now() + 60_000);

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
    expect(useNewTagRetentionStore.getState().retainedUntilByKey).toEqual({});
  });

  it('clears retained badges when a different account replaces the active account', () => {
    /* Fixed by Codex on 2026-08-24
       Who: Codex
       What: Added regression coverage for direct account replacement without an explicit logout.
       Why: A second user could otherwise inherit the first user's persisted NEW badges.
       How: Seed a prior authenticated identity and retained badge, set a token for another user,
            and require the account-scoped store to be empty afterward. */
    useAuthStore.setState({
      isAuthenticated: true,
      accessToken: 'old-token',
      expiresAt: Date.now() + 60_000,
      user: {
        id: 1,
        username: 'first-user',
        email: 'first@example.com',
        first_name: 'First',
        last_name: 'User',
      },
    });
    useNewTagRetentionStore.getState().retainNewTag('discussion-comment:99', Date.now() + 60_000);

    useAuthStore.getState().setAccessToken('new-token', {
      id: 2,
      username: 'second-user',
      email: 'second@example.com',
      first_name: 'Second',
      last_name: 'User',
    });

    expect(useAuthStore.getState().user?.id).toBe(2);
    expect(useNewTagRetentionStore.getState().retainedUntilByKey).toEqual({});
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
