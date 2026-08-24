import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface NewTagRetentionState {
  retainedUntilByKey: Record<string, number>;
  retainNewTag: (key: string, retainedUntil: number) => void;
  clearRetention: (key: string) => void;
  clearExpiredRetentions: (now?: number) => void;
  reset: () => void;
}

/* Added by Codex on 2026-07-08
   What: Persist short-lived NEW badge retention across route changes/remounts.
   Why: Discussion comments are marked read as soon as they enter view, but their NEW badge should
        remain visible for the configured grace period even if the user navigates away and back.
   How: Store only local display expiry timestamps keyed by entity; backend read sync remains unchanged. */
export const useNewTagRetentionStore = create<NewTagRetentionState>()(
  persist(
    (set) => ({
      retainedUntilByKey: {},

      retainNewTag: (key, retainedUntil) => {
        set((state) => ({
          retainedUntilByKey: {
            ...state.retainedUntilByKey,
            [key]: retainedUntil,
          },
        }));
      },

      clearRetention: (key) => {
        set((state) => {
          if (!Object.prototype.hasOwnProperty.call(state.retainedUntilByKey, key)) {
            return state;
          }

          const nextRetentions = { ...state.retainedUntilByKey };
          delete nextRetentions[key];
          return { retainedUntilByKey: nextRetentions };
        });
      },

      clearExpiredRetentions: (now = Date.now()) => {
        set((state) => {
          let changed = false;
          const nextRetentions = { ...state.retainedUntilByKey };

          Object.entries(nextRetentions).forEach(([key, retainedUntil]) => {
            if (retainedUntil <= now) {
              delete nextRetentions[key];
              changed = true;
            }
          });

          return changed ? { retainedUntilByKey: nextRetentions } : state;
        });
      },

      /* Added by Claude on 2026-08-23
         What: Drop every retained badge, including the localStorage projection.
         Why: These entries outlive the session that created them, so without a logout reset the
              next account signing in on the same browser inherits the previous user's NEW badges.
         How: Called from useAuthStore.logout alongside the readItems/subscriptionUnread resets;
              the persist middleware writes the emptied map straight back out. */
      reset: () => {
        set({ retainedUntilByKey: {} });
      },
    }),
    {
      name: 'new-tag-retention-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
