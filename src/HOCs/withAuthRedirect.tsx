'use client';

import React, { ComponentType, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import Loader, { LoaderType } from '@/components/common/Loader';
import { useAuthStore } from '@/stores/authStore';

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
    const { isAuthenticated, initializeAuth } = useAuthStore();
    const [isInitializing, setIsInitializing] = useState(true);

    const {
      requireAuth = false,
      loaderType = 'dots',
      loaderColor = 'green',
      loaderSize = 'small',
      loaderText = 'Loading...',
    } = options;

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

      if (requireAuth && !isAuthenticated) {
        toast.error('You need to be logged in to view this page');
        router.replace('/auth/login');
      } else if (!requireAuth && isAuthenticated) {
        router.back();
      }
    }, [isInitializing, isAuthenticated, router, requireAuth]);

    if (isInitializing) {
      return <Loader type={loaderType} color={loaderColor} size={loaderSize} text={loaderText} />;
    }

    if (requireAuth && !isAuthenticated) {
      return null;
    }

    if (!requireAuth && isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthRedirectComponent;
}
