import { create } from 'zustand';

type EphemeralEntityType = 'discussion' | 'comment' | 'reply';

interface EphemeralUnreadState {
  items: Record<string, number>;
  markItemUnread: (entityType: EphemeralEntityType, entityId: number) => void;
  clearItemUnread: (entityType: EphemeralEntityType, entityId: number) => void;
  isItemUnread: (entityType: EphemeralEntityType, entityId: number) => boolean;
  cleanupExpired: () => void;
}

const EPHEMERAL_TTL_MS = 6 * 60 * 60 * 1000;

const getKey = (entityType: EphemeralEntityType, entityId: number) => `${entityType}:${entityId}`;

/* Fixed by Codex on 2026-02-15
   Who: Codex
   What: Added an ephemeral unread store for realtime-only NEW badges.
   Why: Realtime events can arrive before backend unread flags, so items lacked immediate NEW indicators.
   How: Track entity keys with timestamps and TTL, clearing on read or expiry. */
export const useEphemeralUnreadStore = create<EphemeralUnreadState>((set, get) => ({
  items: {},

  markItemUnread: (entityType, entityId) => {
    const key = getKey(entityType, entityId);
    const now = Date.now();
    set((state) => ({
      items: {
        ...state.items,
        [key]: now,
      },
    }));
  },

  clearItemUnread: (entityType, entityId) => {
    const key = getKey(entityType, entityId);
    set((state) => {
      if (!(key in state.items)) return state;
      const { [key]: _removed, ...rest } = state.items;
      return { items: rest };
    });
  },

  isItemUnread: (entityType, entityId) => {
    const key = getKey(entityType, entityId);
    const timestamp = get().items[key];
    if (!timestamp) return false;
    return Date.now() - timestamp < EPHEMERAL_TTL_MS;
  },

  cleanupExpired: () => {
    const now = Date.now();
    set((state) => {
      const next: Record<string, number> = {};
      Object.entries(state.items).forEach(([key, timestamp]) => {
        if (now - timestamp < EPHEMERAL_TTL_MS) {
          next[key] = timestamp;
        }
      });
      return { items: next };
    });
  },
}));
