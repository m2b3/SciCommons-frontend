'use client';

import React, { useEffect } from 'react';

import { toast } from 'sonner';

import { UserConfigKey } from '@/api/schemas/userConfigKey';
import { Switch } from '@/components/ui/switch';
import { useUpdateUserSettings, useUserSettings } from '@/hooks/useUserSettings';
import { showErrorToast } from '@/lib/toastHelpers';
import { useUserSettingsStore } from '@/stores/userSettingsStore';

interface SettingConfig {
  key: UserConfigKey;
  label: string;
  description: string;
}

const SETTINGS_CONFIG: SettingConfig[] = [
  {
    key: UserConfigKey.enable_email_notifications,
    label: 'Email Notifications',
    description: 'Receive email notifications for important updates and activities',
  },
  {
    key: UserConfigKey.enable_sound_on_discussion_notification,
    label: 'Discussion Sound Notifications',
    description: 'Play a sound when you receive new discussion notifications',
  },
];

const SettingsPage: React.FC = () => {
  const settings = useUserSettingsStore((state) => state.settings);

  const { error, isLoading } = useUserSettings();
  const { mutate: updateSettings, isPending } = useUpdateUserSettings();

  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error]);

  const handleToggle = (key: UserConfigKey, currentValue: boolean) => {
    const newValue = !currentValue;

    updateSettings(
      {
        data: {
          settings: [{ config_name: key, value: newValue }],
        },
      },
      {
        onSuccess: () => {
          toast.success('Setting updated');
        },
        onError: (err) => {
          showErrorToast(err);
        },
      }
    );
  };

  const getSettingValue = (key: UserConfigKey): boolean => {
    const setting = settings.find((s) => s.config_name === key);
    return setting?.value === true;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-2xl font-bold">Settings</h1>
          <p className="mb-8 text-sm text-text-secondary">
            Manage your account preferences and notification settings
          </p>
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold">Settings</h1>
        <p className="mb-8 text-sm text-text-secondary">
          Manage your account preferences and notification settings
        </p>

        <div className="space-y-1">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Notifications</h2>

          {SETTINGS_CONFIG.map((config) => {
            const isEnabled = getSettingValue(config.key);

            return (
              <div
                key={config.key}
                className="flex items-center justify-between border-b border-common-minimal py-4 last:border-b-0"
              >
                <div className="flex-1 pr-4">
                  <label
                    htmlFor={config.key}
                    className="cursor-pointer text-sm font-medium text-text-primary"
                  >
                    {config.label}
                  </label>
                  <p className="mt-0.5 text-xs text-text-tertiary">{config.description}</p>
                </div>
                <Switch
                  id={config.key}
                  checked={isEnabled}
                  onCheckedChange={() => handleToggle(config.key, isEnabled)}
                  disabled={isPending}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
