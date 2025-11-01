import { useQueryClient } from '@tanstack/react-query';

import { getUsersApiGetMeQueryKey, useUsersApiGetMe } from '@/api/users/users';
import { FIFTEEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { useAuthStore } from '@/stores/authStore';

/**
 * Custom hook to fetch and cache current user data
 * Data is cached for 15 minutes (staleTime and gcTime)
 * Shared across all components that need user data
 */
export const useCurrentUser = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  const query = useUsersApiGetMe({
    query: {
      enabled: !!accessToken,
      // Cache data for 15 minutes before considering it stale
      staleTime: FIFTEEN_MINUTES_IN_MS, // 15 minutes
      // Keep unused data in cache for 15 minutes before garbage collection
      gcTime: FIFTEEN_MINUTES_IN_MS, // 15 minutes (formerly cacheTime)
    },
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  return query;
};

/**
 * Hook to invalidate/refetch current user data
 * Use this after updating user profile
 */
export const useInvalidateCurrentUser = () => {
  const queryClient = useQueryClient();

  const invalidateUser = () => {
    queryClient.invalidateQueries({
      queryKey: getUsersApiGetMeQueryKey(),
    });
  };

  return { invalidateUser };
};
