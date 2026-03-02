import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface NotificationActivityState {
  ownerUserId: number | null;
  lastBellSeenAt: number;
  lastSystemTabSeenAt: number;
  lastMentionsTabSeenAt: number;
  setOwnerIfNeeded: (userId: number) => void;
  markBellSeen: (userId: number) => void;
  markSystemTabSeen: (userId: number) => void;
  markMentionsTabSeen: (userId: number) => void;
  reset: () => void;
}

const EMPTY_ACTIVITY_STATE = {
  ownerUserId: null,
  lastBellSeenAt: 0,
  lastSystemTabSeenAt: 0,
  lastMentionsTabSeenAt: 0,
} as const;

/* Fixed by Codex on 2026-02-26
   Who: Codex
   What: Seed per-owner notification seen timestamps with "now" instead of epoch.
   Why: Initializing at `0` treats all historical system notifications as new and can incorrectly force the System tab when bell activity is mention-only.
   How: Capture one creation timestamp and apply it to bell/system/mentions seen markers for fresh owner state. */
const createStateForOwner = (userId: number) => {
  const createdAt = Date.now();
  return {
    ownerUserId: userId,
    lastBellSeenAt: createdAt,
    lastSystemTabSeenAt: createdAt,
    lastMentionsTabSeenAt: createdAt,
  };
};

/* Fixed by Codex on 2026-02-26
   Who: Codex
   What: Added a persisted notification activity store for bell/system/mentions seen timestamps.
   Why: "New" indicators should reflect unseen activity and clear when users open bell or tabs, independent of read/unread status.
   How: Store per-user last-seen timestamps for the bell and each notifications tab, with owner scoping to avoid cross-account leakage. */
export const useNotificationActivityStore = create<NotificationActivityState>()(
  persist(
    (set) => ({
      ...EMPTY_ACTIVITY_STATE,

      setOwnerIfNeeded: (userId) => {
        set((state) => {
          if (state.ownerUserId === userId) {
            return state;
          }

          return createStateForOwner(userId);
        });
      },

      markBellSeen: (userId) => {
        set((state) => {
          const now = Date.now();
          if (state.ownerUserId !== userId) {
            return {
              ...createStateForOwner(userId),
              lastBellSeenAt: now,
            };
          }

          return {
            lastBellSeenAt: now,
          };
        });
      },

      markSystemTabSeen: (userId) => {
        set((state) => {
          const now = Date.now();
          if (state.ownerUserId !== userId) {
            return {
              ...createStateForOwner(userId),
              lastSystemTabSeenAt: now,
            };
          }

          return {
            lastSystemTabSeenAt: now,
          };
        });
      },

      markMentionsTabSeen: (userId) => {
        set((state) => {
          const now = Date.now();
          if (state.ownerUserId !== userId) {
            return {
              ...createStateForOwner(userId),
              lastMentionsTabSeenAt: now,
            };
          }

          return {
            lastMentionsTabSeenAt: now,
          };
        });
      },

      reset: () => {
        set({
          ...EMPTY_ACTIVITY_STATE,
        });
      },
    }),
    {
      name: 'notification-activity-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
