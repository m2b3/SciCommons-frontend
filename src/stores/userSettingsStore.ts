import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { UserConfigKey } from '@/api/schemas/userConfigKey';
import type { UserSettingSchema } from '@/api/schemas/userSettingSchema';
import type { UserSettingSchemaValue } from '@/api/schemas/userSettingSchemaValue';

interface UserSettingsState {
  settings: UserSettingSchema[];
  setSettings: (settings: UserSettingSchema[]) => void;
  updateSetting: (key: UserConfigKey, value: UserSettingSchemaValue) => void;
  getSetting: (key: UserConfigKey) => UserSettingSchemaValue | undefined;
  clearSettings: () => void;
}

// Helper to ensure settings is always an array
const ensureArray = (settings: unknown): UserSettingSchema[] => {
  if (Array.isArray(settings)) {
    return settings;
  }
  return [];
};

export const useUserSettingsStore = create<UserSettingsState>()(
  persist(
    (set, get) => ({
      settings: [],

      setSettings: (settings: UserSettingSchema[]) => {
        set({ settings: ensureArray(settings) });
      },

      updateSetting: (key: UserConfigKey, value: UserSettingSchemaValue) => {
        const currentSettings = ensureArray(get().settings);
        const updatedSettings = currentSettings.map((setting) =>
          setting.config_name === key ? { ...setting, value } : setting
        );
        set({ settings: updatedSettings });
      },

      getSetting: (key: UserConfigKey) => {
        const settings = ensureArray(get().settings);
        const setting = settings.find((s) => s.config_name === key);
        return setting?.value;
      },

      clearSettings: () => {
        set({ settings: [] });
      },
    }),
    {
      name: 'user-settings-storage',
      storage: createJSONStorage(() => localStorage),
      // Migrate old data format to new format
      migrate: (persistedState: unknown) => {
        const state = persistedState as { settings?: unknown };
        return {
          settings: ensureArray(state?.settings),
        };
      },
      version: 1,
    }
  )
);
