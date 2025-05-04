import React, { ComponentType, useEffect, useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { toast } from 'sonner';

import Loader from '@/components/common/Loader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePathTracker } from '@/hooks/usePathTracker';
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
    const { isAuthenticated, initializeAuth, isTokenExpired, logout } = useAuthStore();
    const [isInitializing, setIsInitializing] = useState(true);
    const [showExpirationDialog, setShowExpirationDialog] = useState(false);
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
      const redirectPath = previousPath && !previousPath.startsWith('/auth') ? previousPath : '/';

      if (requireAuth) {
        if (!isAuthenticated) {
          toast.error('You need to be logged in to view this page');
          router.push('/auth/login');
        } else if (isTokenExpired()) {
          setShowExpirationDialog(true);
        }
      } else if (isAuthenticated && pathname && pathname.startsWith('/auth')) {
        // toast.info('You are already logged in');
        // Redirect authenticated users away from auth pages
        router.push(redirectPath);
      }
    }, [
      isInitializing,
      isAuthenticated,
      router,
      requireAuth,
      isTokenExpired,
      getPreviousPath,
      pathname,
    ]);

    const handleExpirationDialogClose = () => {
      setShowExpirationDialog(false);
      logout();
      router.push('/auth/login');
    };

    if (isInitializing) {
      return <Loader />;
    }

    if (requireAuth && !isAuthenticated) {
      return null;
    }

    if (!requireAuth && isAuthenticated && pathname && pathname.startsWith('/auth')) {
      return null;
    }

    return (
      <>
        <WrappedComponent {...props} />
        <Dialog open={showExpirationDialog} onOpenChange={handleExpirationDialogClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Session Expired</DialogTitle>
              <DialogDescription>
                Your session has expired. Please log in again to continue.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleExpirationDialogClose} className="text-white res-text-xs">
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return WithAuthRedirectComponent;
}
