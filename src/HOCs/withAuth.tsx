'use client';

import React, { ComponentType, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { UsersCommonApiCheckPermissionParams } from '@/api/schemas';
import { useUsersCommonApiCheckPermission } from '@/api/users-common-api/users-common-api';
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
    const { isAuthenticated, accessToken } = useAuthStore();

    const resourceId = getResourceId ? getResourceId(props) : undefined;

    const params: UsersCommonApiCheckPermissionParams = {
      dashboard_type: dashboardType || undefined,
      resource_id: resourceId || undefined,
    };

    const {
      data: permissionData,
      isLoading,
      isError,
    } = useUsersCommonApiCheckPermission(params, {
      query: {
        enabled: isAuthenticated && !!accessToken && !!dashboardType,
      },
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

    useEffect(() => {
      if (!isAuthenticated || !accessToken) {
        // Todo: This isn't working as expected
        toast.error('You need to be logged in to view this resource');
        router.replace('/auth/login');
      } else if (isAuthenticated && !isLoading && !isError && permissionData !== undefined) {
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
    }, [isAuthenticated, accessToken, isLoading, isError, permissionData, router, resourceId]);

    if (!isAuthenticated || !accessToken) {
      return null;
    }

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (isError) {
      return <div>Error checking permissions</div>;
    }

    if (!permissionData?.data.has_permission) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  //   WithAuthComponent.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;

  return WithAuthComponent;
}

// function getDisplayName<P>(WrappedComponent: ComponentType<P>): string {
//   return WrappedComponent.displayName || WrappedComponent.name || 'Component';
// }
