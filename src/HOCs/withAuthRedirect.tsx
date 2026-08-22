import React, { ComponentType, useEffect, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import Loader from '@/components/common/Loader';
import { usePathTracker } from '@/hooks/usePathTracker';
import { isSafePostLoginRedirect } from '@/lib/integrationAuth';
import { useAuthStore } from '@/stores/authStore';

interface WithAuthRedirectProps {
  [key: string]: unknown;
}

interface WithAuthRedirectOptions {
  requireAuth?: boolean;
}

export function withAuthRedirect<P extends WithAuthRedirectProps>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthRedirectOptions = {}
) {
  const WithAuthRedirectComponent: React.FC<P> = (props) => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, initializeAuth } = useAuthStore();
    const [isInitializing, setIsInitializing] = useState(true);
    const { getPreviousPath } = usePathTracker();

    const { requireAuth = false } = options;

    useEffect(() => {
      const initAuth = async () => {
        await initializeAuth();
        setIsInitializing(false);
      };
      initAuth();
    }, [initializeAuth]);

    useEffect(() => {
      if (isInitializing) {
        return;
      }

      const previousPath = getPreviousPath();
      /* Fixed by Claude on 2026-08-22
         What: Read the redirect param from location instead of useSearchParams().
         Why: This HOC wraps 16 routes and returns <Loader /> while initializing, so the hook ran
              during prerender on every one of them and Next bailed out of static rendering -
              `yarn build` failed export on 10 routes. The value is only used inside this effect,
              so the render-time hook was never needed.
         How: Parse window.location.search here; effects are client-only, so window is safe. */
      const requestedRedirect = new URLSearchParams(window.location.search).get('redirect');
      const redirectPath = isSafePostLoginRedirect(requestedRedirect)
        ? requestedRedirect
        : previousPath && !previousPath.startsWith('/auth')
          ? previousPath
          : '/';

      if (requireAuth) {
        if (!isAuthenticated) {
          /* Fixed by Codex on 2026-03-16
             Who: Codex
             What: Switched protected-route unauth redirects to a silent login replace.
             Why: Reduce stale-session UX noise (flash/toast) and keep navigation deterministic.
             How: Replace route with login + redirect target; avoid toasts/dialogs for automatic session handling. */
          const redirectTarget = pathname || '/';
          router.replace(`/auth/login?redirect=${encodeURIComponent(redirectTarget)}`);
        }
      } else if (isAuthenticated && pathname && pathname.startsWith('/auth')) {
        // toast.info('You are already logged in');
        // Redirect authenticated users away from auth pages
        router.replace(redirectPath);
      }
    }, [isInitializing, isAuthenticated, router, requireAuth, getPreviousPath, pathname]);

    if (isInitializing) {
      return <Loader />;
    }

    if (requireAuth && !isAuthenticated) {
      return null;
    }

    if (!requireAuth && isAuthenticated && pathname && pathname.startsWith('/auth')) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthRedirectComponent;
}
