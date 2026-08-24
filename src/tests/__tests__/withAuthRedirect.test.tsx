import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';

import { withAuthRedirect } from '@/HOCs/withAuthRedirect';

/* Added by Claude on 2026-08-22
   What: Coverage for the shared auth HOC's redirect decisions.
   Why: It gates every protected route, had no tests, and its use of useSearchParams broke
        `yarn build` on 10 routes - so the absence of that hook needs a guard too.
   How: Mock next/navigation and the auth store, and drive the query string through
        window.history so the HOC reads it the way it does in a browser. */

const mockReplace = jest.fn();
const mockUseSearchParams = jest.fn();
const mockGetPreviousPath = jest.fn();

const authState = {
  isAuthenticated: false,
  initializeAuth: jest.fn().mockResolvedValue(undefined),
};
let currentPathname = '/auth/login';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  usePathname: () => currentPathname,
  // Present but must never be called: calling it during render is what broke the build.
  useSearchParams: () => mockUseSearchParams(),
}));

jest.mock('@/stores/authStore', () => ({
  useAuthStore: () => authState,
}));

jest.mock('@/hooks/usePathTracker', () => ({
  usePathTracker: () => ({ getPreviousPath: mockGetPreviousPath }),
}));

jest.mock('@/components/common/Loader', () => {
  const MockLoader = () => <div>Loading</div>;
  MockLoader.displayName = 'MockLoader';
  return MockLoader;
});

const Protected = () => <div>ProtectedContent</div>;

const setQuery = (search: string) => {
  window.history.replaceState({}, '', `${currentPathname}${search}`);
};

beforeEach(() => {
  jest.clearAllMocks();
  currentPathname = '/auth/login';
  authState.isAuthenticated = false;
  authState.initializeAuth = jest.fn().mockResolvedValue(undefined);
  mockGetPreviousPath.mockReturnValue('/myprofile');
  setQuery('');
});

describe('withAuthRedirect on auth pages', () => {
  const renderWrapped = () => {
    const Wrapped = withAuthRedirect(Protected);
    return render(<Wrapped />);
  };

  it('sends an authenticated visitor to an allowlisted redirect target', async () => {
    authState.isAuthenticated = true;
    setQuery('?redirect=%2Fauth%2Fextension%3Fclient_id%3Dscicommons-zotero');

    renderWrapped();

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith('/auth/extension?client_id=scicommons-zotero')
    );
  });

  it('ignores a redirect that escapes to another origin', async () => {
    authState.isAuthenticated = true;
    setQuery('?redirect=%2F%5Cevil.example');

    renderWrapped();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/myprofile'));
    expect(mockReplace).not.toHaveBeenCalledWith('/\\evil.example');
  });

  it('falls back to the previous path when no redirect is supplied', async () => {
    authState.isAuthenticated = true;

    renderWrapped();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/myprofile'));
  });

  it('falls back to the site root when the previous path is itself an auth page', async () => {
    authState.isAuthenticated = true;
    mockGetPreviousPath.mockReturnValue('/auth/register');

    renderWrapped();

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/'));
  });

  it('leaves an unauthenticated visitor on the page', async () => {
    renderWrapped();

    await waitFor(() => expect(screen.getByText('ProtectedContent')).toBeInTheDocument());
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe('withAuthRedirect on protected pages', () => {
  const renderProtected = () => {
    const Wrapped = withAuthRedirect(Protected, { requireAuth: true });
    return render(<Wrapped />);
  };

  it('sends an unauthenticated visitor to login carrying the current path', async () => {
    currentPathname = '/settings';
    setQuery('');

    renderProtected();

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith('/auth/login?redirect=%2Fsettings')
    );
  });

  it('renders nothing rather than the protected content when unauthenticated', async () => {
    currentPathname = '/settings';
    setQuery('');

    renderProtected();

    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
    expect(screen.queryByText('ProtectedContent')).not.toBeInTheDocument();
  });

  it('renders the protected content for an authenticated visitor', async () => {
    currentPathname = '/settings';
    authState.isAuthenticated = true;
    setQuery('');

    renderProtected();

    await waitFor(() => expect(screen.getByText('ProtectedContent')).toBeInTheDocument());
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe('withAuthRedirect static-rendering guard', () => {
  /* This is the regression guard for the build failure. useSearchParams() in this HOC opted all
     16 wrapped routes out of static rendering, and `yarn build` failed export on 10 of them. */
  it('never calls useSearchParams during render', async () => {
    authState.isAuthenticated = true;
    setQuery('?redirect=%2Fmyprofile');

    const Wrapped = withAuthRedirect(Protected);
    render(<Wrapped />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/myprofile'));
    expect(mockUseSearchParams).not.toHaveBeenCalled();
  });
});
