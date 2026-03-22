import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { myappFlagsApiRemoveFlags } from '@/api/flags/flags';
import { EntityType, FlagType } from '@/api/schemas';

/**
 * Store for tracking read items locally and syncing with backend.
 *
 * Flow:
 * 1. When user views an unread item, mark it as read locally (immediate UI update)
 * 2. Every 2 minutes, sync read items with backend (batch delete flags)
 * 3. After successful sync, clear only the pendingSyncItems (readItems stays permanent)
 *
 * Key data structures:
 * - readItems: Permanent record of all items marked as read (never cleared until logout)
 * - pendingSyncItems: Items waiting to be synced to backend
 * - clearedArticles: Articles where user has viewed items (for sidebar state)
 *
 * This approach:
 * - Provides immediate UI feedback (no waiting for API)
 * - Batches API calls efficiently
 * - Prevents items from showing as "NEW" again after sync (readItems is permanent)
 */

// Sync interval: 2 minutes
const SYNC_INTERVAL_MS = 2 * 60 * 1000;

interface PendingSyncItem {
  entityId: number;
  entityType: EntityType;
  articleKey: string; // `${communityId}-${articleId}` for tracking
  timestamp: number;
}

interface ReadItemsState {
  // Permanent record of all items marked as read (never cleared until logout)
  // Key format: `${entityId}-${entityType}`
  readItems: Set<string>;

  // Items pending sync to backend (cleared after successful sync)
  pendingSyncItems: PendingSyncItem[];

  // Articles where user has viewed items - for sidebar state
  // Key format: `${communityId}-${articleId}`
  clearedArticles: Set<string>;

  // Actions
  markItemRead: (
    entityId: number,
    entityType: EntityType,
    communityId: number,
    articleId: number
  ) => void;
  /** Mark an article as cleared (user clicked on sidebar tile, assume all read) */
  markArticleCleared: (communityId: number, articleId: number) => void;
  /** Remove article from cleared state (when API indicates new unread events) */
  removeArticleCleared: (communityId: number, articleId: number) => void;
  isItemRead: (entityId: number, entityType: EntityType) => boolean;
  isArticleCleared: (communityId: number, articleId: number) => boolean;
  clearSyncedItems: (syncedItems: PendingSyncItem[]) => void;
  getPendingSync: () => PendingSyncItem[];
  reset: () => void;
}

const getArticleKey = (communityId: number, articleId: number) => `${communityId}-${articleId}`;
const getItemKey = (entityId: number, entityType: EntityType) => `${entityId}-${entityType}`;

export const useReadItemsStore = create<ReadItemsState>()(
  persist(
    (set, get) => ({
      readItems: new Set(),
      pendingSyncItems: [],
      clearedArticles: new Set(),

      markItemRead: (entityId, entityType, communityId, articleId) => {
        const itemKey = getItemKey(entityId, entityType);
        const articleKey = getArticleKey(communityId, articleId);

        set((state) => {
          // Check if already marked as read in permanent set
          if (state.readItems.has(itemKey)) {
            // Still ensure article is marked as cleared
            if (!state.clearedArticles.has(articleKey)) {
              const newClearedArticles = new Set(state.clearedArticles);
              newClearedArticles.add(articleKey);
              return { clearedArticles: newClearedArticles };
            }
            return state;
          }

          // Add to permanent read items set
          const newReadItems = new Set(state.readItems);
          newReadItems.add(itemKey);

          // Add to pending sync (if not already there)
          const alreadyPending = state.pendingSyncItems.some(
            (item) => item.entityId === entityId && item.entityType === entityType
          );

          const newPendingSyncItems = alreadyPending
            ? state.pendingSyncItems
            : [
                ...state.pendingSyncItems,
                {
                  entityId,
                  entityType,
                  articleKey,
                  timestamp: Date.now(),
                },
              ];

          // Mark article as cleared
          const newClearedArticles = new Set(state.clearedArticles);
          newClearedArticles.add(articleKey);

          return {
            readItems: newReadItems,
            pendingSyncItems: newPendingSyncItems,
            clearedArticles: newClearedArticles,
          };
        });
      },

      markArticleCleared: (communityId, articleId) => {
        const articleKey = getArticleKey(communityId, articleId);

        set((state) => {
          if (state.clearedArticles.has(articleKey)) {
            return state;
          }

          const newClearedArticles = new Set(state.clearedArticles);
          newClearedArticles.add(articleKey);
          return { clearedArticles: newClearedArticles };
        });
      },

      removeArticleCleared: (communityId, articleId) => {
        const articleKey = getArticleKey(communityId, articleId);

        set((state) => {
          if (!state.clearedArticles.has(articleKey)) {
            return state;
          }

          const newClearedArticles = new Set(state.clearedArticles);
          newClearedArticles.delete(articleKey);
          return { clearedArticles: newClearedArticles };
        });
      },

      isItemRead: (entityId, entityType) => {
        const itemKey = getItemKey(entityId, entityType);
        return get().readItems.has(itemKey);
      },

      isArticleCleared: (communityId, articleId) => {
        const articleKey = getArticleKey(communityId, articleId);
        return get().clearedArticles.has(articleKey);
      },

      clearSyncedItems: (syncedItems) => {
        set((state) => {
          // Only remove from pendingSyncItems, NOT from readItems or clearedArticles
          const syncedIds = new Set(
            syncedItems.map((item) => getItemKey(item.entityId, item.entityType))
          );

          const remainingItems = state.pendingSyncItems.filter(
            (item) => !syncedIds.has(getItemKey(item.entityId, item.entityType))
          );

          return {
            pendingSyncItems: remainingItems,
            // readItems and clearedArticles stay intact!
          };
        });
      },

      getPendingSync: () => {
        return get().pendingSyncItems;
      },

      reset: () => {
        set({
          readItems: new Set(),
          pendingSyncItems: [],
          clearedArticles: new Set(),
        });
      },
    }),
    {
      name: 'read-items-storage',
      storage: createJSONStorage(() => localStorage),
      // Custom serialization for Sets
      partialize: (state) => ({
        readItems: Array.from(state.readItems),
        pendingSyncItems: state.pendingSyncItems,
        clearedArticles: Array.from(state.clearedArticles),
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      merge: (persisted: any, current) => ({
        ...current,
        readItems: new Set(persisted?.readItems || []),
        pendingSyncItems: persisted?.pendingSyncItems || [],
        clearedArticles: new Set(persisted?.clearedArticles || []),
      }),
    }
  )
);

// Sync manager - handles periodic sync with backend
let syncTimer: ReturnType<typeof setInterval> | null = null;
let isSyncing = false;

export async function syncReadItemsWithBackend(accessToken: string | null) {
  if (!accessToken || isSyncing) return;

  const pendingSync = useReadItemsStore.getState().getPendingSync();
  if (pendingSync.length === 0) return;

  isSyncing = true;

  try {
    // Group by entity type for batch calls
    const groupedByType = pendingSync.reduce(
      (acc, item) => {
        if (!acc[item.entityType]) {
          acc[item.entityType] = [];
        }
        acc[item.entityType].push(item.entityId);
        return acc;
      },
      {} as Record<EntityType, number[]>
    );

    // Make batch API calls for each entity type
    const promises = Object.entries(groupedByType).map(async ([entityType, entityIds]) => {
      try {
        await myappFlagsApiRemoveFlags(
          {
            entity_ids: entityIds,
            entity_type: entityType as EntityType,
            flag_type: FlagType.unread,
          },
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        return { success: true, entityType, entityIds };
      } catch (error) {
        console.error(`Failed to sync read flags for ${entityType}:`, error);
        return { success: false, entityType, entityIds };
      }
    });

    const results = await Promise.all(promises);

    // Clear successfully synced items
    const successfulItems = pendingSync.filter((item) => {
      const result = results.find((r) => r.entityType === item.entityType);
      return result?.success && result.entityIds.includes(item.entityId);
    });

    if (successfulItems.length > 0) {
      useReadItemsStore.getState().clearSyncedItems(successfulItems);
    }
  } catch (error) {
    console.error('Failed to sync read items with backend:', error);
  } finally {
    isSyncing = false;
  }
}

export function startSyncTimer(getAccessToken: () => string | null) {
  if (syncTimer) return;

  // Initial sync after a short delay
  setTimeout(() => {
    syncReadItemsWithBackend(getAccessToken());
  }, 5000);

  // Periodic sync every 2 minutes
  syncTimer = setInterval(() => {
    syncReadItemsWithBackend(getAccessToken());
  }, SYNC_INTERVAL_MS);
}

export function stopSyncTimer() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}

// Sync on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    // Try to sync immediately on page unload
    const pendingSync = useReadItemsStore.getState().getPendingSync();
    if (pendingSync.length > 0) {
      // Use sendBeacon for reliable delivery on page unload
      // Note: This is a simplified approach - in production you might want to use sendBeacon
      // For now, we rely on the periodic sync and localStorage persistence
    }
  });
}
