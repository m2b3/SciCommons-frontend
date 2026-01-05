import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { UserConfigKey } from '@/api/schemas/userConfigKey';
import type { UserSettingsResponseSchema } from '@/api/schemas/userSettingsResponseSchema';
import {
  getUsersApiGetUserSettingsQueryKey,
  useUsersApiGetUserSettings,
  useUsersApiUpdateUserSettings,
} from '@/api/users/users';
import { FIFTEEN_MINUTES_IN_MS } from '@/constants/common.constants';
import { useAuthStore } from '@/stores/authStore';
import { useUserSettingsStore } from '@/stores/userSettingsStore';

/**
 * Custom hook to fetch and cache user settings
 * Data is cached for 15 minutes (staleTime and gcTime)
 * Syncs with the global settings store
 */
export const useUserSettings = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setSettings = useUserSettingsStore((state) => state.setSettings);

  const query = useUsersApiGetUserSettings({
    query: {
      enabled: !!accessToken,
      staleTime: FIFTEEN_MINUTES_IN_MS,
      gcTime: FIFTEEN_MINUTES_IN_MS,
    },
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  // Sync fetched settings with the store
  useEffect(() => {
    if (query.data?.data?.settings) {
      setSettings(query.data.data.settings);
    }
  }, [query.data, setSettings]);

  return query;
};

/**
 * Hook to update user settings with optimistic updates
 */
export const useUpdateUserSettings = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const updateSettingInStore = useUserSettingsStore((state) => state.updateSetting);
  const setSettings = useUserSettingsStore((state) => state.setSettings);

  return useUsersApiUpdateUserSettings({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    mutation: {
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: getUsersApiGetUserSettingsQueryKey(),
        });

        // Snapshot the previous value
        const previousSettings = queryClient.getQueryData<{ data: UserSettingsResponseSchema }>(
          getUsersApiGetUserSettingsQueryKey()
        );

        // Optimistically update the store
        variables.data.settings.forEach((setting) => {
          updateSettingInStore(setting.config_name, setting.value);
        });

        return { previousSettings };
      },
      onError: (_error, _variables, context) => {
        // Rollback on error - restore previous settings in store
        if (context?.previousSettings?.data?.settings) {
          setSettings(context.previousSettings.data.settings);
        }
      },
      onSettled: () => {
        // Always refetch after error or success to sync with server
        queryClient.invalidateQueries({
          queryKey: getUsersApiGetUserSettingsQueryKey(),
        });
      },
    },
  });
};

/**
 * Hook to invalidate/refetch user settings
 */
export const useInvalidateUserSettings = () => {
  const queryClient = useQueryClient();

  const invalidateSettings = () => {
    queryClient.invalidateQueries({
      queryKey: getUsersApiGetUserSettingsQueryKey(),
    });
  };

  return { invalidateSettings };
};

/**
 * Helper function to check if sound notifications are enabled
 * Can be used outside of React components
 */
export const isSoundOnDiscussionNotificationEnabled = (): boolean => {
  const value = useUserSettingsStore
    .getState()
    .getSetting(UserConfigKey.enable_sound_on_discussion_notification);
  return value === true;
};

/**
 * Helper function to check if email notifications are enabled
 */
export const isEmailNotificationsEnabled = (): boolean => {
  const value = useUserSettingsStore
    .getState()
    .getSetting(UserConfigKey.enable_email_notifications);
  return value === true;
};
