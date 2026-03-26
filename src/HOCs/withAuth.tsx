'use client';

import React, { ComponentType, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { UsersCommonApiCheckPermissionParams } from '@/api/schemas';
import { useUsersCommonApiCheckPermission } from '@/api/users-common-api/users-common-api';
import Loader from '@/components/common/Loader';
import { useAuthHeaders } from '@/hooks/useAuthHeaders';
import { showErrorToast } from '@/lib/toastHelpers';
import { useAuthStore } from '@/stores/authStore';

interface WithAuthProps {
  [key: string]: unknown;
}

type DashboardType = 'article' | 'community' | null;

export function withAuth<P extends WithAuthProps>(
  WrappedComponent: ComponentType<P>,
  dashboardType: DashboardType = null,
  getResourceId?: (props: P) => string | undefined
) {
  const WithAuthComponent: React.FC<P> = (props) => {
    const router = useRouter();
    const { isAuthenticated, initializeAuth } = useAuthStore();
    const authHeaders = useAuthHeaders();
    const [isInitializing, setIsInitializing] = useState(true);

    const resourceId = getResourceId ? getResourceId(props) : undefined;

    const params: UsersCommonApiCheckPermissionParams = {
      dashboard_type: dashboardType || undefined,
      resource_id: resourceId || undefined,
    };

    useEffect(() => {
      const initAuth = async () => {
        await initializeAuth();
        setIsInitializing(false);
      };
      initAuth();
    }, [initializeAuth]);

    const {
      data: permissionData,
      isLoading,
      error,
      isError,
    } = useUsersCommonApiCheckPermission(params, {
      query: {
        enabled: !isInitializing && isAuthenticated && !!dashboardType,
      },
      request: authHeaders,
    });

    useEffect(() => {
      if (isInitializing) {
        return;
      }

      if (!isAuthenticated) {
        /* Fixed by Codex on 2026-03-16
           Who: Codex
           What: Switched unauthenticated access handling to silent login replacement.
           Why: Avoid noisy toasts during automatic stale-session/login redirects.
           How: Replace route with login + redirect target instead of showing a toast. */
        if (typeof window !== 'undefined') {
          const redirectTarget = `${window.location.pathname}${window.location.search || ''}`;
          router.replace(`/auth/login?redirect=${encodeURIComponent(redirectTarget)}`);
        } else {
          router.replace('/auth/login');
        }
      } else if (!isLoading && !isError && permissionData !== undefined) {
        if (!permissionData.data.has_permission) {
          if (dashboardType === 'article') {
            router.replace(`/article/${resourceId}`);
          } else if (dashboardType === 'community') {
            router.replace(`/community/${resourceId}`);
          } else {
            router.replace('/');
          }
          toast.error('You do not have permission to view this resource');
        }
      } else if (isError) {
        showErrorToast(error);
      }
    }, [
      isInitializing,
      isAuthenticated,
      isLoading,
      isError,
      permissionData,
      router,
      resourceId,
      error,
    ]);

    if (isInitializing || isLoading) {
      return <Loader />;
    }

    if (!isAuthenticated) {
      return null;
    }

    if (isError) {
      return <div>Error checking permissions</div>;
    }

    if (!permissionData?.data.has_permission) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthComponent;
}

// function getDisplayName<P>(WrappedComponent: ComponentType<P>): string {
//   return WrappedComponent.displayName || WrappedComponent.name || 'Component';
// }
