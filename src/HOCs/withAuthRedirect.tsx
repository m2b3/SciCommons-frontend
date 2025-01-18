import React, { ComponentType, useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { LoaderType } from '@/components/common/Loader';
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

interface WithAuthRedirectProps {
  [key: string]: unknown;
}

interface WithAuthRedirectOptions {
  requireAuth?: boolean;
  loaderType?: LoaderType;
  loaderColor?: string;
  loaderSize?: 'small' | 'medium' | 'large';
  loaderText?: string;
}

export function withAuthRedirect<P extends WithAuthRedirectProps>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthRedirectOptions = {}
) {
  const WithAuthRedirectComponent: React.FC<P> = (props) => {
    const router = useRouter();
    const pathname = usePathname();
    // const { isAuthenticated, initializeAuth, isTokenExpired, logout } = useAuthStore();
    const { data: session } = useSession();
    // const [isInitializing, setIsInitializing] = useState(true);
    const [showExpirationDialog, setShowExpirationDialog] = useState(false);
    const { getPreviousPath } = usePathTracker();

    const {
      requireAuth = false, // Set to false by default
      // loaderType = 'dots',
      // loaderColor = 'green',
      // loaderSize = 'small',
      // loaderText = 'Loading...',
    } = options;

    // useEffect(() => {
    //   const initAuth = async () => {
    //     await initializeAuth();
    //     setIsInitializing(false);
    //   };
    //   initAuth();
    // }, [initializeAuth]);

    useEffect(() => {
      // if (isInitializing) {
      //   return;
      // }

      const previousPath = getPreviousPath();
      const redirectPath = previousPath && !previousPath.startsWith('/auth') ? previousPath : '/';

      if (requireAuth) {
        if (!session) {
          toast.error('You need to be logged in to view this page');
          router.push('/auth/login');
        }
        // else if (isTokenExpired()) {
        //   setShowExpirationDialog(true);
        // }
      } else if (session && pathname && pathname.startsWith('/auth')) {
        // toast.info('You are already logged in');
        // Redirect authenticated users away from auth pages
        router.push(redirectPath);
      }
    }, [session, router, requireAuth, getPreviousPath, pathname]);

    const handleExpirationDialogClose = () => {
      setShowExpirationDialog(false);
      // logout();
      router.push('/auth/login');
    };

    // if (isInitializing) {
    //   return <Loader type={loaderType} color={loaderColor} size={loaderSize} text={loaderText} />;
    // }

    if (requireAuth && !session) {
      return null;
    }

    if (!requireAuth && session && pathname && pathname.startsWith('/auth')) {
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
              <Button onClick={handleExpirationDialogClose}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return WithAuthRedirectComponent;
}
