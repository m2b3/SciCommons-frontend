import React from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import IntegrationAuthorizePage from '@/components/auth/IntegrationAuthorizePage';

/* Added by Claude on 2026-08-22
   What: Coverage for the integration consent screen.
   Why: The review of PR #363 flagged this flow as security-sensitive and untested. Its whole
        point over #362 is that nothing is authorized until a person clicks Allow, so that has
        to be pinned down, along with the parameter diagnostics #362 had and this rewrite lost.
   How: Mock next/navigation, the auth store, and fetch; drive the query string with a mocked
        useSearchParams so each case controls the authorization request precisely. */

const mockReplace = jest.fn();
const mockPush = jest.fn();
let searchParams = new URLSearchParams();

const authState = {
  accessToken: 'token-1',
  initializeAuth: jest.fn().mockResolvedValue(undefined),
  isAuthenticated: true,
  user: { username: 'alice', email: 'alice@example.com' },
};

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  usePathname: () => '/auth/integration',
  useSearchParams: () => searchParams,
}));

jest.mock('@/stores/authStore', () => ({
  useAuthStore: () => authState,
}));

const VALID_QUERY = {
  client_id: 'scicommons-zotero',
  redirect_uri: 'https://zotero.example/callback',
  state: 'state-123',
  code_challenge: 'challenge-abc',
};

const setQuery = (overrides: Record<string, string | null> = {}) => {
  const merged: Record<string, string> = { ...VALID_QUERY };
  for (const [key, value] of Object.entries(overrides)) {
    if (value === null) delete merged[key];
    else merged[key] = value;
  }
  searchParams = new URLSearchParams(merged);
};

const mockFetch = jest.fn();
const assign = jest.fn();

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    value: { assign, href: 'https://app.test/auth/integration' },
    writable: true,
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = mockFetch as unknown as typeof fetch;
  process.env.NEXT_PUBLIC_BACKEND_URL = 'https://api.test';
  authState.isAuthenticated = true;
  authState.initializeAuth = jest.fn().mockResolvedValue(undefined);
  setQuery();
});

const okResponse = (body: Record<string, unknown>) => ({
  ok: true,
  status: 200,
  json: jest.fn().mockResolvedValue(body),
});

describe('IntegrationAuthorizePage consent gate', () => {
  it('authorizes nothing until Allow Access is clicked', async () => {
    render(<IntegrationAuthorizePage />);

    await waitFor(() => expect(screen.getByText(/Allow Access/i)).toBeInTheDocument());
    // This is the whole difference from #362, which authorized on page load.
    expect(mockFetch).not.toHaveBeenCalled();
    expect(assign).not.toHaveBeenCalled();
  });

  it('names the integration and the destination before asking for consent', async () => {
    render(<IntegrationAuthorizePage />);

    await waitFor(() => expect(screen.getByText(/Connect SciCommons Zotero/i)).toBeInTheDocument());
    expect(screen.getByText('https://zotero.example/callback')).toBeInTheDocument();
    expect(screen.getByText(/Signed in as alice/i)).toBeInTheDocument();
  });

  it('posts the PKCE request to the shared authorize endpoint on approval', async () => {
    mockFetch.mockResolvedValue(
      okResponse({
        code: 'auth-code',
        state: 'state-123',
        redirect_uri: 'https://zotero.example/callback',
      })
    );

    render(<IntegrationAuthorizePage />);
    await waitFor(() => expect(screen.getByText(/Allow Access/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Allow Access/i));

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.test/api/integrations/auth/authorize');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer token-1');
    expect(JSON.parse(init.body)).toEqual({
      client_id: 'scicommons-zotero',
      redirect_uri: 'https://zotero.example/callback',
      state: 'state-123',
      code_challenge: 'challenge-abc',
      code_challenge_method: 'S256',
    });
  });

  it('hands the code and state back to the integration on success', async () => {
    mockFetch.mockResolvedValue(
      okResponse({
        code: 'auth-code',
        state: 'state-123',
        redirect_uri: 'https://zotero.example/callback',
      })
    );

    render(<IntegrationAuthorizePage />);
    await waitFor(() => expect(screen.getByText(/Allow Access/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Allow Access/i));

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith(
        'https://zotero.example/callback?code=auth-code&state=state-123'
      )
    );
  });

  it('omits state from the callback when the request carried none', async () => {
    setQuery({ state: null });
    mockFetch.mockResolvedValue(
      okResponse({ code: 'auth-code', redirect_uri: 'https://zotero.example/callback' })
    );

    render(<IntegrationAuthorizePage />);
    await waitFor(() => expect(screen.getByText(/Allow Access/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Allow Access/i));

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith('https://zotero.example/callback?code=auth-code')
    );
  });

  it('surfaces the backend message when authorization is refused', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ message: 'Unknown integration client.' }),
    });

    render(<IntegrationAuthorizePage />);
    await waitFor(() => expect(screen.getByText(/Allow Access/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Allow Access/i));

    await waitFor(() =>
      expect(screen.getByText('Unknown integration client.')).toBeInTheDocument()
    );
    expect(assign).not.toHaveBeenCalled();
  });

  it('reports a missing backend URL instead of calling an empty host', async () => {
    process.env.NEXT_PUBLIC_BACKEND_URL = '';

    render(<IntegrationAuthorizePage />);
    await waitFor(() => expect(screen.getByText(/Allow Access/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Allow Access/i));

    await waitFor(() =>
      expect(screen.getByText('NEXT_PUBLIC_BACKEND_URL is not configured.')).toBeInTheDocument()
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('IntegrationAuthorizePage request validation', () => {
  /* #362's page named the absent parameter up front; this rewrite had dropped that. */
  it.each([
    ['client_id', 'client_id'],
    ['redirect_uri', 'redirect_uri'],
    ['code_challenge', 'code_challenge'],
  ])('names %s when it is absent', async (_label, param) => {
    setQuery({ [param]: null });

    render(<IntegrationAuthorizePage />);

    await waitFor(() =>
      expect(
        screen.getByText(`Missing required authorization parameter: ${param}.`)
      ).toBeInTheDocument()
    );
    expect(mockFetch).not.toHaveBeenCalled();
    expect(screen.queryByText(/Allow Access/i)).not.toBeInTheDocument();
  });

  it('treats state as optional, matching the backend schema', async () => {
    setQuery({ state: null });

    render(<IntegrationAuthorizePage />);

    await waitFor(() => expect(screen.getByText(/Allow Access/i)).toBeInTheDocument());
    expect(screen.queryByText(/Missing required authorization parameter/i)).not.toBeInTheDocument();
  });

  it('does not bounce a malformed request through login', async () => {
    authState.isAuthenticated = false;
    setQuery({ client_id: null });

    render(<IntegrationAuthorizePage />);

    await waitFor(() =>
      expect(
        screen.getByText('Missing required authorization parameter: client_id.')
      ).toBeInTheDocument()
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe('IntegrationAuthorizePage authentication', () => {
  it('sends an unauthenticated visitor to login, preserving the request', async () => {
    authState.isAuthenticated = false;

    render(<IntegrationAuthorizePage />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledTimes(1));
    const target = decodeURIComponent(mockReplace.mock.calls[0][0].split('redirect=')[1]);
    expect(target.startsWith('/auth/integration?')).toBe(true);
    expect(target).toContain('client_id=scicommons-zotero');
    expect(target).toContain('code_challenge=challenge-abc');
  });
});
