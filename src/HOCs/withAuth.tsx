'use client';

import React, { ComponentType, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { UsersCommonApiCheckPermissionParams } from '@/api/schemas';
import { useUsersCommonApiCheckPermission } from '@/api/users-common-api/users-common-api';
import Loader from '@/components/common/Loader';
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
    const { isAuthenticated, accessToken, initializeAuth } = useAuthStore();
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
      isError,
    } = useUsersCommonApiCheckPermission(params, {
      query: {
        enabled: !isInitializing && isAuthenticated && !!accessToken && !!dashboardType,
      },
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    useEffect(() => {
      if (isInitializing) {
        return;
      }

      if (!isAuthenticated || !accessToken) {
        toast.error('You need to be logged in to view this resource');
        router.replace('/auth/login');
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
      }
    }, [
      isInitializing,
      isAuthenticated,
      accessToken,
      isLoading,
      isError,
      permissionData,
      router,
      resourceId,
    ]);

    if (isInitializing || isLoading) {
      return <Loader type="dots" color="green" size="small" text="Loading..." />;
    }

    if (!isAuthenticated || !accessToken) {
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
